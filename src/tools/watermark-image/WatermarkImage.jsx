import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('watermark-image')

const POSITIONS = [
  { key: 'top-left', x: 0, y: 0 },
  { key: 'top-center', x: 0.5, y: 0 },
  { key: 'top-right', x: 1, y: 0 },
  { key: 'middle-left', x: 0, y: 0.5 },
  { key: 'center', x: 0.5, y: 0.5 },
  { key: 'middle-right', x: 1, y: 0.5 },
  { key: 'bottom-left', x: 0, y: 1 },
  { key: 'bottom-center', x: 0.5, y: 1 },
  { key: 'bottom-right', x: 1, y: 1 },
]

function WatermarkImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('© Your Name')
  const [logo, setLogo] = useState(null)
  const [position, setPosition] = useState('bottom-right')
  const [opacity, setOpacity] = useState(0.6)
  const [rotation, setRotation] = useState(0)
  const [fontSize, setFontSize] = useState(32)
  const [result, setResult] = useState(null)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
  }

  const handleLogoFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setLogo({ img, width, height })
  }

  const handleGenerate = async () => {
    if (!source) return
    const canvas = createCanvas(source.width, source.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source.img, 0, 0, source.width, source.height)

    const pos = POSITIONS.find((p) => p.key === position)
    const margin = 24
    const px = margin + pos.x * (source.width - margin * 2)
    const py = margin + pos.y * (source.height - margin * 2)

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.translate(px, py)
    ctx.rotate((rotation * Math.PI) / 180)

    if (mode === 'text') {
      ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 2
      ctx.textAlign = pos.x === 0 ? 'left' : pos.x === 1 ? 'right' : 'center'
      ctx.textBaseline = pos.y === 0 ? 'top' : pos.y === 1 ? 'bottom' : 'middle'
      ctx.strokeText(text, 0, 0)
      ctx.fillText(text, 0, 0)
    } else if (logo) {
      const logoW = source.width * 0.2
      const logoH = (logo.height / logo.width) * logoW
      const offsetX = pos.x === 0 ? 0 : pos.x === 1 ? -logoW : -logoW / 2
      const offsetY = pos.y === 0 ? 0 : pos.y === 1 ? -logoH : -logoH / 2
      ctx.drawImage(logo.img, offsetX, offsetY, logoW, logoH)
    }
    ctx.restore()

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-watermarked.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

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
            <div className="mb-3 flex gap-2">
              {['text', 'image'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                    mode === m ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m} watermark
                </button>
              ))}
            </div>

            {mode === 'text' ? (
              <>
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
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Font size: {fontSize}px</span>
                  <input
                    type="range"
                    min="12"
                    max="80"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </label>
              </>
            ) : (
              <div className="mb-3">
                <ImageDropzone onFiles={handleLogoFiles} label="Upload a logo image" />
                {logo && <p className="mt-1 text-xs text-slate-500">Logo loaded ({logo.width}×{logo.height}).</p>}
              </div>
            )}

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Position</span>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITIONS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPosition(p.key)}
                    className={`h-8 rounded-md text-xs ${
                      position === p.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    ●
                  </button>
                ))}
              </div>
            </label>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Opacity: {Math.round(opacity * 100)}%</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Rotation: {rotation}°</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={mode === 'image' && !logo}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Apply Watermark
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

export default WatermarkImage
