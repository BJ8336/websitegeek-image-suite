import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('profile-picture-maker')

const EFFECTS = [
  { key: 'none', label: 'Normal', filter: 'none' },
  { key: 'bw', label: 'Black & White', filter: 'grayscale(100%)' },
  { key: 'vivid', label: 'Vivid', filter: 'saturate(160%) contrast(112%)' },
  { key: 'soft', label: 'Soft', filter: 'brightness(108%) contrast(92%)' },
]

const RING_COLORS = ['#0D9488', '#f59e0b', '#ef4444', '#6366f1', 'none']

function ProfilePictureMaker() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [effect, setEffect] = useState('none')
  const [ringColor, setRingColor] = useState('#0D9488')
  const [badge, setBadge] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
  }

  const handleGenerate = async () => {
    if (!source) return
    const size = 500
    const ringWidth = ringColor === 'none' ? 0 : 14
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    const cropSize = Math.min(source.width, source.height)
    const sx = (source.width - cropSize) / 2
    const sy = (source.height - cropSize) / 2

    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - ringWidth, 0, Math.PI * 2)
    ctx.clip()
    ctx.filter = EFFECTS.find((e) => e.key === effect).filter
    ctx.drawImage(source.img, sx, sy, cropSize, cropSize, 0, 0, size, size)
    ctx.restore()

    if (ringWidth > 0) {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - ringWidth / 2, 0, Math.PI * 2)
      ctx.lineWidth = ringWidth
      ctx.strokeStyle = ringColor
      ctx.stroke()
    }

    if (badge) {
      const bx = size - 60
      const by = size - 60
      ctx.beginPath()
      ctx.arc(bx, by, 28, 0, Math.PI * 2)
      ctx.fillStyle = '#0D9488'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(bx - 12, by)
      ctx.lineTo(bx - 3, by + 10)
      ctx.lineTo(bx + 13, by - 12)
      ctx.stroke()
    }

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-profile.png`, result.blob, 'image/png')
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
            <p className="mb-1.5 text-sm font-medium text-slate-700">Effect</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {EFFECTS.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => setEffect(e.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    effect === e.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <p className="mb-1.5 text-sm font-medium text-slate-700">Ring color</p>
            <div className="mb-4 flex gap-2">
              {RING_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setRingColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${ringColor === c ? 'border-slate-900' : 'border-slate-200'}`}
                  style={{ backgroundColor: c === 'none' ? '#f1f5f9' : c }}
                  title={c === 'none' ? 'No ring' : c}
                />
              ))}
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} className="accent-teal-600" />
              Add verified badge
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

export default ProfilePictureMaker
