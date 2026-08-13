import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { isJpeg, fileToDataUrl, removeExif, dataUrlToBlob } from '../../lib/exifCore'
import { baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('exif-remover')

function ExifRemover() {
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    setResult(null)
    if (!isJpeg(file)) {
      setError('EXIF metadata only exists in JPEG files — this file has no EXIF to remove.')
      setPreviewUrl('')
      return
    }
    setFileName(file.name)
    const dataUrl = await fileToDataUrl(file)
    setPreviewUrl(dataUrl)
    try {
      const stripped = removeExif(dataUrl)
      setResult(stripped)
    } catch {
      setError('This JPEG has no EXIF segment to remove.')
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-no-exif.jpg`, dataUrlToBlob(result), 'image/jpeg')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Works on JPEG files — EXIF metadata (camera model, GPS location, timestamps) doesn't exist in PNG or WebP.
      </p>

      {!previewUrl && <ImageDropzone onFiles={handleFiles} accept="image/jpeg,.jpg,.jpeg" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {previewUrl && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={previewUrl} alt="" className="max-h-80 w-full rounded-lg border border-slate-300 object-contain" />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('')
                setResult(null)
              }}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>
          <div>
            {result ? (
              <>
                <p className="mb-3 text-sm text-green-700">EXIF metadata removed.</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Download clean JPEG
                </button>
              </>
            ) : (
              !error && <p className="text-sm text-slate-500">Processing…</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExifRemover
