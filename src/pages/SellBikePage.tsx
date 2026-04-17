import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import ImageUpload from '@/components/ImageUpload'

export default function SellBikePage() {
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const submitDisabled = !title || !brand || !model || !price || !location || !description || images.length === 0

  const handleSubmit = (event: any) => {
    event.preventDefault()
    console.log('Form data:', {
      title,
      brand,
      model,
      price,
      location,
      description,
      images
    })
    setSuccess(true)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Đăng tin bán xe</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Đăng tin nhanh trong vài bước</h1>
            </div>
            <Button asChild variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">
              <Link to={ROUTES.MARKET}>Xem thị trường</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Điền thông tin chi tiết để tăng khả năng bán nhanh và nhận được khách hàng phù hợp.
          </p>
        </div>

        {success ? (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm shadow-slate-900/5">
            <h2 className="text-2xl font-semibold text-slate-950">Tin đăng đã được gửi</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Cảm ơn bạn đã đăng tin. Ban quản trị sẽ kiểm duyệt và gửi thông báo khi tin đăng được duyệt.
            </p>
            <Button asChild className="mt-6 bg-slate-950 text-white hover:bg-slate-800">
              <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sell-title" className="mb-2 block text-sm font-medium text-slate-700">Tiêu đề tin đăng</label>
                <input
                  id="sell-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ví dụ: Xe đạp đua Pinarello F12 đã kiểm định"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label htmlFor="sell-brand" className="mb-2 block text-sm font-medium text-slate-700">Thương hiệu</label>
                <input
                  id="sell-brand"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="Pinarello, Trek, Giant..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label htmlFor="sell-model" className="mb-2 block text-sm font-medium text-slate-700">Model</label>
                <input
                  id="sell-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Mẫu xe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label htmlFor="sell-price" className="mb-2 block text-sm font-medium text-slate-700">Giá</label>
                <input
                  id="sell-price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="VNĐ"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mt-6">
              <ImageUpload images={images} onImagesChange={setImages} />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sell-location" className="mb-2 block text-sm font-medium text-slate-700">Địa điểm</label>
                <input
                  id="sell-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Quận, tỉnh"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label htmlFor="sell-description" className="mb-2 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  id="sell-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ghi rõ tình trạng, tuổi xe, bảo trì..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Hoàn thiện tin đăng để gia tăng lượt xem và tương tác với người mua.
              </div>
              <Button type="submit" disabled={submitDisabled} className="rounded-2xl bg-slate-950 px-6 py-3 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
                Gửi tin đăng
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
