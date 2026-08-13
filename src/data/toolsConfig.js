// Static metadata for every planned tool. Route stubs in App.jsx and the
// homepage tool grid are both generated from this list — add a tool here
// once, it shows up everywhere.

export const TOOL_CATEGORIES = {
  BASIC_EDITING: 'Basic Editing',
  EFFECTS_FILTERS: 'Effects & Filters',
  COLOR_TOOLS: 'Color Tools',
  CREATIVE_TOOLS: 'Creative Tools',
  METADATA_TOOLS: 'Metadata & Print',
  SPECIALTY_TOOLS: 'Specialty Tools',
  BULK_TOOLS: 'Bulk Tools',
}

export const CATEGORY_ORDER = [
  TOOL_CATEGORIES.BASIC_EDITING,
  TOOL_CATEGORIES.EFFECTS_FILTERS,
  TOOL_CATEGORIES.COLOR_TOOLS,
  TOOL_CATEGORIES.CREATIVE_TOOLS,
  TOOL_CATEGORIES.METADATA_TOOLS,
  TOOL_CATEGORIES.SPECIALTY_TOOLS,
  TOOL_CATEGORIES.BULK_TOOLS,
]

export const tools = [
  // --- Basic Editing ---
  {
    slug: 'compress-resize-image',
    name: 'Compress & Resize',
    description: 'Shrink an image by percentage, target file size, or exact dimensions.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },
  {
    slug: 'convert-image-format',
    name: 'Image Format Converter',
    description: 'Convert between PNG, JPG, WebP, AVIF, SVG, and HEIC.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },
  {
    slug: 'crop-image',
    name: 'Crop Image',
    description: 'Crop to a square, rectangle, circle, triangle, or oval.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },
  {
    slug: 'flip-image',
    name: 'Flip Image',
    description: 'Flip an image horizontally or vertically.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },
  {
    slug: 'rotate-image',
    name: 'Rotate Image',
    description: 'Rotate an image to any angle.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },
  {
    slug: 'straighten-photo',
    name: 'Straighten Photo',
    description: 'Level a tilted photo by drawing a reference line, then auto-crop the result.',
    category: TOOL_CATEGORIES.BASIC_EDITING,
  },

  // --- Effects & Filters ---
  {
    slug: 'blur-image',
    name: 'Blur Image',
    description: 'Apply an adjustable blur to an image.',
    category: TOOL_CATEGORIES.EFFECTS_FILTERS,
  },
  {
    slug: 'sharpen-image',
    name: 'Sharpen Image',
    description: 'Sharpen a soft or slightly out-of-focus image.',
    category: TOOL_CATEGORIES.EFFECTS_FILTERS,
  },
  {
    slug: 'xerox-effect',
    name: 'Xerox / High-Contrast B&W Effect',
    description: 'Convert a photo to a high-contrast black-and-white scanned-document look.',
    category: TOOL_CATEGORIES.EFFECTS_FILTERS,
  },
  {
    slug: 'round-corner-image',
    name: 'Round Corner Image',
    description: 'Round the corners of an image, with an adjustable radius.',
    category: TOOL_CATEGORIES.EFFECTS_FILTERS,
    hasProFeatures: true,
  },
  {
    slug: 'border-image',
    name: 'Border Image',
    description: 'Add a border to an image, with adjustable width and color.',
    category: TOOL_CATEGORIES.EFFECTS_FILTERS,
    hasProFeatures: true,
  },

  // --- Color Tools ---
  {
    slug: 'image-color-picker',
    name: 'Image Color Picker',
    description: 'Click anywhere on an image to pick its hex color code.',
    category: TOOL_CATEGORIES.COLOR_TOOLS,
  },
  {
    slug: 'image-color-palette',
    name: 'Color Palette of Image',
    description: "Extract an image's dominant color palette as hex codes.",
    category: TOOL_CATEGORIES.COLOR_TOOLS,
  },

  // --- Creative Tools ---
  {
    slug: 'merge-images-collage',
    name: 'Merge Images / Collage Maker',
    description: 'Combine multiple images into a collage using a frame template.',
    category: TOOL_CATEGORIES.CREATIVE_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'polaroid-image-maker',
    name: 'Polaroid Image Maker',
    description: 'Frame a photo as a classic Polaroid — Pro adds custom caption text.',
    category: TOOL_CATEGORIES.CREATIVE_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'add-text-to-image',
    name: 'Add Text to Image',
    description: 'Overlay text on an image — Pro adds a text background, opacity, color, and size controls.',
    category: TOOL_CATEGORIES.CREATIVE_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'watermark-image',
    name: 'Watermark Image',
    description: 'Add a text or image watermark to a photo.',
    category: TOOL_CATEGORIES.CREATIVE_TOOLS,
  },

  // --- Metadata & Print ---
  {
    slug: 'exif-remover',
    name: 'EXIF Metadata Remover',
    description: 'Strip all EXIF metadata (camera, GPS, timestamps) from an image.',
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },
  {
    slug: 'exif-editor',
    name: 'EXIF Metadata Editor',
    description: 'View and edit EXIF metadata fields on an image.',
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },
  {
    slug: 'dpi-converter',
    name: 'DPI Converter',
    description: 'Change the DPI metadata tag or resample an image to a target print DPI.',
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },
  {
    slug: 'dpi-checker',
    name: 'DPI Checker',
    description: "Check an image's current DPI metadata and effective print resolution.",
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },
  {
    slug: 'photo-print-size-checker',
    name: 'Photo Print Size Checker',
    description: 'See the largest size a photo can be printed at while staying sharp.',
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },
  {
    slug: 'add-date-timestamp',
    name: 'Add Date & Timestamp to Photo',
    description: 'Stamp a date/timestamp onto a photo, old-camera style.',
    category: TOOL_CATEGORIES.METADATA_TOOLS,
  },

  // --- Specialty Tools ---
  {
    slug: 'background-remover',
    name: 'Background Remover',
    description: 'Remove an image background manually — Pro adds one-click smart removal.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    description: 'Crop and format a photo to official passport photo specs.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'profile-picture-maker',
    name: 'Profile Picture Maker',
    description: 'Crop a profile picture with badges, patterns, and simple professional effects.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
  },
  {
    slug: 'instagram-grid-maker',
    name: 'Instagram Grid Maker',
    description: 'Split one image into a 3×1, 3×2, or 3×3 Instagram profile grid.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'image-steganography',
    name: 'Image Steganography Tool',
    description: 'Hide a secret text message inside an image, or reveal a hidden one.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
  },
  {
    slug: 'ascii-art-generator',
    name: 'ASCII Art Generator',
    description: 'Turn an image into ASCII (or Matrix-style) text art.',
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
  },
  {
    slug: 'heic-viewer',
    name: 'HEIC Viewer',
    description: "View an iPhone .HEIC photo in your browser, no conversion needed.",
    category: TOOL_CATEGORIES.SPECIALTY_TOOLS,
  },

  // --- Bulk Tools ---
  {
    slug: 'bulk-photo-date-stamper',
    name: 'Bulk Photo Date Stamper',
    description: 'Stamp each photo with its own EXIF date, across a whole batch.',
    category: TOOL_CATEGORIES.BULK_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'bulk-copyright-watermark',
    name: 'Bulk Copyright Watermark Adder',
    description: 'Add the same copyright watermark across many photos at once.',
    category: TOOL_CATEGORIES.BULK_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'bulk-social-media-stamper',
    name: 'Bulk Social Media Stamper',
    description: 'Stamp an @handle onto many photos at once.',
    category: TOOL_CATEGORIES.BULK_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'bulk-logo-adder',
    name: 'Bulk Logo Adder',
    description: 'Add the same logo watermark across many photos at once.',
    category: TOOL_CATEGORIES.BULK_TOOLS,
    hasProFeatures: true,
  },
  {
    slug: 'bulk-product-labeler',
    name: 'Bulk Product Labeler',
    description: 'Add a consistent label overlay across a batch of product photos.',
    category: TOOL_CATEGORIES.BULK_TOOLS,
    hasProFeatures: true,
  },
]

export function getToolBySlug(slug) {
  return tools.find((tool) => tool.slug === slug)
}

export function getToolsByCategory(category) {
  return tools.filter((tool) => tool.category === category)
}
