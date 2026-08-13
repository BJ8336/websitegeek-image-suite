import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('merge-images-collage')
const CANVAS_SIZE = 900

const TEMPLATES = [
  { key: '2-side', label: '2 photos, side by side', count: 2, isPro: false, cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] },
  {
    key: '4-grid',
    label: '4 photos, grid',
    count: 4,
    isPro: false,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    key: '3-strip',
    label: '3 photos, vertical strip',
    count: 3,
    isPro: true,
    cells: [{ x: 0, y: 0, w: 1 / 3, h: 1 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }],
  },
  {
    key: '6-grid',
    label: '6 photos, grid',
    count: 6,
    isPro: true,
    cells: Array.from({ length: 6 }, (_, i) => ({ x: (i % 3) / 3, y: Math.floor(i / 3) / 2, w: 1 / 3, h: 0.5 })),
  },
]

// "Cover" fit: scale so the image fills the cell with no gaps, cropping overflow.
function drawCover(ctx, img, cellX, cellY, cellW, cellH) {
  const scale = Math.max(cellW / img.width, cellH / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  const dx = cellX + (cellW - drawW) / 2
  const dy = cellY + (cellH - drawH) / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(cellX, cellY, cellW, cellH)
  ctx.clip()
  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.restore()
}

function MergeImagesCollage() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [templateKey, setTemplateKey] = useState('2-side')
  const [images, setImages] = useState([])
  const [result, setResult] = useState(null)

  const template = TEMPLATES.find((t) => t.key === templateKey)

  const handleTemplateSelect = (t) => {
    if (t.isPro && !isPro) {
      openUpgradeModal()
      return
    }
    setTemplateKey(t.key)
    setImages([])
    setResult(null)
  }

  const handleFiles = async (files) => {
    const loaded = await Promise.all(files.slice(0, template.count).map((f) => loadImageFromFile(f)))
    setImages(loaded.map((l) => l.img))
  }

  const handleGenerate = async () => {
    if (images.length < template.count) return
    const canvasHeight = templateKey === '2-side' || templateKey === '3-strip' ? CANVAS_SIZE * 0.6 : CANVAS_SIZE
    const canvas = createCanvas(CANVAS_SIZE, canvasHeight)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    template.cells.forEach((cell, i) => {
      if (!images[i]) return
      drawCover(ctx, images[i], cell.x * canvas.width, cell.y * canvas.height, cell.w * canvas.width, cell.h * canvas.height)
    })
    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob('collage.png', result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free="2- and 4-photo grid templates."
        pro="Unlock the full template library (3-photo strip, 6-photo grid, and more)."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTemplateSelect(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              templateKey === t.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label} {t.isPro && !isPro && '🔒'}
          </button>
        ))}
      </div>

      <ImageDropzone
        onFiles={handleFiles}
        multiple
        label={`Choose ${template.count} images for this template`}
      />
      <p className="mt-2 text-xs text-slate-500">{images.length} of {template.count} images selected.</p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={images.length < template.count}
        className="mt-4 w-full max-w-sm rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        Generate Collage
      </button>

      {result && (
        <div className="mt-6 max-w-2xl rounded-lg border border-slate-200 p-3">
          <img src={result.url} alt="" className="mx-auto max-h-96 rounded-lg object-contain" />
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
  )
}

export default MergeImagesCollage
