import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Directory with the files
const DIR = process.env.DIR || process.cwd();

// Mode: 'extract' or 'merge' (default)
// if you run extract, it will generate audio files of the video file, which you can then edit before running a merge again.
const MODE = process.env.MODE || 'merge';

// Format for audio extraction (default: mp3)
const EXTRACT_FORMAT = process.env.EXTRACT_FORMAT || 'mp3';

// Change this function if you want to do "different naming for the final, edited files."
const outFileNameGenerator = (base: string) => `${base}_final.mp4`;

const audioFileSyntax = (base: string, format: string) => `${base}_audio.${format}`;

// Supported audio formats
const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma', 'opus'];

// Audio extraction configurations for each format
interface AudioExtractionConfig {
  extension: string;
  codec: string;
  extraParams?: string;
}

const AUDIO_EXTRACTION_CONFIGS: Record<string, AudioExtractionConfig> = {
  mp3: { extension: 'mp3', codec: 'libmp3lame', extraParams: '-q:a 2' },
  wav: { extension: 'wav', codec: 'pcm_s16le' },
  aac: { extension: 'aac', codec: 'aac', extraParams: '-b:a 192k' },
  m4a: { extension: 'm4a', codec: 'aac', extraParams: '-b:a 192k' },
  flac: { extension: 'flac', codec: 'flac' },
  ogg: { extension: 'ogg', codec: 'libvorbis', extraParams: '-q:a 6' },
  wma: { extension: 'wma', codec: 'wmav2', extraParams: '-b:a 192k' },
  opus: { extension: 'opus', codec: 'libopus', extraParams: '-b:a 128k' }
};

// Extract audio from video file to specific format
const extractAudioFromVideo = (videoPath: string, outputPath: string, format: string): void => {
  const config = AUDIO_EXTRACTION_CONFIGS[format];
  if (!config) {
    console.error(`Unsupported format: ${format}`);
    return;
  }

  const extraParams = config.extraParams || '';
  const cmd = `ffmpeg -y -i "${videoPath}" -vn -acodec ${config.codec} ${extraParams} "${outputPath}"`;
  console.log(`Extracting audio: ${path.basename(videoPath)} -> ${path.basename(outputPath)} (${format.toUpperCase()})`);
  execSync(cmd);
};

// Find the audio file for the given base name with any supported format
const findAudioFile = (base: string): string | null => {
  for (const ext of SUPPORTED_AUDIO_FORMATS) {
    const audioFile = audioFileSyntax(base, ext);
    const audioPath = path.join(DIR, audioFile);
    if (fs.existsSync(audioPath)) {
      return audioFile;
    }
  }
  return null;
};

// Extract audio from all videos in directory
const extractAudioMode = (): void => {
  console.log(`\n=== EXTRACT MODE ===`);
  console.log(`Directory: ${DIR}`);
  console.log(`Format: ${EXTRACT_FORMAT.toUpperCase()}\n`);

  if (!AUDIO_EXTRACTION_CONFIGS[EXTRACT_FORMAT]) {
    console.error(`Error: Unsupported format '${EXTRACT_FORMAT}'`);
    console.log(`Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DIR);
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i.test(f));

  if (videoFiles.length === 0) {
    console.log('No video files found in directory.');
    return;
  }

  console.log(`Found ${videoFiles.length} video file(s).\n`);

  videoFiles.forEach(videoFile => {
    const base = path.parse(videoFile).name;
    const videoPath = path.join(DIR, videoFile);
    const audioOutputPath = path.join(DIR, `${base}_audio.${EXTRACT_FORMAT}`);

    try {
      extractAudioFromVideo(videoPath, audioOutputPath, EXTRACT_FORMAT);
      console.log(`✓ Success: ${path.basename(audioOutputPath)}\n`);
    } catch (error) {
      console.error(`✗ Failed to extract audio from ${videoFile}`);
      console.error(error instanceof Error ? error.message : String(error));
      console.log('');
    }
  });

  console.log('Extraction complete!');
};

// Merge edited audio with videos
const mergeAudioMode = (): void => {
  console.log(`\n=== MERGE MODE ===`);
  console.log(`Directory: ${DIR}\n`);

  const files = fs.readdirSync(DIR);
  const videoFiles = files.filter(f => /\.(mp4|mov)$/i.test(f));

  if (videoFiles.length === 0) {
    console.log('No video files found in directory.');
    return;
  }

  console.log(`Found ${videoFiles.length} video file(s).\n`);

  let processedCount = 0;
  let skippedCount = 0;

  videoFiles.forEach(videoFile => {
    const base = path.parse(videoFile).name;
    const audioFile = findAudioFile(base);

    if (audioFile) {
      const audioPath = path.join(DIR, audioFile);
      const videoPath = path.join(DIR, videoFile);
      const outFile = path.join(DIR, outFileNameGenerator(base));

      try {
        // ffmpeg command: Video + new audio track, no re-encoding of video
        const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outFile}"`;
        console.log(`Replacing audio in: ${videoFile} with ${audioFile}`);
        execSync(cmd, { stdio: 'inherit' });
        console.log(`✓ Created: ${path.basename(outFile)}\n`);
        processedCount++;

        // Optional: Rename original video, replace, etc.
        // fs.renameSync(outFile, videoPath);
      } catch (error) {
        console.error(`✗ Failed to process ${videoFile}`);
        console.error(error instanceof Error ? error.message : String(error));
        console.log('');
      }
    } else {
      console.log(`⊘ Skipped: ${videoFile} (no edited audio file found)\n`);
      skippedCount++;
    }
  });

  console.log('=== SUMMARY ===');
  console.log(`Processed: ${processedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Total: ${videoFiles.length}`);
};

// Main execution
console.log('╔════════════════════════════════════════════╗');
console.log('║   Video Audio Merger & Extractor Tool     ║');
console.log('╚════════════════════════════════════════════╝');

if (MODE === 'extract') {
  extractAudioMode();
} else if (MODE === 'merge') {
  mergeAudioMode();
} else {
  console.error(`\nError: Invalid MODE '${MODE}'`);
  console.log(`Valid modes: 'extract' or 'merge'`);
  console.log(`\nUsage examples:`);
  console.log(`  Merge mode:    bun run index.ts`);
  console.log(`  Extract mode:  MODE=extract bun run index.ts`);
  console.log(`  Custom format: MODE=extract EXTRACT_FORMAT=flac bun run index.ts`);
  process.exit(1);
}
