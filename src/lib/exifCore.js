import piexif from 'piexifjs'

// EXIF only exists in JPEG (the JFIF APP1 marker) — PNG/WebP have no
// equivalent, so every tool using this must scope itself to JPEG input and
// say so honestly rather than silently doing nothing.
export function isJpeg(file) {
  return file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read this file.'))
    reader.readAsDataURL(file)
  })
}

export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);/)[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}

// Flattened list of every readable EXIF tag across the 0th, Exif, and GPS
// IFDs — throws if the file has no EXIF segment at all (piexif's own
// behavior; callers should catch and show "no EXIF data found").
export function readExifTags(dataUrl) {
  const exifObj = piexif.load(dataUrl)
  const tags = []
  for (const ifd of ['0th', 'Exif', 'GPS']) {
    const dict = exifObj[ifd] || {}
    for (const tagId in dict) {
      const tagInfo = piexif.TAGS[ifd]?.[tagId]
      if (!tagInfo) continue
      tags.push({ ifd, tagId: Number(tagId), name: tagInfo.name, value: dict[tagId] })
    }
  }
  return { exifObj, tags }
}

export function removeExif(dataUrl) {
  return piexif.remove(dataUrl)
}

// DPI is stored as an EXIF rational [numerator, denominator] plus a unit
// flag (2 = inches, 3 = centimeters) — this reads it back as a plain
// inches-based number, or null if the file has no resolution tag at all.
export function getDpi(dataUrl) {
  let exifObj
  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    return null
  }
  const xRes = exifObj['0th']?.[piexif.ImageIFD.XResolution]
  if (!xRes) return null
  const unit = exifObj['0th']?.[piexif.ImageIFD.ResolutionUnit] || 2
  const dpi = xRes[0] / xRes[1]
  return unit === 3 ? Math.round(dpi * 2.54) : Math.round(dpi)
}

export function setDpi(dataUrl, dpi) {
  let exifObj
  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null }
  }
  exifObj['0th'][piexif.ImageIFD.XResolution] = [dpi, 1]
  exifObj['0th'][piexif.ImageIFD.YResolution] = [dpi, 1]
  exifObj['0th'][piexif.ImageIFD.ResolutionUnit] = 2
  const exifBytes = piexif.dump(exifObj)
  return piexif.insert(exifBytes, dataUrl)
}

export function setDateTimeOriginal(dataUrl, date) {
  let exifObj
  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null }
  }
  const formatted = `${date.getFullYear()}:${String(date.getMonth() + 1).padStart(2, '0')}:${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  exifObj.Exif[piexif.ExifIFD.DateTimeOriginal] = formatted
  exifObj['0th'][piexif.ImageIFD.DateTime] = formatted
  const exifBytes = piexif.dump(exifObj)
  return piexif.insert(exifBytes, dataUrl)
}

export function getDateTimeOriginal(dataUrl) {
  try {
    const exifObj = piexif.load(dataUrl)
    const raw = exifObj.Exif?.[piexif.ExifIFD.DateTimeOriginal]
    if (!raw) return null
    const [datePart, timePart] = raw.split(' ')
    const [y, m, d] = datePart.split(':').map(Number)
    const [h, min, s] = (timePart || '00:00:00').split(':').map(Number)
    return new Date(y, m - 1, d, h, min, s)
  } catch {
    return null
  }
}
