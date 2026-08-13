import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('polaroid-image-maker')
const FRAME = 40
const BOTTOM = 130

function PolaroidImageMaker() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState(null)

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
    const photoW = 700
    const photoH = Math.round((source.height / source.width) * photoW)
    const canvas = createCanvas(photoW + FRAME * 2, photoH + FRAME + BOTTOM)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 10
    ctx.drawImage(source.img, FRAME, FRAME, photoW, photoH)
    ctx.shadowColor = 'transparent'

    if (isPro && caption.trim()) {
      ctx.fillStyle = '#1e293b'
      ctx.font = "40px 'Segoe UI', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(caption.trim(), canvas.width / 2, FRAME + photoH + BOTTOM / 2 + 15)
    }

    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-polaroid.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote free="Classic Polaroid frame around your photo." pro="Add your own caption text below the photo." />

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
