# WebsiteGeek Image Suite

**Will be live at [websitegeek.net/image-suite](https://websitegeek.net/image-suite/)**

A sibling product to [WebsiteGeek SEO Suite](https://websitegeek.net/seo-tools/), [WebsiteGeek File Suite](https://websitegeek.net/file-suite/), and [WebsiteGeek WebTools Suite](https://websitegeek.net/web-tools/) — free, browser-based image tools (compress, convert, crop, edit, label). Same architecture: React + Vite SPA, no signup required for free tools, nothing you upload is ever sent to a server. SEO Suite's brand color is dark blue, File Suite's is orange, WebTools Suite's is indigo (`#0f0390`), this one is teal (`#0D9488`) — same layout language, visually distinct products.

## Status

**All 35 tools are built and verified.** Build order followed the sequencing laid out during scoping — Basic Editing and Effects & Filters first (lowest effort, most reusable patterns), Bulk tools right after their single-image counterparts, heavier Specialty tools last.

**Full tool roster (35), organized into 7 categories:**
- Basic Editing (6): Compress & Resize, Image Format Converter, Crop (square/rectangle/circle/triangle/oval), Flip, Rotate, Straighten Photo
- Effects & Filters (5): Blur, Sharpen, Xerox/High-Contrast B&W Effect, Round Corner Image, Border Image
- Color Tools (2): Image Color Picker, Color Palette of Image
- Creative Tools (4): Merge Images/Collage Maker, Polaroid Image Maker, Add Text to Image, Watermark Image
- Metadata & Print (6): EXIF Remover, EXIF Editor, DPI Converter, DPI Checker, Photo Print Size Checker, Add Date & Timestamp
- Specialty Tools (7): Background Remover, Passport Photo Maker, Profile Picture Maker, Instagram Grid Maker, Image Steganography, ASCII Art Generator, HEIC Viewer
- Bulk Tools (5): Bulk Photo Date Stamper, Bulk Copyright Watermark Adder, Bulk Social Media Stamper, Bulk Logo Adder, Bulk Product Labeler

All 35 tools are 100% client-side (Canvas 2D API, no paid API of any kind) — confirmed buildable during scoping, and it held true through the actual build.

**Every non-trivial algorithm was verified for real, not just build-checked**, using the same "call the lib function directly via dynamic import" technique established earlier in this session, plus full browser round-trips through the actual UI:
- Rotation bounding-box math and the largest-inscribed-rectangle formula (Straighten Photo's auto-crop) verified against hand-calculated values for 90° and 45° — exact match.
- Circular/oval/triangular crop clipping verified via pixel sampling (corner transparent, center opaque, correct color) — not just "a download happened."
- Sharpen's unsharp-mask kernel and the Xerox threshold effect verified against synthetic pixel data with known expected output.
- **A real bug was caught and fixed during verification**: ASCII Art's brightness-to-character mapping was initially inverted (a pure-white test image mapped to `@`, the densest character, instead of a space) — caught by testing white/black extremes before shipping, not left for a user to find.
- Steganography (LSB hide/reveal, including a Unicode emoji edge case) and flood-fill background removal both verified via round-trip pixel tests, then re-verified through the actual UI end-to-end (hide a message → download → re-upload → reveal → exact match).
- EXIF read/write/strip verified via a real inject-then-verify round trip (`piexifjs` can't be tested against a canvas-generated JPEG, since canvas never writes EXIF — a synthetic JPEG with known EXIF had to be constructed first).
- Instagram Grid Maker's tile splitting verified pixel-by-pixel against a 3-color test image (red/green/blue tiles, exact match, exact 100×100 dimensions).
- Background Remover's Pro batch-click gate and every batch-size Bulk tool gate verified to correctly block over-limit uploads via the real upgrade modal, not just by reading the code.

**Pro gating model** (decided up front, unusual — every other suite added gating near the end): follows File Suite's model since it's the same kind of product (batch photo processing) — batch-size limits (8 free → 100 Pro) on the 5 Bulk tools, plus adjustable-control-depth gates (fixed default free → adjustable level/color/template Pro) on Round Corner, Border, Add Text, Polaroid, Merge/Collage, Instagram Grid, Passport Photo Maker (country library), and Background Remover (unlimited clicks + auto-corners). Everything else stays fully free and unlimited — nothing was nerfed to create the split.

## Project structure

Mirrors WebTools Suite's structure (itself mirroring File Suite) — see those projects' READMEs for the general pattern (`components/`, `context/`, `data/`, `pages/`, `tools/`). `src/lib/imageCore.js` and `src/lib/exifCore.js` hold this product's own image-processing logic, separate from WebTools Suite's dev-tool `src/lib/` (which doesn't apply here).
