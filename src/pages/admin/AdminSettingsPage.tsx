// @ts-nocheck
import { useState, useEffect } from 'react';
import { Settings, Percent, Save, Bell, ShieldCheck, Info } from 'lucide-react';
import { adminSettingsApi } from '@/api/adminSettings.api';
// @ts-ignore
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [feeRate, setFeeRate] = useState<number>(0.1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await adminSettingsApi.getAllSettings();
      const feeSetting = settings.find((s: any) => s.key === 'platform_fee_rate');
      if (feeSetting) {
        setFeeRate(parseFloat(feeSetting.value));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Không thể tải cấu hình hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFee = async () => {
    if (feeRate < 0 || feeRate > 1) {
      toast.error('Tỷ lệ phí phải nằm trong khoảng từ 0 đến 100%.');
      return;
    }

    setSaving(true);
    try {
      await adminSettingsApi.updatePlatformFee(feeRate);
      toast.success('Cập nhật phí sàn thành công! Một thông báo đã được gửi đến các Seller.');
    } catch (error) {
      console.error('Failed to update fee:', error);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Cấu hình hệ thống
        </h2>
        <p className="text-muted-foreground">
          Quản lý các thông số vận hành của nền tảng Old Bicycle.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Platform Fee Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary" />
              Phí dịch vụ nền tảng (Platform Fee)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Phí thu từ người bán cho mỗi giao dịch thành công.
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 space-y-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Tỷ lệ phí hiện tại
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={feeRate}
                    onChange={(e) => setFeeRate(parseFloat(e.target.value))}
                    className="w-full h-14 bg-background border-2 border-border rounded-xl px-12 text-2xl font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">
                    {(feeRate * 100).toFixed(0)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  * Nhập giá trị thập phân (Ví dụ: 0.1 tương ứng với 10%)
                </p>
              </div>

              <div className="md:w-px h-auto md:h-32 bg-border"></div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-primary">Thông báo cho người bán</p>
                    <p className="text-muted-foreground leading-relaxed mt-1">
                      Khi bạn cập nhật, hệ thống sẽ tự động gửi thông báo đến tất cả các Seller về sự thay đổi này.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button
                onClick={handleSaveFee}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full"></div>
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold">Bảo mật & Quyền hạn</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Chỉ có tài khoản quản trị trực tiếp (Direct Admin) mới có quyền thay đổi các thông số lõi này.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Hiệu lực áp dụng</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Tỷ lệ phí mới chỉ áp dụng cho các đơn hàng được khởi tạo sau thời điểm cập nhật.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
