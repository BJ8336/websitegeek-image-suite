import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, drawScaled, canvasToBlob, baseName, extFromMime } from '../../lib/imageCore'
import { downloadBlob, formatBytes } from '../../utils/downloadFile'

const tool = getToolBySlug('convert-image-format')

const OUTPUT_FORMATS = [
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/avif', label: 'AVIF' },
]

async function fileToImageSource(file) {
  const isHeic = /\.hei[cf]$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif'
  if (!isHeic) return file

  const heic2any = (await import('heic2any')).default
  const converted = await heic2any({ blob: file, toType: 'image/png' })
  const blob = Array.isArray(converted) ? converted[0] : converted
  return new File([blob], file.name.replace(/\.hei[cf]$/i, '.png'), { type: 'image/png' })
}

function ConvertImageFormat() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState('image/png')
  const [quality, setQuality] = useState(0.85)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    setResult(null)
    setIsLoading(true)
    try {
      const decodableFile = await fileToImageSource(file)
      const { img, width, height } = await loadImageFromFile(decodableFile)
      setSource({ img, width, height })
      setFileName(file.name)
    } catch (err) {
      setError(err.message || 'Could not read this file — is it a supported image format?')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!source) return
    setIsConverting(true)
    setError('')
    try {
      const canvas = drawScaled(source.img, source.width, source.height)
      const blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality)
      if (blob.type !== format) {
        setError(
          `Your browser doesn't support encoding to ${OUTPUT_FORMATS.find((f) => f.value === format)?.label} — it exported as ${blob.type} instead.`
        )
      }
      setResult({ blob, url: URL.createObjectURL(blob) })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}.${extFromMime(result.blob.type)}`, result.blob, result.blob.type)
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Accepts PNG, JPG, WebP, AVIF, SVG, and HEIC as input. Converts to PNG, JPG, WebP, or AVIF — turning a photo
        into an SVG isn't offered here, since that's vector tracing, a different (and much lower-fidelity for
        photos) process than format conversion.
      </p>

      {!source && <ImageDropzone onFiles={handleFiles} accept="image/*,.heic,.heif" />}

      {isLoading && <p className="text-sm text-slate-500">Reading file…</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              {fileName} — {source.width}×{source.height}
            </p>
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
            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Convert to</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            {format !== 'image/png' && (
              <label className="mb-3 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quality: {Math.round(quality * 100)}%
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </label>
            )}

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isConverting ? 'Converting…' : 'Convert'}
            </button>

            {result && (
              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-700">{formatBytes(result.blob.size)}</p>
                <img src={result.url} alt="" className="mt-2 max-h-60 w-full rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConvertImageFormat
