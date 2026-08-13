import { useRef, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, rgbToHex } from '../../lib/imageCore'
import { copyToClipboard } from '../../utils/downloadFile'

const tool = getToolBySlug('image-color-picker')
const MAX_DISPLAY = 520

function ImageColorPicker() {
  const [source, setSource] = useState(null)
  const [picked, setPicked] = useState(null)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    const canvas = createCanvas(width, height)
    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
    canvasRef.current = canvas
    setSource({ img, width, height })
    setPicked(null)
  }

  const handleClick = (e) => {
    if (!containerRef.current || !canvasRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    const ctx = canvasRef.current.getContext('2d')
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setPicked({ x, y, r, g, b, hex: rgbToHex(r, g, b) })
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!picked) return
    setCopied(await copyToClipboard(picked.hex))
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div
              ref={containerRef}
              onClick={handleClick}
              className="inline-block cursor-crosshair overflow-hidden rounded-lg border border-slate-300"
              style={{ width: source.width * scale, height: source.height * scale }}
            >
              <img
                src={source.img.src}
                alt=""
                draggable={false}
                style={{ width: source.width * scale, height: source.height * scale }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Click anywhere on the image to sample its color.</p>
            <button
              type="button"
              onClick={() => {
                setSource(null)
                setPicked(null)
              }}
              className="mt-2 block text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div>
            {picked ? (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 h-24 w-full rounded-lg border border-slate-200" style={{ backgroundColor: picked.hex }} />
                <p className="font-mono text-lg font-semibold text-slate-900">{picked.hex}</p>
                <p className="text-sm text-slate-500">
                  rgb({picked.r}, {picked.g}, {picked.b}) — pixel ({picked.x}, {picked.y})
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 w-full rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {copied ? 'Copied!' : 'Copy hex code'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No color picked yet — click the image.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageColorPicker
