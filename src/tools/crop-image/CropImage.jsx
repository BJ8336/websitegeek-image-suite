import { useEffect, useRef, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('crop-image')
const MAX_DISPLAY = 520

const SHAPES = [
  { key: 'square', label: 'Square', locksAspect: true, needsTransparency: false },
  { key: 'rectangle', label: 'Rectangle', locksAspect: false, needsTransparency: false },
  { key: 'circle', label: 'Circle', locksAspect: true, needsTransparency: true },
  { key: 'triangle', label: 'Triangle', locksAspect: false, needsTransparency: true },
  { key: 'oval', label: 'Oval', locksAspect: false, needsTransparency: true },
]

function clampBox(box, maxW, maxH) {
  const w = Math.min(box.w, maxW)
  const h = Math.min(box.h, maxH)
  const x = Math.min(Math.max(box.x, 0), maxW - w)
  const y = Math.min(Math.max(box.y, 0), maxH - h)
  return { x, y, w, h }
}

function CropImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [shapeKey, setShapeKey] = useState('rectangle')
  const [box, setBox] = useState(null)
  const [result, setResult] = useState(null)
  const dragRef = useRef(null)
  const imgRef = useRef(null)

  const shape = SHAPES.find((s) => s.key === shapeKey)
  const scale = source ? Math.min(1, MAX_DISPLAY / Math.max(source.width, source.height)) : 1

  const handleFiles = async ([file]) => {
    setResult(null)
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    const size = Math.round(Math.min(width, height) * 0.7)
    setBox({ x: Math.round((width - size) / 2), y: Math.round((height - size) / 2), w: size, h: size })
  }

  useEffect(() => {
    if (!source || !box) return
    if (shape.locksAspect && box.w !== box.h) {
      setBox((b) => clampBox({ ...b, h: b.w }, source.width, source.height))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey])

  const onPointerDown = (e, mode, corner) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      mode,
      corner,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startBox: { ...box },
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag || !source) return
    const dx = (e.clientX - drag.startClientX) / scale
    const dy = (e.clientY - drag.startClientY) / scale

    if (drag.mode === 'move') {
      setBox(clampBox({ ...drag.startBox, x: drag.startBox.x + dx, y: drag.startBox.y + dy }, source.width, source.height))
      return
    }

    let { x, y, w, h } = drag.startBox
    if (drag.corner.includes('e')) w = drag.startBox.w + dx
    if (drag.corner.includes('s')) h = drag.startBox.h + dy
    if (drag.corner.includes('w')) {
      w = drag.startBox.w - dx
      x = drag.startBox.x + dx
    }
    if (drag.corner.includes('n')) {
      h = drag.startBox.h - dy
      y = drag.startBox.y + dy
    }
    if (shape.locksAspect) {
      const size = Math.max(20, Math.min(w, h))
      w = size
      h = size
    }
    w = Math.max(20, w)
    h = Math.max(20, h)
    setBox(clampBox({ x, y, w, h }, source.width, source.height))
  }

  const onPointerUp = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  const handleApplyCrop = async () => {
    if (!source || !box) return
    const canvas = createCanvas(box.w, box.h)
    const ctx = canvas.getContext('2d')

    ctx.save()
    if (shapeKey === 'circle') {
      const r = Math.min(box.w, box.h) / 2
      ctx.beginPath()
      ctx.arc(box.w / 2, box.h / 2, r, 0, Math.PI * 2)
      ctx.clip()
    } else if (shapeKey === 'oval') {
      ctx.beginPath()
      ctx.ellipse(box.w / 2, box.h / 2, box.w / 2, box.h / 2, 0, 0, Math.PI * 2)
      ctx.clip()
    } else if (shapeKey === 'triangle') {
      ctx.beginPath()
      ctx.moveTo(box.w / 2, 0)
      ctx.lineTo(box.w, box.h)
      ctx.lineTo(0, box.h)
      ctx.closePath()
      ctx.clip()
    }

    ctx.drawImage(source.img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h)
    ctx.restore()

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-cropped.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && box && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setShapeKey(s.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    shapeKey === s.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div
              className="relative select-none overflow-hidden rounded-lg border border-slate-300 bg-slate-100"
              style={{ width: source.width * scale, height: source.height * scale }}
            >
              <img
                ref={imgRef}
                src={source.img.src}
                alt=""
                draggable={false}
                style={{ width: source.width * scale, height: source.height * scale }}
                className="pointer-events-none"
              />
              <div
                onPointerDown={(e) => onPointerDown(e, 'move')}
                className="absolute cursor-move border-2 border-teal-500 bg-teal-500/10"
                style={{
                  left: box.x * scale,
                  top: box.y * scale,
                  width: box.w * scale,
                  height: box.h * scale,
                  borderRadius: shapeKey === 'circle' || shapeKey === 'oval' ? '9999px' : 0,
                }}
              >
                {['nw', 'ne', 'sw', 'se'].map((corner) => (
                  <div
                    key={corner}
                    onPointerDown={(e) => onPointerDown(e, 'resize', corner)}
                    className="absolute h-3 w-3 rounded-full border-2 border-white bg-teal-600"
                    style={{
                      cursor: `${corner}-resize`,
                      top: corner.includes('n') ? -6 : undefined,
                      bottom: corner.includes('s') ? -6 : undefined,
                      left: corner.includes('w') ? -6 : undefined,
                      right: corner.includes('e') ? -6 : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Drag the box to move it, drag a corner handle to resize. {shape.needsTransparency && 'Exports as PNG to keep the transparent background outside the shape.'}
            </p>
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
              Crop region: {Math.round(box.w)}×{Math.round(box.h)} px
            </p>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Apply Crop
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

export default CropImage
