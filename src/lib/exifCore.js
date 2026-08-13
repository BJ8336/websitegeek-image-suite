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

// ---------------------------------------------------------------------
// Camera / shot / location / dimension fields — a curated subset of the
// full EXIF tag set, covering what people actually want to view or edit.
// ---------------------------------------------------------------------

function exifDateToInputValue(raw) {
  const [datePart, timePart] = raw.split(' ')
  const dateFormatted = datePart.replaceAll(':', '-')
  return `${dateFormatted}T${(timePart || '00:00:00').slice(0, 5)}`
}

function inputValueToExifDate(value) {
  const [datePart, timePart] = value.split('T')
  return `${datePart.replaceAll('-', ':')} ${timePart}:00`
}

// EXIF stores shutter speeds as a rational — sub-second exposures are
// conventionally written as "1/N" for readability, matching how every
// camera and photo app displays them.
function rationalToShutterString([num, den]) {
  if (!num || !den) return ''
  const seconds = num / den
  if (seconds >= 1) return `${seconds}`
  return `1/${Math.round(den / num)}`
}

function shutterStringToRational(str) {
  const trimmed = str.trim()
  if (trimmed.includes('/')) {
    const [n, d] = trimmed.split('/').map(Number)
    if (!n || !d) return null
    return [n, d]
  }
  const seconds = Number(trimmed)
  if (!seconds) return null
  return [Math.round(seconds * 1000), 1000]
}

// GPS coordinates are stored as degrees/minutes/seconds rationals plus a
// hemisphere ref (N/S, E/W) — converted here to/from a single signed
// decimal-degrees number, which is what anyone actually typing a location
// into a form expects to use.
function decimalToDms(decimal) {
  const abs = Math.abs(decimal)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = (minFloat - min) * 60
  return [
    [deg, 1],
    [min, 1],
    [Math.round(sec * 100), 100],
  ]
}

function dmsToDecimal(dms) {
  const deg = dms[0][0] / dms[0][1]
  const min = dms[1][0] / dms[1][1]
  const sec = dms[2][0] / dms[2][1]
  return deg + min / 60 + sec / 3600
}

export const ORIENTATION_LABELS = {
  1: 'Normal',
  2: 'Flipped horizontal',
  3: 'Rotated 180°',
  4: 'Flipped vertical',
  5: 'Flipped + rotated 90° CCW',
  6: 'Rotated 90° CW',
  7: 'Flipped + rotated 90° CW',
  8: 'Rotated 90° CCW',
}

export function getCameraFields(dataUrl) {
  let exifObj
  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null }
  }
  const zeroth = exifObj['0th'] || {}
  const exif = exifObj.Exif || {}
  const gps = exifObj.GPS || {}

  const fNumber = exif[piexif.ExifIFD.FNumber]
  const exposureTime = exif[piexif.ExifIFD.ExposureTime]
  const flash = exif[piexif.ExifIFD.Flash]
  const dateTimeOriginal = exif[piexif.ExifIFD.DateTimeOriginal]

  let latitude = ''
  let longitude = ''
  if (gps[piexif.GPSIFD.GPSLatitude] && gps[piexif.GPSIFD.GPSLatitudeRef]) {
    const dec = dmsToDecimal(gps[piexif.GPSIFD.GPSLatitude])
    latitude = gps[piexif.GPSIFD.GPSLatitudeRef] === 'S' ? -dec : dec
  }
  if (gps[piexif.GPSIFD.GPSLongitude] && gps[piexif.GPSIFD.GPSLongitudeRef]) {
    const dec = dmsToDecimal(gps[piexif.GPSIFD.GPSLongitude])
    longitude = gps[piexif.GPSIFD.GPSLongitudeRef] === 'W' ? -dec : dec
  }

  return {
    make: zeroth[piexif.ImageIFD.Make] || '',
    model: zeroth[piexif.ImageIFD.Model] || '',
    lensModel: exif[piexif.ExifIFD.LensModel] || '',
    aperture: fNumber ? (fNumber[0] / fNumber[1]).toFixed(1) : '',
    shutterSpeed: exposureTime ? rationalToShutterString(exposureTime) : '',
    iso: exif[piexif.ExifIFD.ISOSpeedRatings] || '',
    flashFired: typeof flash === 'number' ? (flash & 0x1) === 1 : false,
    dateTime: dateTimeOriginal ? exifDateToInputValue(dateTimeOriginal) : '',
    latitude,
    longitude,
    imageWidth: zeroth[piexif.ImageIFD.ImageWidth] || '',
    imageLength: zeroth[piexif.ImageIFD.ImageLength] || '',
    orientation: zeroth[piexif.ImageIFD.Orientation] || 1,
  }
}

export function setCameraFields(dataUrl, fields) {
  let exifObj
  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null }
  }
  const zeroth = { ...exifObj['0th'] }
  const exif = { ...exifObj.Exif }
  const gps = { ...exifObj.GPS }

  if (fields.make) zeroth[piexif.ImageIFD.Make] = fields.make
  if (fields.model) zeroth[piexif.ImageIFD.Model] = fields.model
  if (fields.lensModel) exif[piexif.ExifIFD.LensModel] = fields.lensModel

  if (fields.aperture) exif[piexif.ExifIFD.FNumber] = [Math.round(Number(fields.aperture) * 10), 10]
  if (fields.shutterSpeed) {
    const rational = shutterStringToRational(fields.shutterSpeed)
    if (rational) exif[piexif.ExifIFD.ExposureTime] = rational
  }
  if (fields.iso) exif[piexif.ExifIFD.ISOSpeedRatings] = Number(fields.iso)
  exif[piexif.ExifIFD.Flash] = fields.flashFired ? 1 : 0

  if (fields.dateTime) {
    const formatted = inputValueToExifDate(fields.dateTime)
    exif[piexif.ExifIFD.DateTimeOriginal] = formatted
    zeroth[piexif.ImageIFD.DateTime] = formatted
  }

  if (fields.latitude !== '' && fields.latitude !== null && fields.latitude !== undefined) {
    const lat = Number(fields.latitude)
    gps[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S'
    gps[piexif.GPSIFD.GPSLatitude] = decimalToDms(lat)
  }
  if (fields.longitude !== '' && fields.longitude !== null && fields.longitude !== undefined) {
    const lon = Number(fields.longitude)
    gps[piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? 'E' : 'W'
    gps[piexif.GPSIFD.GPSLongitude] = decimalToDms(lon)
  }

  if (fields.imageWidth) zeroth[piexif.ImageIFD.ImageWidth] = Number(fields.imageWidth)
  if (fields.imageLength) zeroth[piexif.ImageIFD.ImageLength] = Number(fields.imageLength)
  if (fields.orientation) zeroth[piexif.ImageIFD.Orientation] = Number(fields.orientation)

  const updated = { ...exifObj, '0th': zeroth, Exif: exif, GPS: gps }
  const exifBytes = piexif.dump(updated)
  return piexif.insert(exifBytes, dataUrl)
}
