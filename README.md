# merge-video-with-audio

A powerful TypeScript-based tool to merge/replace audio tracks in video files using FFmpeg. This tool automatically searches for edited audio files and replaces the audio in corresponding video files without re-encoding the video stream.

## What is this tool for?

This tool is designed for video editors and content creators who need to:
- Replace the audio track in video files with edited/processed audio
- Maintain video quality by avoiding re-encoding (copy video stream)
- Support multiple audio formats (MP3, WAV, AAC, M4A, FLAC, OGG, WMA, OPUS)
- Batch process multiple videos at once
- Extract audio from video files for editing

## What does it do?

The tool has two operating modes:

### 1. **Extract Mode** (Extract audio from videos)
   - Extracts audio from all video files in a directory
   - Supports MP4, MOV, AVI, MKV, WEBM, FLV, WMV formats
   - Exports to any supported audio format (MP3, WAV, AAC, M4A, FLAC, OGG, WMA, OPUS)
   - Uses optimal codec settings for each format
   - Outputs audio as `{videoname}_audio.{ext}`
   - Preserves audio quality with format-specific parameters

### 2. **Merge Mode** (Replace audio in videos) - Default
   - Scans a directory for video files (MP4, MOV)
   - Looks for corresponding edited audio files with pattern `{videoname}_audio.{ext}`
   - Replaces the video's audio track with the edited audio
   - Outputs new video as `{videoname}_final.mp4`
   - Keeps original video and audio files intact
   - No video re-encoding (fast & quality-preserving)

(you can rename the functions for the syntax of both the **final output** and the **audio source**)

## Features

✅ Supports 8 audio formats: MP3, WAV, AAC, M4A, FLAC, OGG, WMA, OPUS
✅ No video re-encoding (fast processing, maintains quality)
✅ Automatic file matching by name
✅ Batch processing of multiple videos
✅ Built-in audio extraction function
✅ Cross-platform (Windows, macOS, Linux)

## Prerequisites

- **FFmpeg** must be installed and available in your system PATH
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg` or `sudo yum install ffmpeg`
- **Bun** runtime (or Node.js with TypeScript)

## Installation

> Only deps are typescript..

```bash
# Clone or download this repository
cd merge-video-with-audio

# Install dependencies
bun install
```

## Quick Start

### Complete Workflow (Extract → Edit → Merge)

```bash
# Step 1: Extract audio from videos
MODE=extract EXTRACT_FORMAT=mp3 bun run index.ts

# Step 2: Edit the extracted *_audio.mp3 files in your audio editor
#         (Audacity, Adobe Audition, etc.)

# Step 3: Save/rename edited audio files as *_audio.mp3

# Step 4: Merge edited audio back into videos
bun run index.ts

# Done! You now have *_final.mp4 files with replaced audio
```

## Detailed Usage

### Mode 1: Extract Audio from Videos

Extract audio from all videos in a directory:

```bash
# Extract to MP3 (default)
MODE=extract bun run index.ts

# Extract to WAV (uncompressed)
MODE=extract EXTRACT_FORMAT=wav bun run index.ts

# Extract to FLAC (lossless)
MODE=extract EXTRACT_FORMAT=flac bun run index.ts

# Extract from specific directory
MODE=extract EXTRACT_FORMAT=mp3 DIR=/path/to/videos bun run index.ts
```

**Supported extraction formats:** mp3, wav, aac, m4a, flac, ogg, wma, opus

This will create `{videoname}_audio.{format}` files for each video.

### Mode 2: Merge Edited Audio with Videos (Default)

1. Extract audio from your videos (using extract mode above)
2. Edit the audio files in your preferred audio editor
3. Rename edited files to `{videoname}_audio.{format}` (instead of `_audio`)
4. Run the merge mode:

```bash
# Merge audio with videos in current directory
bun run index.ts

# Or explicitly set merge mode
MODE=merge bun run index.ts

# Merge in specific directory
DIR=/path/to/videos bun run index.ts
```

This will create `{videoname}_final.mp4` files with the replaced audio.

### File Structure Examples

#### Example 1: Extract Audio Workflow

**Step 1 - Initial state:**
```
my-videos/
└── vacation.mp4
```

**Step 2 - Run extract mode:**
```bash
MODE=extract EXTRACT_FORMAT=mp3 DIR=my-videos bun run index.ts
```

**Result:**
```
my-videos/
├── vacation.mp4
└── vacation_audio.mp3     ✅ Extracted
```

**Step 3 - Edit audio and rename:**
```
my-videos/
├── vacation.mp4
├── vacation_audio.mp3     (original, can keep or delete)
└── vacation_audio.mp3    (edited version)
```

**Step 4 - Run merge mode:**
```bash
DIR=my-videos bun run index.ts
```

**Final result:**
```
my-videos/
├── vacation.mp4           (original)
├── vacation_audio.mp3    (edited audio)
└── vacation_final.mp4     ✅ New video with replaced audio
```

#### Example 2: Batch Audio Extraction

**Initial state:**
```
project/
├── intro.mp4
├── main-content.mov
└── outro.mp4
```

**Run extract mode:**
```bash
MODE=extract EXTRACT_FORMAT=wav DIR=project bun run index.ts
```

**Result:**
```
project/
├── intro.mp4
├── intro_audio.wav        ✅ Extracted
├── main-content.mov
├── main-content_audio.wav ✅ Extracted
├── outro.mp4
└── outro_audio.wav        ✅ Extracted
```

#### Example 3: Multiple videos with different audio formats

```
project/
├── intro.mp4
├── intro_audio.wav
├── main-content.mov
├── main-content_audio.aac
├── outro.mp4
└── outro_audio.flac
```

**Result:**
```
project/
├── intro.mp4
├── intro_audio.wav
├── intro_final.mp4        ✅ Created
├── main-content.mov
├── main-content_audio.aac
├── main-content_final.mp4 ✅ Created
├── outro.mp4
├── outro_audio.flac
└── outro_final.mp4        ✅ Created
```

#### Example 4: Mixed scenarios (merge mode)

```
videos/
├── interview.mp4
├── interview_audio.opus
├── tutorial.mp4           (no edited audio - will be skipped)
├── vlog.mov
└── vlog_audio.m4a
```

**Console Output:**
```
Replacing audio in: interview.mp4 with interview_audio.opus -> interview_final.mp4
No edited audio file found for: tutorial.mp4
Replacing audio in: vlog.mov with vlog_audio.m4a -> vlog_final.mp4
```

## Supported Audio Formats

| Format | Extension | Codec | Use Case |
|--------|-----------|-------|----------|
| MP3 | `.mp3` | libmp3lame | Universal compatibility |
| WAV | `.wav` | pcm_s16le | Uncompressed, high quality |
| AAC | `.aac` | aac | Modern, efficient compression |
| M4A | `.m4a` | aac | Apple ecosystem |
| FLAC | `.flac` | flac | Lossless compression |
| OGG | `.ogg` | libvorbis | Open source, good quality |
| WMA | `.wma` | wmav2 | Windows Media |
| OPUS | `.opus` | libopus | Best quality/size ratio |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODE` | `merge` | Operation mode: `extract` or `merge` |
| `EXTRACT_FORMAT` | `mp3` | Audio format for extraction (mp3, wav, aac, m4a, flac, ogg, wma, opus) |
| `DIR` | `current directory` | Directory containing video files |

### Platform-Specific Examples

**Windows (PowerShell):**
```powershell
# Extract mode
$env:MODE="extract"; $env:EXTRACT_FORMAT="mp3"; bun run index.ts

# Merge mode with custom directory
$env:DIR="C:\Users\YourName\Videos"; bun run index.ts
```

**macOS/Linux (Bash/Zsh):**
```bash
# Extract mode
MODE=extract EXTRACT_FORMAT=mp3 bun run index.ts

# Merge mode with custom directory
DIR=/home/user/videos bun run index.ts
```

### Customize output filename

Edit the `outFileNameGenerator` function:

```typescript
// Default: video_final.mp4
const outFileNameGenerator = (base: string) => `${base}_final.mp4`;

// Custom: video_merged.mp4
const outFileNameGenerator = (base: string) => `${base}_merged.mp4`;
```

### Replace original file (use with caution!)

Uncomment this line in the code:

```typescript
fs.renameSync(outFile, videoPath);
```

⚠️ **Warning:** This will overwrite your original video file!

## Troubleshooting

### "ffmpeg not found" error
Make sure FFmpeg is installed and in your system PATH.

```bash
# Test if FFmpeg is available
ffmpeg -version
```

### "Unsupported format" error
Check that your audio file extension matches one of the supported formats (mp3, wav, aac, m4a, flac, ogg, wma, opus).

### Video plays but no audio
- Verify the audio file plays correctly in a media player
- Check FFmpeg output for codec errors
- Try a different audio format (WAV or AAC are most compatible)

### Slow processing
The tool uses `-c:v copy` to avoid re-encoding video, making it very fast. If it's slow:
- Check your disk I/O speed
- Ensure FFmpeg is properly installed
- Large video files naturally take longer

## Technical Details

- **Video codec**: Copy (no re-encoding)
- **Audio mapping**: Uses `-map 0:v:0 -map 1:a:0` for precise stream selection
- **Shortest**: Uses `-shortest` flag to match video/audio length
- **Overwrite**: Uses `-y` flag to overwrite existing output files

## License

This project is created using [Bun](https://bun.sh) runtime.

---

**Project created with** `bun init` in bun v1.1.27
