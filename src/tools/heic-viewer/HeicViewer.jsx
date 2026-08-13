import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { baseName } from '../../lib/imageCore'
import { downloadBlob, formatBytes } from '../../utils/downloadFile'

const tool = getToolBySlug('heic-viewer')

function HeicViewer() {
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [pngBlob, setPngBlob] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    setIsLoading(true)
    setFileName(file.name)
    try {
      const heic2any = (await import('heic2any')).default
      const converted = await heic2any({ blob: file, toType: 'image/png' })
      const blob = Array.isArray(converted) ? converted[0] : converted
      setPngBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {
      setError("Couldn't decode this file — is it really a .HEIC/.HEIF photo?")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!pngBlob) return
    downloadBlob(`${baseName(fileName)}.png`, pngBlob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!previewUrl && <ImageDropzone onFiles={handleFiles} accept="image/heic,image/heif,.heic,.heif" label="Click or drag a .HEIC/.HEIF photo here" />}

      {isLoading && <p className="text-sm text-slate-500">Decoding…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {previewUrl && (
        <div className="max-w-xl">
          <img src={previewUrl} alt="" className="w-full rounded-lg border border-slate-300 object-contain" />
          <p className="mt-2 text-sm text-slate-500">
            {fileName} {pngBlob && `— ${formatBytes(pngBlob.size)} as PNG`}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Save as PNG
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('')
                setPngBlob(null)
              }}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View a different photo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeicViewer
