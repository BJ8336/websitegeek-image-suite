import { useState } from 'react'
import JSZip from 'jszip'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('instagram-grid-maker')

const GRIDS = [
  { key: '3x1', label: '3 × 1', cols: 3, rows: 1, isPro: false },
  { key: '3x2', label: '3 × 2', cols: 3, rows: 2, isPro: true },
  { key: '3x3', label: '3 × 3', cols: 3, rows: 3, isPro: true },
]

function InstagramGridMaker() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [source, setSource] = useState(null)
  const [gridKey, setGridKey] = useState('3x1')
  const [tiles, setTiles] = useState([])

  const grid = GRIDS.find((g) => g.key === gridKey)

  const handleFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setSource({ img, width, height })
    setTiles([])
  }

  const handleGridSelect = (g) => {
    if (g.isPro && !isPro) {
      openUpgradeModal()
      return
    }
    setGridKey(g.key)
    setTiles([])
  }

  const handleSplit = async () => {
    if (!source) return
    const squareSize = Math.min(source.width, source.height)
    const sx = (source.width - squareSize) / 2
    const sy = (source.height - squareSize) / 2
    const tileSize = squareSize / grid.cols

    const generated = []
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const canvas = createCanvas(tileSize, tileSize)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(
          source.img,
          sx + col * tileSize,
          sy + row * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        )
        const blob = await canvasToBlob(canvas, 'image/png')
        generated.push({ row, col, blob, url: URL.createObjectURL(blob) })
      }
    }
    setTiles(generated)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    // Numbered so uploading in reverse order (last tile first) recreates the grid on a real profile.
    let n = tiles.length
    for (const tile of tiles) {
      zip.file(`tile-${String(n).padStart(2, '0')}.png`, tile.blob)
      n--
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob('instagram-grid.zip', blob, 'application/zip')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote free="Split into a 3×1 row." pro="3×2 and 3×3 grids for a full profile takeover." />

      {!source && <ImageDropzone onFiles={handleFiles} />}

      {source && (
        <div>
          <div className="mb-4 flex gap-2">
            {GRIDS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => handleGridSelect(g)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  gridKey === g.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label} {g.isPro && !isPro && '🔒'}
              </button>
            ))}
          </div>

          <img src={source.img.src} alt="" className="mb-4 max-h-64 rounded-lg border border-slate-300 object-contain" />

          <button
            type="button"
            onClick={handleSplit}
            className="mb-4 w-full max-w-sm rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Split into Grid
          </button>

          {tiles.length > 0 && (
            <div>
              <div className="grid max-w-md gap-1" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}>
                {tiles.map((t) => (
                  <img key={`${t.row}-${t.col}`} src={t.url} alt="" className="aspect-square w-full object-cover" />
                ))}
              </div>
              <button
                type="button"
                onClick={handleDownloadAll}
                className="mt-4 w-full max-w-sm rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Download all as .zip
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InstagramGridMaker
