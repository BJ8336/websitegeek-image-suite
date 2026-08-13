import { useState } from 'react'
import JSZip from 'jszip'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { fileToDataUrl, getDateTimeOriginal, isJpeg } from '../../lib/exifCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('bulk-photo-date-stamper')
const FREE_MAX_FILES = 8
const PRO_MAX_FILES = 100

function formatDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${date.getFullYear()}`
}

async function stampFile(file) {
  const { img, width, height } = await loadImageFromFile(file)
  let date = null
  if (isJpeg(file)) {
    const dataUrl = await fileToDataUrl(file)
    date = getDateTimeOriginal(dataUrl)
  }
  if (!date) date = new Date(file.lastModified)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  const fontSize = Math.max(18, Math.round(width * 0.03))
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  const label = formatDate(date)
  const margin = fontSize * 0.8
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillText(label, width - margin + 2, height - margin + 2)
  ctx.fillStyle = '#f5b400'
  ctx.fillText(label, width - margin, height - margin)

  const blob = await canvasToBlob(canvas, 'image/png')
  return { name: `${baseName(file.name)}-dated.png`, blob }
}

function BulkPhotoDateStamper() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState([])
  const maxFiles = isPro ? PRO_MAX_FILES : FREE_MAX_FILES

  const handleFiles = async (files) => {
    if (files.length > maxFiles) {
      openUpgradeModal()
      return
    }
    setProcessing(true)
    setDone([])
    const results = []
    for (const file of files) {
      results.push(await stampFile(file))
    }
    setDone(results)
    setProcessing(false)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    done.forEach((d) => zip.file(d.name, d.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob('dated-photos.zip', blob, 'application/zip')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free={`Stamp up to ${FREE_MAX_FILES} photos per batch.`}
        pro={`Stamp up to ${PRO_MAX_FILES} photos per batch.`}
      />

      <ImageDropzone onFiles={handleFiles} multiple label={`Choose up to ${maxFiles} photos`} />

      {processing && <p className="mt-3 text-sm text-slate-500">Stamping {'…'}</p>}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-600">{done.length} photos stamped with their own EXIF date (or file date if no EXIF).</p>
          <button
            type="button"
            onClick={handleDownloadAll}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Download all as .zip
          </button>
        </div>
      )}
    </div>
  )
}

export default BulkPhotoDateStamper
