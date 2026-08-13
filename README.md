# WebsiteGeek Image Suite

**Will be live at [websitegeek.net/image-suite](https://websitegeek.net/image-suite/)**

A sibling product to [WebsiteGeek SEO Suite](https://websitegeek.net/seo-tools/), [WebsiteGeek File Suite](https://websitegeek.net/file-suite/), and [WebsiteGeek WebTools Suite](https://websitegeek.net/web-tools/) — free, browser-based image tools (compress, convert, crop, edit, label). Same architecture: React + Vite SPA, no signup required for free tools, nothing you upload is ever sent to a server. SEO Suite's brand color is dark blue, File Suite's is orange, WebTools Suite's is indigo (`#0f0390`), this one is teal (`#0D9488`) — same layout language, visually distinct products.

## Status

**Scaffolded, not yet built.** All 35 tools exist as route stubs (`ToolPlaceholder`) in `src/data/toolsConfig.js` — none have real implementations yet. This mirrors how every other suite in this family started: config + routing + shared infra first, tools built afterward in scoped batches.

**Full planned tool roster (35), organized into 7 categories:**
- Basic Editing (6): Compress & Resize, Image Format Converter (PNG/JPG/WebP/AVIF/SVG/HEIC), Crop (square/rectangle/circle/triangle/oval), Flip, Rotate, Straighten Photo
- Effects & Filters (5): Blur, Sharpen, Xerox/High-Contrast B&W Effect, Round Corner Image, Border Image
- Color Tools (2): Image Color Picker, Color Palette of Image
- Creative Tools (4): Merge Images/Collage Maker, Polaroid Image Maker, Add Text to Image, Watermark Image
- Metadata & Print (6): EXIF Remover, EXIF Editor, DPI Converter, DPI Checker, Photo Print Size Checker, Add Date & Timestamp
- Specialty Tools (7): Background Remover, Passport Photo Maker, Profile Picture Maker, Instagram Grid Maker, Image Steganography, ASCII Art Generator, HEIC Viewer
- Bulk Tools (5): Bulk Photo Date Stamper, Bulk Copyright Watermark Adder, Bulk Social Media Stamper, Bulk Logo Adder, Bulk Product Labeler

**Feasibility was scoped before any code was written.** Every tool on this list is honestly buildable free, client-side, with no paid API — unlike some categories in sibling products (e.g. Backlinks/DA Checkers in SEO Suite, which were correctly ruled out). Effort varies: most tools are direct Canvas 2D API work; a handful (raster→SVG vectorization, smart AI background removal, real document deskew) need heavier free libraries (ONNX/TensorFlow.js, OpenCV.js) and are deliberately sequenced later, not assumed to be equal-effort with a basic crop/resize tool.

**Pro gating model decided up front** (unusual — every other suite added gating near the end): unlike WebTools Suite's per-tool feature/format unlocks, Image Suite follows File Suite's model since it's the same kind of product (batch photo processing, not single-shot dev utilities) — batch-size limits (5–10 files free → 100 Pro) on the 5 Bulk tools, plus adjustable-control-depth gates (fixed default free → adjustable level/color/template Pro) on Round Corner, Border, Add Text, Polaroid, Merge/Collage, Instagram Grid, and Passport Photo Maker. Smart background removal is Pro-only outright once built. Everything else stays fully free and unlimited.

**Pro tier:** $39 one-time purchase (not $29, despite File Suite's identical gating model — priced against competitor annual subscriptions in this space, which commonly run $59–$109/yr, rather than matched to a sibling product's price). Not yet wired into the shared `websitegeek-seo-suite-api` backend — needs an `image-suite` product entry, a Stripe Price ID, and product-aware updates to `hasPurchased.js`/`create-checkout-session.js`/`subscription-status.js` (same pattern used when WebTools Suite and File Suite were added).

**No hosted logo yet.** `Sidebar.jsx` currently renders an inline placeholder SVG glyph (teal square, checkmark + swoosh) instead of a hosted `LOGO_URL` image — swap this for a real hosted logo using the same pattern as the other 3 suites once one exists.

**Next up:** build the tools, in roughly the order laid out in the scoping discussion — Basic Editing and Effects/Filters first (lowest effort, most reused patterns from File Suite's existing image tools), Bulk tools right after their singular counterparts, heavier Specialty tools (AI background removal, real deskew) last.

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173/image-suite/` (base path matches the planned deploy target `https://websitegeek.net/image-suite/`).

```bash
npm run build
```

Output goes to `dist/`.

## Project structure

Mirrors WebTools Suite's structure (itself mirroring File Suite) — see those projects' READMEs for the general pattern (`components/`, `context/`, `data/`, `pages/`, `tools/`). `src/lib/` is currently empty — WebTools Suite's dev-tool logic (base64, cron, etc.) doesn't apply here; Image Suite will need its own `src/lib/` files for image processing (Canvas helpers, EXIF read/write, steganography, etc.) as each tool is built.
