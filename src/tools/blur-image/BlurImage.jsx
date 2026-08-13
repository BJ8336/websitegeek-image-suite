import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('blur-image')

function BlurImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [blur, setBlur] = useState(6)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
  }

  const handleDownload = async () => {
    if (!source) return
    const canvas = createCanvas(source.width, source.height)
    const ctx = canvas.getContext('2d')
    ctx.filter = `blur(${blur}px)`
    ctx.drawImage(source.img, 0, 0, source.width, source.height)
    const blob = await canvasToBlob(canvas, 'image/png')
    downloadBlob(`${baseName(fileName)}-blurred.png`, blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-100 p-4">
            <img
              src={source.img.src}
              alt=""
              className="max-h-80 max-w-full object-contain"
              style={{ filter: `blur(${blur}px)` }}
            />
          </div>
          <div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Blur: {blur}px</span>
              <input
                type="range"
                min="0"
                max="30"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </label>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={() => setSource(null)}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlurImage
