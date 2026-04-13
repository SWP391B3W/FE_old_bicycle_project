import { Link } from 'react-router-dom'
import { Bike, Share2, Mail, Phone, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'

const footerLinks = {
    marketplace: [
        { name: 'Mua xe đạp', href: ROUTES.MARKET },
        { name: 'Bán xe đạp', href: ROUTES.SELL },
        { name: 'Xe đạp đường trường', href: ROUTES.MARKET },
        { name: 'Xe đạp địa hình', href: ROUTES.MARKET },
    ],
    support: [
        { name: 'Hướng dẫn mua bán', href: ROUTES.GUIDE },
        { name: 'Câu hỏi thường gặp', href: ROUTES.GUIDE },
        { name: 'Liên hệ hỗ trợ', href: ROUTES.GUIDE },
        { name: 'Báo cáo vi phạm', href: ROUTES.GUIDE },
    ],
    company: [
        { name: 'Giới thiệu', href: '/' },
        { name: 'Điều khoản sử dụng', href: '/' },
        { name: 'Chính sách bảo mật', href: '/' },
        { name: 'Quy chế hoạt động', href: '/' },
    ],
}

export default function AppFooter() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to={ROUTES.HOME} className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Bike className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">BikeExchange</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Nền tảng mua bán xe đạp thể thao cũ uy tín hàng đầu Việt Nam.
                            Kết nối người mua và người bán một cách an toàn, minh bạch.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Share2 className="h-5 w-5" />
                            </a>
                            <a href="mailto:contact@bikeexchange.vn" className="text-muted-foreground hover:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Marketplace */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Sàn giao dịch</h3>
                        <ul className="space-y-3">
                            {footerLinks.marketplace.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Hỗ trợ</h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Liên hệ</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>1900 1234</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>contact@bikeexchange.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © 2026 BikeExchange. Tất cả quyền được bảo lưu.
                    </p>
                    <div className="flex gap-6">
                        {footerLinks.company.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
