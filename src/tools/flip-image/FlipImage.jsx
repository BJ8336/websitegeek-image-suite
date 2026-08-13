import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('flip-image')

function FlipImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setFlipH(false)
    setFlipV(false)
  }

  const handleDownload = async () => {
    if (!source) return
    const canvas = createCanvas(source.width, source.height)
    const ctx = canvas.getContext('2d')
    ctx.translate(flipH ? source.width : 0, flipV ? source.height : 0)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(source.img, 0, 0, source.width, source.height)
    const blob = await canvasToBlob(canvas, 'image/png')
    downloadBlob(`${baseName(fileName)}-flipped.png`, blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-300">
            <img
              src={source.img.src}
              alt=""
              className="max-h-96 w-full object-contain"
              style={{ transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` }}
            />
          </div>
          <div>
            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={() => setFlipH((v) => !v)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
                  flipH ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Flip Horizontal
              </button>
              <button
                type="button"
                onClick={() => setFlipV((v) => !v)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
                  flipV ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Flip Vertical
              </button>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
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

export default FlipImage
