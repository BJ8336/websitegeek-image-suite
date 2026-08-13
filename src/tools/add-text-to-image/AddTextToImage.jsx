import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('add-text-to-image')
const MAX_DISPLAY = 520
const DEFAULT_SIZE = 36
const DEFAULT_COLOR = '#ffffff'

function AddTextToImage() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [text, setText] = useState('Your text here')
  const [point, setPoint] = useState({ x: 0.5, y: 0.85 })
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [bgOpacity, setBgOpacity] = useState(0)
  const [result, setResult] = useState(null)

  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
  }

  const handlePlace = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPoint({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }

  const guardPro = (setter) => (value) => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    setter(value)
  }

  const handleGenerate = async () => {
    if (!source) return
    const canvas = createCanvas(source.width, source.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source.img, 0, 0, source.width, source.height)

    const effectiveSize = isPro ? size : DEFAULT_SIZE
    const effectiveColor = isPro ? color : DEFAULT_COLOR
    ctx.font = `bold ${effectiveSize}px 'Segoe UI', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const x = point.x * source.width
    const y = point.y * source.height

    if (isPro && bgOpacity > 0) {
      const metrics = ctx.measureText(text)
      const padX = 16
      const padY = 10
      ctx.fillStyle = `rgba(0,0,0,${bgOpacity})`
      ctx.fillRect(x - metrics.width / 2 - padX, y - effectiveSize / 2 - padY, metrics.width + padX * 2, effectiveSize + padY * 2)
    }

    ctx.fillStyle = effectiveColor
    ctx.fillText(text, x, y)

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-text.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free="Add text anywhere on your image at a fixed size and color."
        pro="Adjustable font size, color, and an optional semi-transparent background behind the text."
      />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div
              onClick={handlePlace}
              className="relative cursor-crosshair overflow-hidden rounded-lg border border-slate-300"
              style={{ width: source.width * scale, height: source.height * scale }}
            >
              <img
                src={source.img.src}
                alt=""
                draggable={false}
                style={{ width: source.width * scale, height: source.height * scale }}
              />
              <span
                className="pointer-events-none absolute font-bold"
                style={{
                  left: point.x * source.width * scale,
                  top: point.y * source.height * scale,
                  transform: 'translate(-50%, -50%)',
                  fontSize: (isPro ? size : DEFAULT_SIZE) * scale,
                  color: isPro ? color : DEFAULT_COLOR,
                  backgroundColor: isPro && bgOpacity > 0 ? `rgba(0,0,0,${bgOpacity})` : 'transparent',
                  padding: '0.2em 0.5em',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Click the image to move the text.</p>
            <button
              type="button"
              onClick={() => {
                setSource(null)
                setResult(null)
              }}
              className="mt-2 block text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div>
            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Text</span>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Size: {isPro ? size : DEFAULT_SIZE}px {!isPro && '🔒'}
              </span>
              <input
                type="range"
                min="12"
                max="100"
                value={isPro ? size : DEFAULT_SIZE}
                onChange={(e) => guardPro(setSize)(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Color {!isPro && '🔒'}</span>
              <input
                type="color"
                value={isPro ? color : DEFAULT_COLOR}
                onChange={(e) => guardPro(setColor)(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Background opacity: {Math.round((isPro ? bgOpacity : 0) * 100)}% {!isPro && '🔒'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isPro ? bgOpacity : 0}
                onChange={(e) => guardPro(setBgOpacity)(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>

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

export default AddTextToImage
