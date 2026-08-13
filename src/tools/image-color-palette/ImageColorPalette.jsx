import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, extractDominantColors } from '../../lib/imageCore'
import { copyToClipboard } from '../../utils/downloadFile'

const tool = getToolBySlug('image-color-palette')

function Swatch({ color }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => setCopied(await copyToClipboard(color.hex))}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="h-16 w-16 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: color.hex }} />
      <span className="font-mono text-xs text-slate-700">{copied ? 'Copied!' : color.hex}</span>
    </button>
  )
}

function ImageColorPalette() {
  const [source, setSource] = useState(null)
  const [palette, setPalette] = useState(null)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    setPalette(extractDominantColors(imageData, 8))
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={source.img.src} alt="" className="max-h-80 w-full rounded-lg border border-slate-300 object-contain" />
            <button
              type="button"
              onClick={() => {
                setSource(null)
                setPalette(null)
              }}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Dominant colors</p>
            <div className="grid grid-cols-4 gap-4">
              {palette?.map((color) => (
                <Swatch key={color.hex} color={color} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageColorPalette
