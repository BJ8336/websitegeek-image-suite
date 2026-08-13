import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, sharpenImageData, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('sharpen-image')

function SharpenImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [amount, setAmount] = useState(0.5)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setResult(null)
  }

  const handleApply = async () => {
    if (!source) return
    setIsProcessing(true)
    try {
      const canvas = createCanvas(source.width, source.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source.img, 0, 0, source.width, source.height)
      const imageData = ctx.getImageData(0, 0, source.width, source.height)
      const sharpened = sharpenImageData(imageData, amount)
      ctx.putImageData(sharpened, 0, 0)
      const blob = await canvasToBlob(canvas, 'image/png')
      setResult({ blob, url: URL.createObjectURL(blob) })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-sharpened.png`, result.blob, 'image/png')
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
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Sharpen strength: {amount.toFixed(1)}
              </span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isProcessing ? 'Sharpening…' : 'Sharpen'}
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

export default SharpenImage
