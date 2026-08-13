import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('passport-photo-maker')
const MAX_DISPLAY = 460

// Real public specs. Output pixel size is the mm size rendered at 300 DPI.
const COUNTRIES = [
  { key: 'us', label: 'United States (2×2 in)', aspect: 1, outW: 600, outH: 600, isPro: false },
  { key: 'india', label: 'India (2×2 in)', aspect: 1, outW: 600, outH: 600, isPro: true },
  { key: 'uk', label: 'United Kingdom (35×45mm)', aspect: 35 / 45, outW: 413, outH: 531, isPro: true },
  { key: 'schengen', label: 'Schengen / EU (35×45mm)', aspect: 35 / 45, outW: 413, outH: 531, isPro: true },
  { key: 'australia', label: 'Australia (35×45mm)', aspect: 35 / 45, outW: 413, outH: 531, isPro: true },
  { key: 'canada', label: 'Canada (50×70mm)', aspect: 50 / 70, outW: 591, outH: 827, isPro: true },
]

function PassportPhotoMaker() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [countryKey, setCountryKey] = useState('us')
  const [zoom, setZoom] = useState(0.8)
  const [offset, setOffset] = useState({ x: 0.5, y: 0.4 })
  const [dragStart, setDragStart] = useState(null)
  const [result, setResult] = useState(null)

  const country = COUNTRIES.find((c) => c.key === countryKey)
  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
    setOffset({ x: 0.5, y: 0.4 })
  }

  const handleCountrySelect = (c) => {
    if (c.isPro && !isPro) {
      openUpgradeModal()
      return
    }
    setCountryKey(c.key)
  }

  const boxSize = () => {
    if (!source) return { w: 0, h: 0 }
    const shortSide = Math.min(source.width, source.height) * zoom
    if (country.aspect <= 1) return { w: shortSide * country.aspect, h: shortSide }
    return { w: shortSide, h: shortSide / country.aspect }
  }

  const onPointerDown = (e) => {
    setDragStart({ startClientX: e.clientX, startClientY: e.clientY, startOffset: { ...offset } })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }
  const onPointerMove = (e) => {
    if (!dragStart || !source) return
    const dx = (e.clientX - dragStart.startClientX) / (source.width * scale)
    const dy = (e.clientY - dragStart.startClientY) / (source.height * scale)
    setOffset({
      x: Math.min(1, Math.max(0, dragStart.startOffset.x + dx)),
      y: Math.min(1, Math.max(0, dragStart.startOffset.y + dy)),
    })
  }
  const onPointerUp = () => {
    setDragStart(null)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  const handleGenerate = async () => {
    if (!source) return
    const { w, h } = boxSize()
    const cx = offset.x * source.width
    const cy = offset.y * source.height
    const sx = Math.min(Math.max(0, cx - w / 2), source.width - w)
    const sy = Math.min(Math.max(0, cy - h / 2), source.height - h)

    const canvas = createCanvas(country.outW, country.outH)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(source.img, sx, sy, w, h, 0, 0, country.outW, country.outH)
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95)
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-passport-${countryKey}.jpg`, result.blob, 'image/jpeg')
  }

  const box = boxSize()

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote free="US passport photo spec (2×2 in)." pro="Full country spec library (UK, Schengen/EU, India, Canada, Australia)." />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    countryKey === c.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label} {c.isPro && !isPro && '🔒'}
                </button>
              ))}
            </div>

            <div
              className="relative select-none overflow-hidden rounded-lg border border-slate-300 bg-slate-100"
              style={{ width: source.width * scale, height: source.height * scale }}
            >
              <img
                src={source.img.src}
                alt=""
                draggable={false}
                style={{ width: source.width * scale, height: source.height * scale }}
                className="pointer-events-none"
              />
              <div
                onPointerDown={onPointerDown}
                className="absolute cursor-move border-2 border-teal-500 bg-teal-500/10"
                style={{
                  left: (offset.x * source.width - box.w / 2) * scale,
                  top: (offset.y * source.height - box.h / 2) * scale,
                  width: box.w * scale,
                  height: box.h * scale,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Drag the box to center the face. Use zoom to fit head size.</p>
            <button
              type="button"
              onClick={() => setSource(null)}
              className="mt-1 block text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Zoom</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>
            <p className="mb-4 text-xs text-slate-500">
              Output: {country.outW}×{country.outH}px (white background fill, 300 DPI print size)
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Generate
            </button>

            {result && (
              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <img src={result.url} alt="" className="mx-auto max-h-60 rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Download JPEG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PassportPhotoMaker
