// Shared Canvas-based image loading/export helpers used by every tool in
// this suite. Nothing here is tool-specific — it's the "load a file, get
// pixels, export a file" plumbing every tool needs.

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight, file })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load this image — the file may be corrupted or an unsupported format.'))
    }
    img.src = url
  })
}

export function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export this image.'))),
      type,
      quality
    )
  })
}

export const MIME_LABELS = {
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
}

export function extFromMime(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/avif') return 'avif'
  return 'png'
}

// Strips the extension from an original filename so tools can rebuild
// "name.newext" instead of stacking extensions onto whatever was uploaded.
export function baseName(filename) {
  return filename.replace(/\.[^./\\]+$/, '') || 'image'
}

// "Cover" fit: scale so the image fills the target rect with no gaps,
// cropping overflow (as opposed to "contain", which would letterbox).
export function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  const dx = x + (w - drawW) / 2
  const dy = y + (h - drawH) / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.restore()
}

export function drawScaled(img, width, height) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

// Binary-searches the JPEG/WebP quality parameter to approximate a target
// file size — only meaningful for lossy formats (PNG has no quality knob).
export async function compressToTargetSize(canvas, mime, targetBytes, maxIterations = 8) {
  let low = 0.05
  let high = 1
  let best = await canvasToBlob(canvas, mime, high)
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2
    const blob = await canvasToBlob(canvas, mime, mid)
    if (blob.size > targetBytes) {
      high = mid
    } else {
      best = blob
      low = mid
    }
  }
  return best
}

// Rotates an image by `angleDeg` around its center, returning a canvas sized
// to the full rotated bounding box (so nothing gets clipped off).
export function drawRotated(img, width, height, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const outW = Math.round(width * cos + height * sin)
  const outH = Math.round(width * sin + height * cos)
  const canvas = createCanvas(outW, outH)
  const ctx = canvas.getContext('2d')
  ctx.translate(outW / 2, outH / 2)
  ctx.rotate(rad)
  ctx.drawImage(img, -width / 2, -height / 2, width, height)
  return canvas
}

// 3x3 convolution over ImageData, edge pixels clamped to the nearest valid
// pixel rather than treated as zero (avoids a dark fringe around the edge).
export function convolve3x3(imageData, kernel) {
  const { width, height, data } = imageData
  const output = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let b = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx))
          const py = Math.min(height - 1, Math.max(0, y + ky))
          const idx = (py * width + px) * 4
          const kval = kernel[(ky + 1) * 3 + (kx + 1)]
          r += data[idx] * kval
          g += data[idx + 1] * kval
          b += data[idx + 2] * kval
        }
      }
      const outIdx = (y * width + x) * 4
      output[outIdx] = r
      output[outIdx + 1] = g
      output[outIdx + 2] = b
      output[outIdx + 3] = data[outIdx + 3]
    }
  }
  return new ImageData(output, width, height)
}

// amount 0 = no change (identity kernel), higher = stronger unsharp mask.
// Kernel always sums to 1 so overall brightness is preserved.
export function sharpenImageData(imageData, amount) {
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0]
  return convolve3x3(imageData, kernel)
}

// High-contrast black/white "photocopier" look: grayscale, then a hard
// threshold — no gray survives, only pure black or white.
export function xeroxEffect(imageData, threshold) {
  const { data, width, height } = imageData
  const output = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const value = gray >= threshold ? 255 : 0
    output[i] = value
    output[i + 1] = value
    output[i + 2] = value
    output[i + 3] = data[i + 3]
  }
  return new ImageData(output, width, height)
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

// Buckets pixels into coarse RGB cells (16 levels/channel) and returns the
// most frequent cells' averaged colors — a lightweight dominant-color
// extraction, not a full k-means clustering, but good enough for a swatch
// palette. Samples at most ~20k pixels for performance on large images.
export function extractDominantColors(imageData, count = 6) {
  const { data } = imageData
  const totalPixels = data.length / 4
  const step = Math.max(1, Math.floor(totalPixels / 20000))
  const buckets = new Map()

  for (let i = 0; i < data.length; i += 4 * step) {
    const a = data[i + 3]
    if (a < 128) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = `${r >> 4},${g >> 4},${b >> 4}`
    const entry = buckets.get(key)
    if (entry) {
      entry.count++
      entry.r += r
      entry.g += g
      entry.b += b
    } else {
      buckets.set(key, { count: 1, r, g, b })
    }
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((e) => {
      const r = e.r / e.count
      const g = e.g / e.count
      const b = e.b / e.count
      return { hex: rgbToHex(r, g, b), r: Math.round(r), g: Math.round(g), b: Math.round(b), weight: e.count }
    })
}

// 4-connected flood fill from (startX, startY), making every reachable
// pixel within `tolerance` color-distance of the start pixel transparent.
// Iterative (array-as-stack), so no recursion depth limit on large images.
export function floodFillTransparent(imageData, startX, startY, tolerance) {
  const { data, width, height } = imageData
  const output = new Uint8ClampedArray(data)
  const startIdx = (startY * width + startX) * 4
  const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2]]
  const visited = new Uint8Array(width * height)
  const stack = [[startX, startY]]
  const tol2 = tolerance * tolerance * 3

  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || x >= width || y < 0 || y >= height) continue
    const idx = y * width + x
    if (visited[idx]) continue
    visited[idx] = 1
    const pIdx = idx * 4
    const dr = data[pIdx] - startColor[0]
    const dg = data[pIdx + 1] - startColor[1]
    const db = data[pIdx + 2] - startColor[2]
    if (dr * dr + dg * dg + db * db > tol2) continue
    output[pIdx + 3] = 0
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  return new ImageData(output, width, height)
}

// LSB steganography: hides a UTF-8 text message in the least-significant
// bit of each R/G/B channel, prefixed with a 32-bit length header. Must
// stay PNG — any lossy re-compression destroys the hidden bits.
export function encodeMessage(imageData, message) {
  const { data, width, height } = imageData
  const output = new Uint8ClampedArray(data)
  const bytes = new TextEncoder().encode(message)
  const headerBits = []
  for (let i = 31; i >= 0; i--) headerBits.push((bytes.length >> i) & 1)
  const messageBits = []
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) messageBits.push((byte >> i) & 1)
  }
  const allBits = headerBits.concat(messageBits)
  const capacity = width * height * 3
  if (allBits.length > capacity) {
    throw new Error('This message is too long to hide in an image this size.')
  }
  let bitIdx = 0
  for (let i = 0; i < data.length && bitIdx < allBits.length; i += 4) {
    for (let c = 0; c < 3 && bitIdx < allBits.length; c++) {
      output[i + c] = (output[i + c] & 0xfe) | allBits[bitIdx]
      bitIdx++
    }
  }
  return new ImageData(output, width, height)
}

function collectLsbBits(data, count) {
  const bits = []
  for (let i = 0; i < data.length && bits.length < count; i += 4) {
    for (let c = 0; c < 3 && bits.length < count; c++) {
      bits.push(data[i + c] & 1)
    }
  }
  return bits
}

export function decodeMessage(imageData) {
  const { data } = imageData
  const headerBits = collectLsbBits(data, 32)
  let length = 0
  for (const b of headerBits) length = (length << 1) | b
  if (length <= 0 || length > data.length) {
    throw new Error('No hidden message found — or the image was resized/re-compressed after hiding one.')
  }
  const allBits = collectLsbBits(data, 32 + length * 8)
  const messageBits = allBits.slice(32)
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    let byte = 0
    for (let b = 0; b < 8; b++) byte = (byte << 1) | messageBits[i * 8 + b]
    bytes[i] = byte
  }
  return new TextDecoder().decode(bytes)
}

const ASCII_RAMP = '@%#*+=-:. '

// Averages brightness over a grid of cells and maps each cell to a
// character from a light-to-dark ramp. The 0.55 factor corrects for
// monospace characters being taller than they are wide.
export function imageToAscii(imageData, cols = 100) {
  const { data, width, height } = imageData
  const cellW = width / cols
  const rows = Math.max(1, Math.round((height / cellW) * 0.55))
  const cellH = height / rows
  let out = ''
  for (let ry = 0; ry < rows; ry++) {
    let line = ''
    for (let rx = 0; rx < cols; rx++) {
      let sum = 0
      let n = 0
      const x0 = Math.floor(rx * cellW)
      const x1 = Math.floor((rx + 1) * cellW)
      const y0 = Math.floor(ry * cellH)
      const y1 = Math.floor((ry + 1) * cellH)
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4
          sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
          n++
        }
      }
      const avg = n ? sum / n : 255
      const charIdx = Math.min(ASCII_RAMP.length - 1, Math.floor((avg / 255) * ASCII_RAMP.length))
      line += ASCII_RAMP[charIdx]
    }
    out += line + '\n'
  }
  return out
}

// Largest axis-aligned rectangle that fits inside a `w`×`h` rectangle after
// it's been rotated by `angleRad`, so straightening a photo can auto-crop
// away the blank corners the rotation exposes. Classic result, credited to
// a well-known Stack Overflow answer (Coproc) — not something to re-derive
// from scratch each time.
export function largestInscribedRect(w, h, angleRad) {
  let angle = Math.abs(angleRad) % Math.PI
  if (angle > Math.PI / 2) angle = Math.PI - angle
  const widthIsLonger = w >= h
  const sideLong = widthIsLonger ? w : h
  const sideShort = widthIsLonger ? h : w
  const sinA = Math.sin(angle)
  const cosA = Math.cos(angle)

  if (sideShort <= 2 * sinA * cosA * sideLong + 1e-9 || Math.abs(sinA - cosA) < 1e-10) {
    const x = 0.5 * sideShort
    return widthIsLonger ? { w: x / sinA, h: x / cosA } : { w: x / cosA, h: x / sinA }
  }

  const cos2a = cosA * cosA - sinA * sinA
  return {
    w: (w * cosA - h * sinA) / cos2a,
    h: (h * cosA - w * sinA) / cos2a,
  }
}
