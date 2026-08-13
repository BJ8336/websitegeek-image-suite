import { useState } from 'react'
import piexif from 'piexifjs'
import ToolHeader from '../../components/ToolHeader'
import ImageDropzone from '../../components/ImageDropzone'
import { getToolBySlug } from '../../data/toolsConfig'
import { isJpeg, fileToDataUrl, readExifTags, dataUrlToBlob } from '../../lib/exifCore'
import { baseName } from '../../lib/imageCore'
import { downloadBlob } from '../../utils/downloadFile'

const tool = getToolBySlug('exif-editor')

function ExifEditor() {
  const [fileName, setFileName] = useState('')
  const [dataUrl, setDataUrl] = useState('')
  const [exifObj, setExifObj] = useState(null)
  const [otherTags, setOtherTags] = useState([])
  const [artist, setArtist] = useState('')
  const [copyright, setCopyright] = useState('')
  const [software, setSoftware] = useState('')
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
    try {
      const { exifObj: loaded, tags } = readExifTags(url)
      setExifObj(loaded)
      setArtist(loaded['0th'][piexif.ImageIFD.Artist] || '')
      setCopyright(loaded['0th'][piexif.ImageIFD.Copyright] || '')
      setSoftware(loaded['0th'][piexif.ImageIFD.Software] || '')
      setOtherTags(tags.filter((t) => !['Artist', 'Copyright', 'Software'].includes(t.name)))
    } catch {
      setExifObj({ '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null })
      setOtherTags([])
    }
  }

  const handleDownload = () => {
    if (!exifObj) return
    const updated = { ...exifObj, '0th': { ...exifObj['0th'] } }
    if (artist) updated['0th'][piexif.ImageIFD.Artist] = artist
    if (copyright) updated['0th'][piexif.ImageIFD.Copyright] = copyright
    if (software) updated['0th'][piexif.ImageIFD.Software] = software
    const exifBytes = piexif.dump(updated)
    const newDataUrl = piexif.insert(exifBytes, dataUrl)
    downloadBlob(`${baseName(fileName)}-edited.jpg`, dataUrlToBlob(newDataUrl), 'image/jpeg')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <p className="mb-4 text-xs text-slate-500">
        Works on JPEG. Edit the common fields below — other detected tags are shown read-only for reference.
      </p>

      {!dataUrl && <ImageDropzone onFiles={handleFiles} accept="image/jpeg,.jpg,.jpeg" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {dataUrl && (
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

            {otherTags.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-sm font-medium text-slate-700">Other detected tags</p>
                <ul className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
                  {otherTags.map((t) => (
                    <li key={`${t.ifd}-${t.tagId}`} className="flex justify-between gap-2 py-0.5">
                      <span>{t.name}</span>
                      <span className="truncate text-slate-400">{String(t.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Artist</span>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>
            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Copyright</span>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Software</span>
              <input
                type="text"
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Save & Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExifEditor
