import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, drawCover, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('polaroid-image-maker')
const DPI = 300

// Real published dimensions for each format. Classic and Go give an exact
// image area, so the border widths are derived from it (thin top/sides,
// thick bottom for the caption strip — the actual Polaroid look). Hi-Print
// is sticker paper with no caption strip and no published image-area
// figure, so it gets a thin uniform border instead — a judgment call, not
// a measured spec, called out in the UI.
const STYLES = [
  {
    key: 'classic',
    label: 'Classic Film (600 / SX-70 / i-Type)',
    totalW: 3.48,
    totalH: 4.23,
    imageW: 3.11,
    imageH: 3.02,
    allowCaption: true,
  },
  {
    key: 'go',
    label: 'Polaroid Go (Mini)',
    totalW: 2.12,
    totalH: 2.62,
    imageW: 1.85,
    imageH: 1.81,
    allowCaption: true,
  },
  {
    key: 'hiprint',
    label: 'Hi-Print (Sticker Paper)',
    totalW: 2.1,
    totalH: 3.4,
    imageW: null,
    imageH: null,
    allowCaption: false,
  },
]

function getLayout(style) {
  const totalW = Math.round(style.totalW * DPI)
  const totalH = Math.round(style.totalH * DPI)

  if (style.imageW && style.imageH) {
    const imageW = Math.round(style.imageW * DPI)
    const imageH = Math.round(style.imageH * DPI)
    const side = Math.round((totalW - imageW) / 2)
    const top = side
    const bottom = totalH - imageH - top
    return { totalW, totalH, imageX: side, imageY: top, imageW, imageH, bottom }
  }

  // Hi-Print: thin uniform border, no caption strip.
  const border = Math.round(0.06 * DPI)
  return {
    totalW,
    totalH,
    imageX: border,
    imageY: border,
    imageW: totalW - border * 2,
    imageH: totalH - border * 2,
    bottom: border,
  }
}

function PolaroidImageMaker() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [styleKey, setStyleKey] = useState('classic')
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState(null)

  const style = STYLES.find((s) => s.key === styleKey)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
  }

  const handleCaptionChange = (value) => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    setCaption(value)
  }

  const handleGenerate = async () => {
    if (!source) return
    const layout = getLayout(style)
    const canvas = createCanvas(layout.totalW, layout.totalH)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 10
    drawCover(ctx, source.img, layout.imageX, layout.imageY, layout.imageW, layout.imageH)
    ctx.shadowColor = 'transparent'

    if (isPro && style.allowCaption && caption.trim()) {
      const fontSize = Math.round(layout.bottom * 0.28)
      ctx.fillStyle = '#1e293b'
      ctx.font = `${fontSize}px 'Segoe UI', sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(caption.trim(), canvas.width / 2, layout.imageY + layout.imageH + layout.bottom / 2 + fontSize / 3, layout.totalW * 0.9)
    }

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-polaroid-${styleKey}.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote free="Classic Polaroid frame around your photo, in 3 real formats." pro="Add your own caption text below the photo." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStyleKey(s.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              styleKey === s.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        {style.totalW.toFixed(2)}×{style.totalH.toFixed(2)} in total
        {style.imageW && ` · ${style.imageW.toFixed(2)}×${style.imageH.toFixed(2)} in image area`}
        {!style.allowCaption && ' · sticker paper, no caption strip'}
      </p>

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={source.img.src} alt="" className="max-h-80 w-full rounded-lg border border-slate-300 object-contain" />
            <button
              type="button"
              onClick={() => {
                setSource(null)
                setResult(null)
              }}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>
          <div>
            {style.allowCaption ? (
              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Caption {!isPro && '🔒'}</span>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  placeholder={isPro ? 'Summer 2026' : 'Upgrade to Pro to add a caption'}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </label>
            ) : (
              <p className="mb-4 text-xs text-slate-500">
                Hi-Print stickers don't have a caption border — this format skips the text option.
              </p>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Generate Polaroid
            </button>

            {result && (
              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <img src={result.url} alt="" className="mx-auto max-h-72 rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Download PNG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PolaroidImageMaker
