import { ArrowRight, Bike } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface HomeSellerCtaSectionProps {
  sellerEntryHref: string
}

export function HomeSellerCtaSection({ sellerEntryHref }: HomeSellerCtaSectionProps) {
  return (
    <section className="bg-slate-950 py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <Bike className="mx-auto h-12 w-12 text-white/90" />
          <h2 className="mt-6 text-2xl font-bold text-white md:text-3xl">
            Bạn muốn bán xe đạp của mình?
          </h2>
          <p className="mt-4 text-lg text-slate-200">
            Tạo tin dễ dàng, chờ ban quản trị kiểm định chất lượng trước khi được đăng bán
            công khai.
          </p>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="mt-8 border-white bg-white text-slate-950 hover:bg-slate-100"
          >
            <Link to={sellerEntryHref}>
              Đăng tin bán xe ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}