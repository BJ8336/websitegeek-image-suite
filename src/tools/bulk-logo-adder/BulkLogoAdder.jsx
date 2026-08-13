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

const tool = getToolBySlug('bulk-logo-adder')
const FREE_MAX_FILES = 8
const PRO_MAX_FILES = 100

async function stampFile(file, logo) {
  const { img, width, height } = await loadImageFromFile(file)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  const logoW = width * 0.18
  const logoH = (logo.height / logo.width) * logoW
  const margin = width * 0.03
  ctx.globalAlpha = 0.9
  ctx.drawImage(logo.img, width - logoW - margin, height - logoH - margin, logoW, logoH)
  const blob = await canvasToBlob(canvas, 'image/png')
  return { name: `${baseName(file.name)}-logo.png`, blob }
}

function BulkLogoAdder() {
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const [logo, setLogo] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState([])
  const maxFiles = isPro ? PRO_MAX_FILES : FREE_MAX_FILES

  const handleLogoFiles = async ([file]) => {
    const { img, width, height } = await loadImageFromFile(file)
    setLogo({ img, width, height })
  }

  const handleFiles = async (files) => {
    if (!logo) return
    if (files.length > maxFiles) {
      openUpgradeModal()
      return
    }
    setProcessing(true)
    setDone([])
    const results = []
    for (const file of files) results.push(await stampFile(file, logo))
    setDone(results)
    setProcessing(false)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    done.forEach((d) => zip.file(d.name, d.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob('logo-photos.zip', blob, 'application/zip')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <FreeProNote
        free={`Add your logo to up to ${FREE_MAX_FILES} photos per batch.`}
        pro={`Add your logo to up to ${PRO_MAX_FILES} photos per batch.`}
      />

      <div className="mb-4 max-w-md">
        <p className="mb-1.5 text-sm font-medium text-slate-700">1. Upload your logo</p>
        <ImageDropzone onFiles={handleLogoFiles} label="Click or drag your logo image here" />
        {logo && <p className="mt-1 text-xs text-slate-500">Logo loaded ({logo.width}×{logo.height}).</p>}
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-slate-700">2. Choose photos</p>
        <ImageDropzone onFiles={handleFiles} multiple label={`Choose up to ${maxFiles} photos`} />
      </div>

      {processing && <p className="mt-3 text-sm text-slate-500">Adding logo…</p>}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-600">{done.length} photos logo-stamped.</p>
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

export default BulkLogoAdder
