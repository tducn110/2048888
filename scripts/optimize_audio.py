from pathlib import Path
import subprocess
import json
import shutil

SOURCE = Path("public/assets/audio")
OUTPUT = Path("public/assets/audio-optimized")

OUTPUT.mkdir(parents=True, exist_ok=True)

# Starting config
MP3_BGM_BITRATE = "128k"
MP3_SFX_BITRATE = "96k"
OGG_SFX_QUALITY = "4"
MAX_DURATION_DELTA_MS = 30.0

def probe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])

def encode_audio(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)

    if src.name == "music.mp3":
        cmd = [
            "ffmpeg", "-y", "-i", str(src), "-vn",
            "-c:a", "libmp3lame", "-b:a", MP3_BGM_BITRATE, str(dst),
        ]
    elif src.suffix.lower() == ".mp3":
        cmd = [
            "ffmpeg", "-y", "-i", str(src), "-vn",
            "-c:a", "libmp3lame", "-b:a", MP3_SFX_BITRATE, str(dst),
        ]
    elif src.suffix.lower() == ".ogg":
        cmd = [
            "ffmpeg", "-y", "-i", str(src), "-vn",
            "-c:a", "libvorbis", "-q:a", OGG_SFX_QUALITY, str(dst),
        ]
    else:
        return False

    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True

print("Starting audio optimization...")

for src in SOURCE.rglob("*"):
    if src.suffix.lower() not in {".mp3", ".ogg"}:
        continue

    relative = src.relative_to(SOURCE)
    dst = OUTPUT / relative

    before_size = src.stat().st_size
    before_duration = probe_duration(src)

    if not encode_audio(src, dst):
        continue

    after_size = dst.stat().st_size
    after_duration = probe_duration(dst)

    duration_delta_ms = abs(after_duration - before_duration) * 1000
    reduction = (1 - after_size / before_size) * 100

    print(f"\n{relative}")
    print(f"  size: {before_size / 1024:.1f} KB -> {after_size / 1024:.1f} KB")
    
    if after_size > before_size:
        print("  RESULT: Output is larger. KEEPING ORIGINAL.")
        shutil.copy2(src, dst)
        continue

    print(f"  saved: {reduction:.1f}%")
    print(f"  duration delta: {duration_delta_ms:.1f} ms")

    if duration_delta_ms > MAX_DURATION_DELTA_MS:
        print(f"  WARNING: duration changed by >{MAX_DURATION_DELTA_MS} ms. REJECTED. KEEPING ORIGINAL.")
        shutil.copy2(src, dst)
        continue

    print("  RESULT: SUCCESS")

print("\nOptimization complete. Files are in", OUTPUT)
