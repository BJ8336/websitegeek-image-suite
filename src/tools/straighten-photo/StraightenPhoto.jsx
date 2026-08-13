import { useRef, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import {
  loadImageFromFile,
  drawRotated,
  largestInscribedRect,
  createCanvas,
  canvasToBlob,
  baseName,
} from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('straighten-photo')
const MAX_DISPLAY = 520

function StraightenPhoto() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [line, setLine] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState(null)
  const containerRef = useRef(null)

  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setLine(null)
    setResult(null)
  }

  const getPoint = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e) => {
    const p = getPoint(e)
    setLine({ x1: p.x, y1: p.y, x2: p.x, y2: p.y })
    setIsDrawing(true)
  }
  const onPointerMove = (e) => {
    if (!isDrawing) return
    const p = getPoint(e)
    setLine((l) => ({ ...l, x2: p.x, y2: p.y }))
  }
  const onPointerUp = () => setIsDrawing(false)

  const angleDeg = line ? (Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180) / Math.PI : 0

  const handleStraighten = async () => {
    if (!source || !line) return
    const rotated = drawRotated(source.img, source.width, source.height, -angleDeg)
    const rad = (Math.abs(angleDeg) * Math.PI) / 180
    const { w, h } = largestInscribedRect(source.width, source.height, rad)
    const cropW = Math.min(Math.round(w), rotated.width)
    const cropH = Math.min(Math.round(h), rotated.height)
    const cropX = Math.round((rotated.width - cropW) / 2)
    const cropY = Math.round((rotated.height - cropH) / 2)

    const canvas = createCanvas(cropW, cropH)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(rotated, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-straightened.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-slate-600">
              Draw a line along something that should be level (a horizon, a wall edge) — then straighten.
            </p>
            <div
              ref={containerRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="relative cursor-crosshair select-none overflow-hidden rounded-lg border border-slate-300 bg-slate-100"
              style={{ width: source.width * scale, height: source.height * scale }}
            >
              <img
                src={source.img.src}
                alt=""
                draggable={false}
                style={{ width: source.width * scale, height: source.height * scale }}
                className="pointer-events-none"
              />
              {line && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#0D9488" strokeWidth="2.5" />
                  <circle cx={line.x1} cy={line.y1} r="4" fill="#0D9488" />
                  <circle cx={line.x2} cy={line.y2} r="4" fill="#0D9488" />
                </svg>
              )}
            </div>
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
            <p className="mb-3 text-sm text-slate-600">
              {line ? `Detected tilt: ${angleDeg.toFixed(1)}°` : 'Draw a reference line on the image first.'}
            </p>
            <button
              type="button"
              onClick={handleStraighten}
              disabled={!line}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Straighten
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

export default StraightenPhoto
