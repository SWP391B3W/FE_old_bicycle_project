import { useEffect, useState, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MoreHorizontal, Ban, CheckCircle, Eye, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminUsersApi } from '@/api/admin-users.api';
import type { AdminUser, AdminUserActivity } from '@/types/admin-user';
import type { AppRole, UserStatus } from '@/types/auth';

const roleLabels: Record<string, string> = {
    buyer: 'Người mua',
    seller: 'Người bán',
    inspector: 'Kiểm định viên',
    admin: 'Admin',
    BUYER: 'Người mua',
    SELLER: 'Người bán',
    INSPECTOR: 'Kiểm định viên',
    ADMIN: 'Admin',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Confirm dialog for ban/unban
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        userId: string;
        action: 'ban' | 'unban';
    }>({ open: false, userId: '', action: 'ban' });

    // Password reset dialog
    const [passwordDialog, setPasswordDialog] = useState<{
        open: boolean;
        userId: string;
        newPassword: string;
        loading: boolean;
    }>({ open: false, userId: '', newPassword: '', loading: false });

    // Activity detail dialog
    const [activityDialog, setActivityDialog] = useState<{
        open: boolean;
        userId: string;
        data: AdminUserActivity | null;
        loading: boolean;
    }>({ open: false, userId: '', data: null, loading: false });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await adminUsersApi.getAll({
                keyword: searchQuery || undefined,
                role: roleFilter !== 'all' ? (roleFilter as AppRole) : undefined,
                status: statusFilter !== 'all' ? (statusFilter as UserStatus) : undefined,
                page,
                size: 10,
            });
            setUsers(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, roleFilter, statusFilter, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAction = (userId: string, action: 'ban' | 'unban') => {
        setConfirmDialog({ open: true, userId, action });
    };

    const handleConfirm = async () => {
        const newStatus = confirmDialog.action === 'ban' ? 'banned' : 'active';
        try {
            await adminUsersApi.updateStatus(confirmDialog.userId, { status: newStatus });
            fetchUsers();
        } catch {
            // silently refresh anyway
        } finally {
            setConfirmDialog({ open: false, userId: '', action: 'ban' });
        }
    };

    const handleResetPassword = async () => {
        if (!passwordDialog.newPassword.trim()) return;
        setPasswordDialog((prev) => ({ ...prev, loading: true }));
        try {
            await adminUsersApi.resetPassword(passwordDialog.userId, { newPassword: passwordDialog.newPassword });
            setPasswordDialog({ open: false, userId: '', newPassword: '', loading: false });
        } catch {
            setPasswordDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleViewActivity = async (userId: string) => {
        setActivityDialog({ open: true, userId, data: null, loading: true });
        try {
            const data = await adminUsersApi.getActivity(userId);
            setActivityDialog((prev) => ({ ...prev, data, loading: false }));
        } catch {
            setActivityDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const columns: ColumnDef<AdminUser>[] = [
        {
            accessorKey: 'fullName',
            header: 'Họ tên',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.fullName || `${row.original.firstName} ${row.original.lastName}`}</p>
                    <p className="text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            ),
        },
        { accessorKey: 'phone', header: 'Số điện thoại', cell: ({ row }) => row.original.phone || '—' },
        {
            accessorKey: 'role',
            header: 'Vai trò',
            cell: ({ row }) => roleLabels[row.original.role] || row.original.role,
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status as any} />,
        },
        {
            accessorKey: 'isVerified',
            header: 'Đã xác minh',
            cell: ({ row }) => (
                <span className={row.original.isVerified ? 'text-green-500 text-sm' : 'text-muted-foreground text-sm'}>
                    {row.original.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày đăng ký',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('vi-VN'),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewActivity(row.original.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem hoạt động
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPasswordDialog({ open: true, userId: row.original.id, newPassword: '', loading: false })}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Đặt lại mật khẩu
                        </DropdownMenuItem>
                        {row.original.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleAction(row.original.id, 'ban')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Khóa tài khoản
                            </DropdownMenuItem>
                        ) : row.original.status === 'banned' ? (
                            <DropdownMenuItem onClick={() => handleAction(row.original.id, 'unban')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mở khóa
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
                <p className="text-muted-foreground">
                    Xem và quản lý tất cả người dùng trong hệ thống.
                    {!loading && <span className="ml-1 text-xs">({totalElements} người dùng)</span>}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                        className="pl-9"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v ?? 'all'); setPage(0); }}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="BUYER">Người mua</SelectItem>
                        <SelectItem value="SELLER">Người bán</SelectItem>
                        <SelectItem value="INSPECTOR">Kiểm định viên</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? 'all'); setPage(0); }}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="banned">Bị khóa</SelectItem>
                        <SelectItem value="unactive">Chưa kích hoạt</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Error */}
            {error && <div className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm">{error}</div>}

            {/* Loading skeleton */}
            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            ) : (
                <>
                    <DataTable columns={columns} data={users} />
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">Trang {page + 1} / {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Confirm ban/unban */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.action === 'ban' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                description={
                    confirmDialog.action === 'ban'
                        ? 'Bạn có chắc muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập.'
                        : 'Bạn có chắc muốn mở khóa tài khoản này?'
                }
                confirmText={confirmDialog.action === 'ban' ? 'Khóa' : 'Mở khóa'}
                onConfirm={handleConfirm}
                variant={confirmDialog.action === 'ban' ? 'destructive' : 'default'}
            />

            {/* Reset password dialog */}
            <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog((prev) => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={passwordDialog.newPassword}
                            onChange={(e) => setPasswordDialog((prev) => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setPasswordDialog({ open: false, userId: '', newPassword: '', loading: false })}>
                                Huỷ
                            </Button>
                            <Button onClick={handleResetPassword} disabled={passwordDialog.loading || !passwordDialog.newPassword.trim()}>
                                {passwordDialog.loading ? 'Đang lưu...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* User activity dialog */}
            <Dialog open={activityDialog.open} onOpenChange={(open) => setActivityDialog((prev) => ({ ...prev, open }))}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Hoạt động người dùng</DialogTitle>
                    </DialogHeader>
                    {activityDialog.loading ? (
                        <div className="space-y-2">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-muted animate-pulse rounded" />)}
                        </div>
                    ) : activityDialog.data ? (
                        <div className="space-y-3 text-sm">
                            {[
                                ['Email', activityDialog.data.email],
                                ['Vai trò', roleLabels[activityDialog.data.role] || activityDialog.data.role],
                                ['Tổng sản phẩm', activityDialog.data.totalProducts],
                                ['Đơn đã mua', activityDialog.data.totalOrdersAsBuyer],
                                ['Đơn đã bán', activityDialog.data.totalOrdersAsSeller],
                                ['Báo cáo đã gửi', activityDialog.data.totalReportsSubmitted],
                                ['Wishlist', activityDialog.data.totalWishlistItems],
                                ['Cuộc hội thoại', activityDialog.data.totalConversations],
                                ['Thông báo chưa đọc', activityDialog.data.unreadNotifications],
                            ].map(([label, val]) => (
                                <div key={String(label)} className="flex justify-between border-b border-border pb-1">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Không thể tải dữ liệu hoạt động.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
