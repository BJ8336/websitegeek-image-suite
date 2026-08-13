import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { fileToDataUrl, getDpi } from '../../lib/exifCore'
import { loadImageFromFile } from '../../lib/imageCore'

const tool = getToolBySlug('dpi-checker')

function DpiChecker() {
  const [info, setInfo] = useState(null)

  const handleFiles = async ([file]) => {
    const { width, height } = await loadImageFromFile(file)
    let dpi = null
    if (file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)) {
      const dataUrl = await fileToDataUrl(file)
      dpi = getDpi(dataUrl)
    }
    setInfo({ width, height, dpi, name: file.name })
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!info && <ImageDropzone onFiles={handleFiles} />}

      {info && (
        <div className="max-w-md rounded-lg border border-slate-200 p-5">
          <p className="text-sm text-slate-500">{info.name}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {info.dpi ? `${info.dpi} DPI` : 'No DPI tag found'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {info.dpi === null && 'Only JPEG files carry a DPI tag — PNG/WebP have none, and many JPEGs default to 72 or 96 if never set.'}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Pixel size: {info.width}×{info.height}px
          </p>
          <button
            type="button"
            onClick={() => setInfo(null)}
            className="mt-4 text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            Check a different image
          </button>
        </div>
      )}
    </div>
  )
}

export default DpiChecker
