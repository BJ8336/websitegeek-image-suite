import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { isJpeg, fileToDataUrl, getCameraFields, setCameraFields, ORIENTATION_LABELS, dataUrlToBlob } from '../../lib/exifCore'
import { baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('exif-editor')

function ExifEditor() {
  const [fileName, setFileName] = useState('')
  const [dataUrl, setDataUrl] = useState('')
  const [fields, setFields] = useState(null)
  const [error, setError] = useState('')

  const handleFiles = async ([file]) => {
    setError('')
    if (!isJpeg(file)) {
      setError('EXIF editing only works on JPEG files.')
      return
    }
    setFileName(file.name)
    const url = await fileToDataUrl(file)
    setDataUrl(url)
    setFields(getCameraFields(url))
  }

  const updateField = (key, value) => setFields((f) => ({ ...f, [key]: value }))

  const handleDownload = () => {
    if (!fields) return
    const updated = setCameraFields(dataUrl, fields)
    downloadBlob(`${baseName(fileName)}-edited.jpg`, dataUrlToBlob(updated), 'image/jpeg')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Works on JPEG. Editing these values changes only the file's metadata tags — it doesn't change the actual
        pixels, and Image Width/Height here don't resize the photo (a mismatch just means the tag is stale).
      </p>

      {!dataUrl && <ImageDropzone onFiles={handleFiles} accept="image/jpeg,.jpg,.jpeg" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {dataUrl && fields && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <img src={dataUrl} alt="" className="max-h-72 w-full rounded-lg border border-slate-300 object-contain" />
            <button
              type="button"
              onClick={() => setDataUrl('')}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Choose a different image
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Camera info</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Brand</span>
                  <input
                    type="text"
                    value={fields.make}
                    onChange={(e) => updateField('make', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Model</span>
                  <input
                    type="text"
                    value={fields.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="col-span-2 block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Lens type</span>
                  <input
                    type="text"
                    value={fields.lensModel}
                    onChange={(e) => updateField('lensModel', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Shot settings</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Aperture (f/)</span>
                  <input
                    type="text"
                    value={fields.aperture}
                    onChange={(e) => updateField('aperture', e.target.value)}
                    placeholder="2.8"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Shutter speed</span>
                  <input
                    type="text"
                    value={fields.shutterSpeed}
                    onChange={(e) => updateField('shutterSpeed', e.target.value)}
                    placeholder="1/250"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">ISO</span>
                  <input
                    type="number"
                    value={fields.iso}
                    onChange={(e) => updateField('iso', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 pt-5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={fields.flashFired}
                    onChange={(e) => updateField('flashFired', e.target.checked)}
                    className="accent-teal-600"
                  />
                  Flash fired
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Time and date</p>
              <input
                type="datetime-local"
                value={fields.dateTime}
                onChange={(e) => updateField('dateTime', e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Location</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={fields.latitude}
                    onChange={(e) => updateField('latitude', e.target.value)}
                    placeholder="13.7563"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={fields.longitude}
                    onChange={(e) => updateField('longitude', e.target.value)}
                    placeholder="100.5018"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Dimensions &amp; orientation</p>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Image width</span>
                  <input
                    type="number"
                    value={fields.imageWidth}
                    onChange={(e) => updateField('imageWidth', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Image height</span>
                  <input
                    type="number"
                    value={fields.imageLength}
                    onChange={(e) => updateField('imageLength', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Orientation</span>
                  <select
                    value={fields.orientation}
                    onChange={(e) => updateField('orientation', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {Object.entries(ORIENTATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {value} — {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Save &amp; Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExifEditor
