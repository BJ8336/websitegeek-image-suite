import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, imageToAscii } from '../../lib/imageCore'
import { downloadBlob, copyToClipboard } from '../../utils/downloadFile'

const tool = getToolBySlug('ascii-art-generator')

function AsciiArtGenerator() {
  const [source, setSource] = useState(null)
  const [cols, setCols] = useState(100)
  const [matrixMode, setMatrixMode] = useState(false)
  const [ascii, setAscii] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setAscii('')
  }

  const handleGenerate = () => {
    if (!source) return
    const canvas = createCanvas(source.width, source.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source.img, 0, 0, source.width, source.height)
    const imageData = ctx.getImageData(0, 0, source.width, source.height)
    setAscii(imageToAscii(imageData, cols))
  }

  const handleCopy = async () => setCopied(await copyToClipboard(ascii))
  const handleDownload = () => downloadBlob('ascii-art.txt', ascii, 'text/plain')

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Width: {cols} chars</span>
              <input
                type="range"
                min="40"
                max="200"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-40 accent-teal-600"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={matrixMode} onChange={(e) => setMatrixMode(e.target.checked)} className="accent-teal-600" />
              Matrix style
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Generate ASCII Art
            </button>
            <button
              type="button"
              onClick={() => setSource(null)}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          {ascii && (
            <>
              <pre
                className={`overflow-x-auto rounded-lg border p-4 font-mono text-[6px] leading-[6px] sm:text-[8px] sm:leading-[8px] ${
                  matrixMode ? 'border-slate-700 bg-black text-green-400' : 'border-slate-300 bg-white text-slate-800'
                }`}
              >
                {ascii}
              </pre>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {copied ? 'Copied!' : 'Copy text'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Download .txt
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AsciiArtGenerator
