import { useRef, useState } from 'react'

// Shared file-picker used by every tool that takes image input. Always
// calls onFiles with an array — single-image tools just destructure [file].
function ImageDropzone({ onFiles, multiple = false, accept = 'image/*', label }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/') || f.type === '')
    if (files.length > 0) onFiles(multiple ? files : [files[0]])
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition ${
        isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-slate-400">
        <path d="M4 16l4.5-6 3.5 4.5L15.5 10 20 16" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="1.5" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
      <p className="text-sm font-medium text-slate-600">
        {label || (multiple ? 'Click or drag images here' : 'Click or drag an image here')}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default ImageDropzone
