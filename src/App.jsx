import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ToolPlaceholder from './components/ToolPlaceholder'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import NotFound from './pages/NotFound'
import { tools } from './data/toolsConfig'
import CompressResizeImage from './tools/compress-resize-image/CompressResizeImage'
import ConvertImageFormat from './tools/convert-image-format/ConvertImageFormat'
import CropImage from './tools/crop-image/CropImage'
import FlipImage from './tools/flip-image/FlipImage'
import RotateImage from './tools/rotate-image/RotateImage'
import StraightenPhoto from './tools/straighten-photo/StraightenPhoto'
import BlurImage from './tools/blur-image/BlurImage'
import SharpenImage from './tools/sharpen-image/SharpenImage'
import XeroxEffect from './tools/xerox-effect/XeroxEffect'
import RoundCornerImage from './tools/round-corner-image/RoundCornerImage'
import BorderImage from './tools/border-image/BorderImage'
import ImageColorPicker from './tools/image-color-picker/ImageColorPicker'
import ImageColorPalette from './tools/image-color-palette/ImageColorPalette'
import MergeImagesCollage from './tools/merge-images-collage/MergeImagesCollage'
import PolaroidImageMaker from './tools/polaroid-image-maker/PolaroidImageMaker'
import AddTextToImage from './tools/add-text-to-image/AddTextToImage'
import WatermarkImage from './tools/watermark-image/WatermarkImage'
import ExifRemover from './tools/exif-remover/ExifRemover'
import ExifEditor from './tools/exif-editor/ExifEditor'
import DpiConverter from './tools/dpi-converter/DpiConverter'
import DpiChecker from './tools/dpi-checker/DpiChecker'
import PhotoPrintSizeChecker from './tools/photo-print-size-checker/PhotoPrintSizeChecker'
import AddDateTimestamp from './tools/add-date-timestamp/AddDateTimestamp'
import BackgroundRemover from './tools/background-remover/BackgroundRemover'
import PassportPhotoMaker from './tools/passport-photo-maker/PassportPhotoMaker'
import ProfilePictureMaker from './tools/profile-picture-maker/ProfilePictureMaker'
import InstagramGridMaker from './tools/instagram-grid-maker/InstagramGridMaker'
import ImageSteganography from './tools/image-steganography/ImageSteganography'
import AsciiArtGenerator from './tools/ascii-art-generator/AsciiArtGenerator'
import HeicViewer from './tools/heic-viewer/HeicViewer'
import BulkPhotoDateStamper from './tools/bulk-photo-date-stamper/BulkPhotoDateStamper'
import BulkCopyrightWatermark from './tools/bulk-copyright-watermark/BulkCopyrightWatermark'
import BulkSocialMediaStamper from './tools/bulk-social-media-stamper/BulkSocialMediaStamper'
import BulkLogoAdder from './tools/bulk-logo-adder/BulkLogoAdder'
import BulkProductLabeler from './tools/bulk-product-labeler/BulkProductLabeler'

// Tools with a real implementation. Everything else in toolsConfig still
// falls back to ToolPlaceholder until its phase is built.
const TOOL_COMPONENTS = {
  'compress-resize-image': CompressResizeImage,
  'convert-image-format': ConvertImageFormat,
  'crop-image': CropImage,
  'flip-image': FlipImage,
  'rotate-image': RotateImage,
  'straighten-photo': StraightenPhoto,
  'blur-image': BlurImage,
  'sharpen-image': SharpenImage,
  'xerox-effect': XeroxEffect,
  'round-corner-image': RoundCornerImage,
  'border-image': BorderImage,
  'image-color-picker': ImageColorPicker,
  'image-color-palette': ImageColorPalette,
  'merge-images-collage': MergeImagesCollage,
  'polaroid-image-maker': PolaroidImageMaker,
  'add-text-to-image': AddTextToImage,
  'watermark-image': WatermarkImage,
  'exif-remover': ExifRemover,
  'exif-editor': ExifEditor,
  'dpi-converter': DpiConverter,
  'dpi-checker': DpiChecker,
  'photo-print-size-checker': PhotoPrintSizeChecker,
  'add-date-timestamp': AddDateTimestamp,
  'background-remover': BackgroundRemover,
  'passport-photo-maker': PassportPhotoMaker,
  'profile-picture-maker': ProfilePictureMaker,
  'instagram-grid-maker': InstagramGridMaker,
  'image-steganography': ImageSteganography,
  'ascii-art-generator': AsciiArtGenerator,
  'heic-viewer': HeicViewer,
  'bulk-photo-date-stamper': BulkPhotoDateStamper,
  'bulk-copyright-watermark': BulkCopyrightWatermark,
  'bulk-social-media-stamper': BulkSocialMediaStamper,
  'bulk-logo-adder': BulkLogoAdder,
  'bulk-product-labeler': BulkProductLabeler,
}

function App() {
  return (
    <BrowserRouter basename="/image-suite" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          {tools.map((tool) => {
            const ToolComponent = TOOL_COMPONENTS[tool.slug]
            return (
              <Route
                key={tool.slug}
                path={`/${tool.slug}`}
                element={ToolComponent ? <ToolComponent /> : <ToolPlaceholder tool={tool} />}
              />
            )
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
