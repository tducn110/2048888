"""Convert raster game assets to WebP without modifying the source tree.

The converter deliberately skips existing WebP files. It writes candidates to
the requested output directory and removes any candidate that is not smaller
than its source or does not preserve the source dimensions/alpha channel.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


INPUT_EXTS = {".png", ".jpg", ".jpeg"}


def has_alpha(image: Image.Image) -> bool:
    return image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    )


def convert_image(
    source: Path,
    output_root: Path,
    input_root: Path,
    quality: int,
) -> str:
    relative = source.relative_to(input_root)
    destination = (output_root / relative).with_suffix(".webp")
    destination.parent.mkdir(parents=True, exist_ok=True)

    try:
        with Image.open(source) as original:
            original_dimensions = original.size
            original_has_alpha = has_alpha(original)
            normalized = original.convert("RGBA" if original_has_alpha else "RGB")

            if original_has_alpha:
                normalized.save(destination, "WEBP", lossless=True, method=6)
            else:
                normalized.save(
                    destination,
                    "WEBP",
                    quality=quality,
                    method=6,
                )

        with Image.open(destination) as converted:
            dimensions_match = converted.size == original_dimensions
            alpha_matches = has_alpha(converted) == original_has_alpha

        source_bytes = source.stat().st_size
        converted_bytes = destination.stat().st_size

        if not dimensions_match or not alpha_matches:
            destination.unlink(missing_ok=True)
            return (
                f"[REJECT] {relative}: metadata mismatch "
                f"(dimensions or alpha channel)"
            )

        if converted_bytes >= source_bytes:
            destination.unlink(missing_ok=True)
            return (
                f"[REJECT] {relative}: "
                f"{source_bytes / 1024:.1f} KB -> "
                f"{converted_bytes / 1024:.1f} KB (output is not smaller)"
            )

        saved = (1 - converted_bytes / source_bytes) * 100
        return (
            f"[KEEP] {relative}: "
            f"{source_bytes / 1024:.1f} KB -> "
            f"{converted_bytes / 1024:.1f} KB ({saved:.1f}% saved, "
            f"{original_dimensions[0]}x{original_dimensions[1]})"
        )
    except Exception as exc:
        destination.unlink(missing_ok=True)
        return f"[ERROR] {relative}: {exc}"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert PNG/JPG/JPEG assets to smaller WebP candidates."
    )
    parser.add_argument("input", type=Path, help="Source asset directory")
    parser.add_argument("output", type=Path, help="Separate output directory")
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="Lossy WebP quality for opaque images (default: 82)",
    )
    args = parser.parse_args()

    if not 0 <= args.quality <= 100:
        parser.error("--quality must be between 0 and 100")

    input_root = args.input.resolve()
    output_root = args.output.resolve()

    if not input_root.is_dir():
        raise SystemExit(f"Input directory not found: {input_root}")

    sources = sorted(
        path
        for path in input_root.rglob("*")
        if path.is_file() and path.suffix.lower() in INPUT_EXTS
    )

    print(f"Found {len(sources)} source images under {input_root}.")
    if not sources:
        print("Nothing to convert; existing WebP files are intentionally skipped.")
        return

    kept = rejected = errors = 0
    for source in sources:
        result = convert_image(source, output_root, input_root, args.quality)
        print(result)
        if result.startswith("[KEEP]"):
            kept += 1
        elif result.startswith("[ERROR]"):
            errors += 1
        else:
            rejected += 1

    print(
        f"Summary: {kept} kept, {rejected} rejected, {errors} errors. "
        f"Output: {output_root}"
    )
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
