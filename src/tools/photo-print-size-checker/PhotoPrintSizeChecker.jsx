import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { loadImageFromFile } from '../../lib/imageCore'

const tool = getToolBySlug('photo-print-size-checker')

const COMMON_SIZES = [
  { label: '4 × 6 in', w: 4, h: 6 },
  { label: '5 × 7 in', w: 5, h: 7 },
  { label: '8 × 10 in', w: 8, h: 10 },
  { label: '11 × 14 in', w: 11, h: 14 },
  { label: '16 × 20 in', w: 16, h: 20 },
  { label: '20 × 30 in', w: 20, h: 30 },
]

function qualityFor(effectiveDpi) {
  if (effectiveDpi >= 300) return { label: 'Excellent', color: 'text-green-700 bg-green-100' }
  if (effectiveDpi >= 200) return { label: 'Good', color: 'text-teal-700 bg-teal-100' }
  if (effectiveDpi >= 150) return { label: 'Acceptable', color: 'text-amber-700 bg-amber-100' }
  return { label: 'Poor', color: 'text-red-700 bg-red-100' }
}

function PhotoPrintSizeChecker() {
  const [dims, setDims] = useState(null)

  const handleFiles = async ([file]) => {
    const { width, height } = await loadImageFromFile(file)
    setDims({ width, height, name: file.name })
  }

  const maxSizeAt300 = dims ? { w: (dims.width / 300).toFixed(1), h: (dims.height / 300).toFixed(1) } : null

  return (
    <div>
      <ToolHeader tool={tool} />

      {!dims && <ImageDropzone onFiles={handleFiles} />}

      {dims && (
        <div>
          <p className="mb-1 text-sm text-slate-500">{dims.name}</p>
          <p className="mb-4 text-lg font-semibold text-slate-900">
            {dims.width} × {dims.height} px
          </p>
          <p className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
            Largest size printable at excellent quality (300 DPI): <strong>{maxSizeAt300.w} × {maxSizeAt300.h} in</strong>
          </p>

          <p className="mb-2 text-sm font-medium text-slate-700">Quality at common print sizes</p>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Effective DPI</th>
                  <th className="px-3 py-2">Quality</th>
                </tr>
              </thead>
              <tbody>
                {COMMON_SIZES.map((size) => {
                  const dpi = Math.round(Math.min(dims.width / size.w, dims.height / size.h))
                  const q = qualityFor(dpi)
                  return (
                    <tr key={size.label} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{size.label}</td>
                      <td className="px-3 py-2 text-slate-600">{dpi} DPI</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${q.color}`}>{q.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setDims(null)}
            className="mt-4 text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            Check a different image
          </button>
        </div>
      )}
    </div>
  )
}

export default PhotoPrintSizeChecker
