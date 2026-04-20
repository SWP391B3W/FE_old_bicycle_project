import { PayoutProfileSection } from '@/components/profile/PayoutProfileSection'

export default function PayoutPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tài khoản nhận tiền</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cập nhật thông tin ngân hàng để hệ thống hỗ trợ hoàn tiền buyer và giải ngân seller đúng tài khoản.
        </p>
      </div>

      <PayoutProfileSection />
    </div>
  )
}