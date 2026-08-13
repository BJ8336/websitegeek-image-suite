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

const tool = getToolBySlug('bulk-product-labeler')
const FREE_MAX_FILES = 8
const PRO_MAX_FILES = 100

async function stampFile(file, name, price) {
  const { img, width, height } = await loadImageFromFile(file)
  const bannerH = Math.round(height * 0.14)
  const canvas = createCanvas(width, height + bannerH)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  ctx.fillStyle = '#0D9488'
  ctx.fillRect(0, height, width, bannerH)

  const nameSize = Math.max(14, Math.round(bannerH * 0.38))
  const priceSize = Math.max(14, Math.round(bannerH * 0.42))
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 ${nameSize}px 'Segoe UI', sans-serif`
  ctx.textBaseline = 'top'
  ctx.fillText(name, width * 0.04, height + bannerH * 0.14, width * 0.65)

  ctx.textAlign = 'right'
  ctx.font = `bold ${priceSize}px 'Segoe UI', sans-serif`
  ctx.fillText(price, width * 0.96, height + bannerH * 0.14)

  const blob = await canvasToBlob(canvas, 'image/png')
  return { name: `${baseName(file.name)}-labeled.png`, blob }
}

function BulkProductLabeler() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [productName, setProductName] = useState('Product Name')
  const [price, setPrice] = useState('$19.99')
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
    for (const file of files) results.push(await stampFile(file, productName, price))
    setDone(results)
    setProcessing(false)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    done.forEach((d) => zip.file(d.name, d.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob('labeled-photos.zip', blob, 'application/zip')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free={`Label up to ${FREE_MAX_FILES} product photos per batch.`}
        pro={`Label up to ${PRO_MAX_FILES} product photos per batch.`}
      />

      <p className="mb-4 max-w-md text-xs text-slate-500">
        Adds a solid banner strip along the bottom with the product name and price — a simple, consistent label
        across a batch of product photos (not a full price-tag graphic or logo placement).
      </p>

      <div className="mb-4 grid max-w-md grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Product name</span>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Price</span>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
          />
        </label>
      </div>

      <ImageDropzone onFiles={handleFiles} multiple label={`Choose up to ${maxFiles} product photos`} />

      {processing && <p className="mt-3 text-sm text-slate-500">Labeling…</p>}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-600">{done.length} photos labeled.</p>
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

export default BulkProductLabeler
