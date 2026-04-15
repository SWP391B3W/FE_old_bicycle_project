import { cn } from '@/lib/utils'
import type { RegisterRole } from './register.types'

const ROLE_OPTIONS: Array<{
    value: RegisterRole
    title: string
    description: string
}> = [
        {
            value: 'buyer',
            title: 'Mua xe',
            description: 'Tìm xe đạp phù hợp',
        },
        {
            value: 'seller',
            title: 'Bán xe',
            description: 'Đăng tin bán xe',
        },
    ]

interface RegisterRoleSelectorProps {
    role: RegisterRole
    onChange: (role: RegisterRole) => void
}

export function RegisterRoleSelector({ role, onChange }: RegisterRoleSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Bạn muốn</label>
            <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'rounded-lg border-2 p-4 text-center transition-all',
                            role === option.value
                                ? 'border-sky-500 bg-sky-500/10 text-white'
                                : 'border-slate-600 bg-slate-800/50 text-slate-200 hover:border-sky-500/50',
                        )}
                    >
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-slate-400">{option.description}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}