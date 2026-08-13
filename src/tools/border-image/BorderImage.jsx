import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('border-image')
const DEFAULT_WIDTH = 12
const DEFAULT_COLOR = '#ffffff'

function BorderImage() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [result, setResult] = useState(null)

  const handleFiles = async ([file]) => {
    const { img, width: w, height } = await loadImageFromFile(file)
    setSource({ img, width: w, height })
    setFileName(file.name)
    setWidth(DEFAULT_WIDTH)
    setColor(DEFAULT_COLOR)
    setResult(null)
  }

  const guardPro = (setter) => (value) => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    setter(value)
  }

  const handleApply = async () => {
    if (!source) return
    const effectiveWidth = isPro ? width : DEFAULT_WIDTH
    const effectiveColor = isPro ? color : DEFAULT_COLOR
    const canvas = createCanvas(source.width + effectiveWidth * 2, source.height + effectiveWidth * 2)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = effectiveColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(source.img, effectiveWidth, effectiveWidth, source.width, source.height)
    const blob = await canvasToBlob(canvas, 'image/png')
    setResult({ blob, url: URL.createObjectURL(blob) })
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-bordered.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote free="Add a fixed white border." pro="Adjust the border width and pick any color." />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div
              className="inline-block max-w-full"
              style={{ padding: `${isPro ? width : DEFAULT_WIDTH}px`, backgroundColor: isPro ? color : DEFAULT_COLOR }}
            >
              <img src={source.img.src} alt="" className="max-h-72 max-w-full object-contain" />
            </div>
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
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Width: {isPro ? width : DEFAULT_WIDTH}px {!isPro && '🔒'}
              </span>
              <input
                type="range"
                min="1"
                max="80"
                value={isPro ? width : DEFAULT_WIDTH}
                onChange={(e) => guardPro(setWidth)(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Color {!isPro && '🔒'}</span>
              <input
                type="color"
                value={isPro ? color : DEFAULT_COLOR}
                onChange={(e) => guardPro(setColor)(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300"
              />
            </label>
            <button
              type="button"
              onClick={handleApply}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Apply
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

export default BorderImage
