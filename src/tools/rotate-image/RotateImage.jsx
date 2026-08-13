import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, drawRotated, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('rotate-image')

function RotateImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [angle, setAngle] = useState(0)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
    setAngle(0)
  }

  const handleDownload = async () => {
    if (!source) return
    const canvas = drawRotated(source.img, source.width, source.height, angle)
    const blob = await canvasToBlob(canvas, 'image/png')
    downloadBlob(`${baseName(fileName)}-rotated.png`, blob, 'image/png')
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
              className="max-h-80 max-w-full object-contain transition-transform"
              style={{ transform: `rotate(${angle}deg)` }}
            />
          </div>
          <div>
            <div className="mb-3 flex gap-2">
              {[-90, -1, 1, 90].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setAngle((a) => ((a + step) % 360 + 360) % 360)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  {step > 0 ? `+${step}°` : `${step}°`}
                </button>
              ))}
            </div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Angle: {angle}°</span>
              <input
                type="range"
                min="0"
                max="359"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
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

export default RotateImage
