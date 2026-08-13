import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { isJpeg, fileToDataUrl, getDpi, setDpi, dataUrlToBlob } from '../../lib/exifCore'
import { baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('dpi-converter')

function DpiConverter() {
  const [fileName, setFileName] = useState('')
  const [dataUrl, setDataUrl] = useState('')
  const [currentDpi, setCurrentDpi] = useState(null)
  const [targetDpi, setTargetDpi] = useState(300)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleFiles = async ([file]) => {
    setError('')
    setResult(null)
    if (!isJpeg(file)) {
      setError('DPI metadata only exists in JPEG files.')
      return
    }
    setFileName(file.name)
    const url = await fileToDataUrl(file)
    setDataUrl(url)
    setCurrentDpi(getDpi(url))
  }

  const handleConvert = () => {
    const updated = setDpi(dataUrl, targetDpi)
    setResult(updated)
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-${targetDpi}dpi.jpg`, dataUrlToBlob(result), 'image/jpeg')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Works on JPEG. This changes the DPI <em>metadata tag</em> only — it changes how printers interpret the image
        size, it does not add real detail or improve quality. To actually increase print size at good quality, you'd
        need more pixels, not just a different DPI number.
      </p>

      {!dataUrl && <ImageDropzone onFiles={handleFiles} accept="image/jpeg,.jpg,.jpeg" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {dataUrl && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={dataUrl} alt="" className="max-h-72 w-full rounded-lg border border-slate-300 object-contain" />
            <p className="mt-2 text-sm text-slate-600">
              Current: {currentDpi ? `${currentDpi} DPI` : 'no DPI tag set'}
            </p>
            <button
              type="button"
              onClick={() => {
                setDataUrl('')
                setResult(null)
              }}
              className="mt-1 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>
          <div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Target DPI</span>
              <input
                type="number"
                min="1"
                value={targetDpi}
                onChange={(e) => setTargetDpi(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleConvert}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Set DPI
            </button>
            {result && (
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Download JPEG at {targetDpi} DPI
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DpiConverter
