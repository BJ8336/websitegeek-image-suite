import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, encodeMessage, decodeMessage, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('image-steganography')

function ImageSteganography() {
  const [mode, setMode] = useState('hide')
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [decoded, setDecoded] = useState(null)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    setResult(null)
    setDecoded(null)
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setFileName(file.name)
  }

  const handleHide = async () => {
    if (!source || !message) return
    setError('')
    try {
      const canvas = createCanvas(source.width, source.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source.img, 0, 0, source.width, source.height)
      const imageData = ctx.getImageData(0, 0, source.width, source.height)
      const encoded = encodeMessage(imageData, message)
      ctx.putImageData(encoded, 0, 0)
      const blob = await canvasToBlob(canvas, 'image/png')
      setResult({ blob, url: URL.createObjectURL(blob) })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReveal = async () => {
    if (!source) return
    setError('')
    try {
      const canvas = createCanvas(source.width, source.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source.img, 0, 0, source.width, source.height)
      const imageData = ctx.getImageData(0, 0, source.width, source.height)
      setDecoded(decodeMessage(imageData))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(`${baseName(fileName)}-hidden.png`, result.blob, 'image/png')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Hides text in the image's pixel data (LSB steganography). The output must stay a PNG — re-saving as JPEG or
        resizing will destroy the hidden message.
      </p>

      <div className="mb-4 flex gap-2">
        {[
          { key: 'hide', label: 'Hide a message' },
          { key: 'reveal', label: 'Reveal a message' },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              setMode(m.key)
              setSource(null)
              setResult(null)
              setDecoded(null)
              setError('')
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === m.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!source && <ImageDropzone onFiles={handleFiles} accept="image/png,.png" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={source.img.src} alt="" className="max-h-72 w-full rounded-lg border border-slate-300 object-contain" />
            <button
              type="button"
              onClick={() => setSource(null)}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div>
            {mode === 'hide' ? (
              <>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Secret message</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleHide}
                  className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Hide Message
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
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleReveal}
                  className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Reveal Message
                </button>
                {decoded !== null && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-800">{decoded}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageSteganography
