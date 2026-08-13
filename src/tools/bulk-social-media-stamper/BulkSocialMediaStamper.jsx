import { useState } from 'react'
import JSZip from 'jszip'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import FreeProNote from '../../components/FreeProNote'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile, createCanvas, canvasToBlob, baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'

const tool = getToolBySlug('bulk-social-media-stamper')
const FREE_MAX_FILES = 8
const PRO_MAX_FILES = 100

async function stampFile(file, handle) {
  const { img, width, height } = await loadImageFromFile(file)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  const fontSize = Math.max(16, Math.round(width * 0.03))
  const margin = fontSize * 0.9
  ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  const label = handle.startsWith('@') ? handle : `@${handle}`
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 2
  ctx.strokeText(label, margin, height - margin)
  ctx.fillText(label, margin, height - margin)
  const blob = await canvasToBlob(canvas, 'image/png')
  return { name: `${baseName(file.name)}-stamped.png`, blob }
}

function BulkSocialMediaStamper() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [handle, setHandle] = useState('yourhandle')
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
    for (const file of files) results.push(await stampFile(file, handle))
    setDone(results)
    setProcessing(false)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    done.forEach((d) => zip.file(d.name, d.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob('stamped-photos.zip', blob, 'application/zip')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free={`Stamp up to ${FREE_MAX_FILES} photos per batch.`}
        pro={`Stamp up to ${PRO_MAX_FILES} photos per batch.`}
      />

      <label className="mb-4 block max-w-md">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">@Handle</span>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
        />
      </label>

      <ImageDropzone onFiles={handleFiles} multiple label={`Choose up to ${maxFiles} photos`} />

      {processing && <p className="mt-3 text-sm text-slate-500">Stamping…</p>}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-600">{done.length} photos stamped.</p>
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

export default BulkSocialMediaStamper
