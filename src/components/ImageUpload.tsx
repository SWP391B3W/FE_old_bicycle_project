import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Camera } from 'lucide-react'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages: string[] = []

    Array.from(files).forEach(file => {
      if (images.length + newImages.length >= maxImages) return

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string)
          if (newImages.length === files.length || images.length + newImages.length >= maxImages) {
            onImagesChange([...images, ...newImages])
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (images.length >= maxImages) return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImagesChange([...images, e.target.result as string])
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Hình ảnh xe đạp <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Tối đa {maxImages} hình ảnh. Hình ảnh đầu tiên sẽ là ảnh đại diện.
        </p>
      </div>

      {/* Upload buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Chọn từ thư mục
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={openCamera}
          disabled={images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Chụp ảnh
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                <img
                  src={image}
                  alt={`Hình ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-sky-500 text-white text-xs px-2 py-1 rounded">
                    Ảnh đại diện
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có hình ảnh nào</p>
          <p className="text-sm text-slate-400">Nhấp vào nút "Chọn từ thư mục" hoặc "Chụp ảnh" để thêm hình</p>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-amber-600">
          Đã đạt giới hạn tối đa {maxImages} hình ảnh
        </p>
      )}
    </div>
  )
}