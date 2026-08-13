import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import {
  loadImageFromFile,
  drawScaled,
  canvasToBlob,
  compressToTargetSize,
  baseName,
  extFromMime,
} from '../../lib/imageCore'
import { downloadBlob, formatBytes } from '../../utils/downloadFile'

const tool = getToolBySlug('compress-resize-image')

const MODES = [
  { key: 'percentage', label: 'Percentage' },
  { key: 'filesize', label: 'Target file size' },
  { key: 'dimensions', label: 'Exact dimensions' },
]

function CompressResizeImage() {
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [mode, setMode] = useState('percentage')
  const [format, setFormat] = useState('image/jpeg')
  const [percentage, setPercentage] = useState(70)
  const [quality, setQuality] = useState(0.8)
  const [targetKb, setTargetKb] = useState(200)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    setResult(null)
    try {
      const { img, width: w, height: h } = await loadImageFromFile(file)
      setSource(img)
      setFileName(file.name)
      setOriginalSize(file.size)
      setWidth(w)
      setHeight(h)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleWidthChange = (value) => {
    const w = Number(value) || 0
    setWidth(w)
    if (lockAspect && source) {
      setHeight(Math.round((w * source.height) / source.width))
    }
  }

  const handleHeightChange = (value) => {
    const h = Number(value) || 0
    setHeight(h)
    if (lockAspect && source) {
      setWidth(Math.round((h * source.width) / source.height))
    }
  }

  const handleProcess = async () => {
    if (!source) return
    setIsProcessing(true)
    setError('')
    try {
      let targetW = source.width
      let targetH = source.height
      if (mode === 'percentage') {
        targetW = Math.round((source.width * percentage) / 100)
        targetH = Math.round((source.height * percentage) / 100)
      } else if (mode === 'dimensions') {
        targetW = width || source.width
        targetH = height || source.height
      }

      const canvas = drawScaled(source, targetW, targetH)

      let blob
      if (mode === 'filesize') {
        if (format === 'image/png') {
          throw new Error('Target file size only works with JPG or WebP — PNG has no adjustable quality.')
        }
        blob = await compressToTargetSize(canvas, format, targetKb * 1024)
      } else {
        blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality)
      }

      setResult({ blob, width: targetW, height: targetH, url: URL.createObjectURL(blob) })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-compressed.${extFromMime(format)}`, result.blob, format)
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              {fileName} — {source.width}×{source.height}, {formatBytes(originalSize)}
            </p>
            <img src={source.src} alt="" className="max-h-80 w-full rounded-lg border border-slate-300 object-contain" />
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
            <div className="mb-3 flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    mode === m.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Output format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </label>

            {mode === 'percentage' && (
              <label className="mb-3 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Scale: {percentage}%</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </label>
            )}

            {mode === 'filesize' && (
              <label className="mb-3 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Target size (KB)</span>
                <input
                  type="number"
                  min="10"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </label>
            )}

            {mode === 'dimensions' && (
              <div className="mb-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Width (px)</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Height (px)</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                    className="accent-teal-600"
                  />
                  Lock aspect ratio
                </label>
              </div>
            )}

            {mode !== 'filesize' && format !== 'image/png' && (
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
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isProcessing ? 'Processing…' : 'Compress / Resize'}
            </button>

            {result && (
              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-700">
                  Result: {result.width}×{result.height}, {formatBytes(result.blob.size)}
                  {originalSize > 0 && (
                    <span className="text-slate-500">
                      {' '}
                      ({Math.round((1 - result.blob.size / originalSize) * 100)}% smaller)
                    </span>
                  )}
                </p>
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

export default CompressResizeImage
