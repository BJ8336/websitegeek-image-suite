import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, floodFillTransparent, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('background-remover')
const MAX_DISPLAY = 520

function BackgroundRemover() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [canvas, setCanvas] = useState(null)
  const [tolerance, setTolerance] = useState(32)
  const [clickCount, setClickCount] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')

  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    const c = createCanvas(width, height)
    c.getContext('2d').drawImage(img, 0, 0, width, height)
    setSource({ img, width, height })
    setFileName(file.name)
    setCanvas(c)
    setClickCount(0)
    const blob = await canvasToBlob(c, 'image/png')
    setPreviewUrl(URL.createObjectURL(blob))
  }

  const applyFloodFillAt = async (x, y) => {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const filled = floodFillTransparent(imageData, x, y, tolerance)
    ctx.putImageData(filled, 0, 0)
    const blob = await canvasToBlob(canvas, 'image/png')
    setPreviewUrl(URL.createObjectURL(blob))
  }

  const handleClick = async (e) => {
    if (!isPro && clickCount >= 1) {
      openUpgradeModal()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    await applyFloodFillAt(x, y)
    setClickCount((n) => n + 1)
  }

  const handleAutoCorners = async () => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    await applyFloodFillAt(0, 0)
    await applyFloodFillAt(canvas.width - 1, 0)
    await applyFloodFillAt(0, canvas.height - 1)
    await applyFloodFillAt(canvas.width - 1, canvas.height - 1)
  }

  const handleDownload = () => {
    if (!canvas) return
    canvas.toBlob((blob) => downloadBlob(`${baseName(fileName)}-no-bg.png`, blob, 'image/png'), 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free="Click once on the background to remove it (magic-wand style, based on color similarity)."
        pro="Unlimited clicks to remove multiple regions, plus one-click auto-remove from all four corners."
      />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div
              onClick={handleClick}
              className="checkerboard-bg cursor-crosshair overflow-hidden rounded-lg border border-slate-300"
              style={{
                width: source.width * scale,
                height: source.height * scale,
                backgroundImage:
                  'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              {previewUrl && (
                <img src={previewUrl} alt="" style={{ width: source.width * scale, height: source.height * scale }} />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Click anywhere on the background to remove that region. {!isPro && 'Free tier: one click.'}
            </p>
            <button
              type="button"
              onClick={() => setSource(null)}
              className="mt-2 block text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tolerance: {tolerance}</span>
              <input
                type="range"
                min="5"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <span className="text-xs text-slate-500">Higher = removes a wider range of similar colors.</span>
            </label>

            <button
              type="button"
              onClick={handleAutoCorners}
              className="mb-3 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Auto-remove from corners {!isPro && '🔒'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BackgroundRemover
