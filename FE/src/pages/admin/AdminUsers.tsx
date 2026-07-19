import { useEffect, useState } from 'react';
import { userAdminApi } from '../../api/userAdminApi';
import type { UserAdminResponse } from '../../api/userAdminApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  Lock,
  Unlock,
  Shield,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserAdminResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Alert Dialog States (Lock/Unlock)
  const [statusChangeTarget, setStatusChangeTarget] = useState<UserAdminResponse | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  // Alert Dialog States (Role Change)
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: UserAdminResponse; nextRole: 'ADMIN' | 'STAFF' | 'CUSTOMER' } | null>(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.status = statusFilter === 'active';

      const data = await userAdminApi.getUsers(params);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(0);
  };

  const handleToggleStatusConfirm = async () => {
    if (!statusChangeTarget) return;
    setStatusChangeLoading(true);
    const nextStatus = !statusChangeTarget.status;
    try {
      const updated = await userAdminApi.updateUserStatus(statusChangeTarget.id, nextStatus);
      toast.success(
        `Đã ${nextStatus ? 'kích hoạt' : 'khóa'} tài khoản ${updated.email} thành công!`
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (selectedUser?.id === updated.id) {
        setSelectedUser(updated);
      }
      setStatusChangeTarget(null);
    } catch (err: any) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 2011) {
        toast.error('Không thể tự khóa/mở tài khoản của chính mình');
      } else if (errorCode === 2014) {
        toast.error('Không thể khóa tài khoản Admin khác');
      } else if (errorCode === 2016) {
        toast.error('Không thể khóa Admin cuối cùng trong hệ thống');
      } else {
        toast.error(err.response?.data?.message || 'Thao tác cập nhật trạng thái thất bại');
      }
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleChangeTarget) return;
    setRoleChangeLoading(true);
    const { user, nextRole } = roleChangeTarget;
    try {
      const updated = await userAdminApi.updateUserRole(user.id, nextRole);
      toast.success(`Đã chuyển vai trò tài khoản ${updated.email} thành ${translateRole(nextRole)}!`);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (selectedUser?.id === updated.id) {
        setSelectedUser(updated);
      }
      roleChangeTarget.user.role = nextRole; // local sync to ensure clean UI
      setRoleChangeTarget(null);
    } catch (err: any) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 2012) {
        toast.error('Không thể tự đổi role của chính mình');
      } else if (errorCode === 2016) {
        toast.error('Không thể hạ cấp Admin cuối cùng trong hệ thống');
      } else {
        toast.error(err.response?.data?.message || 'Cập nhật quyền vai trò thất bại');
      }
    } finally {
      setRoleChangeLoading(false);
    }
  };



  const viewUserDetails = async (id: number) => {
    setDetailLoading(true);
    try {
      const details = await userAdminApi.getUserById(id);
      setSelectedUser(details);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải chi tiết người dùng');
    } finally {
      setDetailLoading(false);
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'STAFF':
        return 'Nhân viên';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-bold px-3 py-1 rounded-full"><Shield className="w-3.5 h-3.5 mr-1" />Admin</Badge>;
      case 'STAFF':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold px-3 py-1 rounded-full"><UserIcon className="w-3.5 h-3.5 mr-1" />Staff</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold px-3 py-1 rounded-full">Customer</Badge>;
    }
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold px-3 py-1 rounded-full">Hoạt động</Badge>
    ) : (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1 rounded-full">Bị khóa</Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Tài khoản</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Xem danh sách người dùng thật từ cơ sở dữ liệu, phân quyền tài khoản (Admin, Staff, Customer), khóa/mở khóa hoạt động.
        </p>
      </div>

      {/* Advanced Filter Form */}
      <form onSubmit={handleSearchSubmit} className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <Label htmlFor="searchQuery" className="font-semibold text-foreground">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                id="searchQuery"
                placeholder="Nhập tên, email hoặc số điện thoại..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="rounded-xl pl-10 bg-muted/20 border-border h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleFilter" className="font-semibold text-foreground">Vai trò</Label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl bg-muted/20 border border-border p-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-11"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="statusFilter" className="font-semibold text-foreground">Trạng thái</Label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl bg-muted/20 border border-border p-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-11"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="rounded-xl h-11 px-5 font-bold" onClick={handleResetFilters}>
            Đặt lại lọc
          </Button>
          <Button type="submit" className="rounded-xl h-11 px-6 font-bold shadow-md hover:shadow-lg transition-all">
            Áp dụng lọc
          </Button>
        </div>
      </form>

      {/* User Directory Table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="font-bold">Đang tải danh sách người dùng...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground font-semibold">
            Không tìm thấy tài khoản người dùng nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-5 text-sm font-bold text-muted-foreground">Thông tin Người dùng</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-40">Vai trò</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-40">Trạng thái</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-48">Ngày đăng ký</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground text-right w-44">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-5">
                      <div>
                        <p className="font-bold text-foreground">{u.fullName}</p>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{u.email}</p>
                        {u.phone && <p className="text-xs font-semibold text-muted-foreground">{u.phone}</p>}
                      </div>
                    </td>
                    <td className="p-5">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="p-5">
                      {getStatusBadge(u.status)}
                    </td>
                    <td className="p-5 text-sm text-muted-foreground font-semibold">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="p-5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View details button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-muted"
                        onClick={() => viewUserDetails(u.id)}
                        disabled={detailLoading}
                      >
                        <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                      </Button>

                      {/* Lock / Unlock Toggle action button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-xl ${
                          u.status ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-emerald-500/10 text-emerald-500'
                        }`}
                        onClick={() => setStatusChangeTarget(u)}
                        disabled={currentUser?.email === u.email}
                      >
                        {u.status ? <Lock className="h-4.5 w-4.5" /> : <Unlock className="h-4.5 w-4.5" />}
                      </Button>

                      {/* Role selection changer */}
                      <select
                        value={u.role}
                        disabled={currentUser?.email === u.email}
                        onChange={(e) =>
                          setRoleChangeTarget({
                            user: u,
                            nextRole: e.target.value as any,
                          })
                        }
                        className="rounded-lg bg-muted/40 border border-border/70 p-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24 h-9"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="STAFF">Staff</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="rounded-xl"
          >
            Trước
          </Button>
          <span className="text-sm font-bold text-muted-foreground px-4">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="rounded-xl"
          >
            Sau
          </Button>
        </div>
      )}

      {/* User Details Modal Dialog */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card p-8 rounded-[1.5rem] border border-border shadow-lg space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-border/50 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Thông tin chi tiết</h3>
                <p className="text-xs font-semibold text-muted-foreground mt-1">ID Người dùng: #{selectedUser.id}</p>
              </div>
              <div className="flex gap-2">
                {getRoleBadge(selectedUser.role)}
                {getStatusBadge(selectedUser.status)}
              </div>
            </div>

            {/* Profile fields detailed */}
            <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3.5 text-sm">
                <UserIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Họ và tên</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedUser.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email đăng ký</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Số điện thoại</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Địa chỉ giao hàng</span>
                  <p className="font-semibold text-foreground leading-relaxed mt-0.5">{selectedUser.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Ngày tham gia hệ thống</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('vi-VN') : '---'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border/50 flex justify-end items-center">
              <Button variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsDetailModalOpen(false)}>
                Đóng lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Confirmation dialog */}
      <AlertDialog open={statusChangeTarget !== null} onOpenChange={(open) => !open && setStatusChangeTarget(null)}>
        <AlertDialogContent className="rounded-3xl p-6 border-transparent shadow-xl max-w-md bg-card">
          <AlertDialogHeader className="sm:place-items-center">
            <AlertDialogTitle className="text-xl font-extrabold text-foreground w-full text-center">
              {statusChangeTarget?.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed w-full text-center">
              Bạn có chắc chắn muốn {statusChangeTarget?.status ? 'khóa' : 'mở khóa'} tài khoản người dùng{' '}
              <span className="font-bold text-foreground">'{statusChangeTarget?.email}'</span> không? Người dùng sẽ{' '}
              {statusChangeTarget?.status ? 'không thể đăng nhập' : 'được khôi phục quyền truy cập'} vào hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <AlertDialogCancel className="rounded-xl border border-border bg-background hover:bg-muted text-foreground h-11 font-semibold px-5 mt-0 w-full sm:w-auto">
              Hủy bỏ
            </AlertDialogCancel>
            <Button
              onClick={handleToggleStatusConfirm}
              disabled={statusChangeLoading}
              className={`rounded-xl h-11 px-5 font-bold w-full sm:w-auto ${
                statusChangeTarget?.status
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {statusChangeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : statusChangeTarget?.status ? (
                'Xác nhận Khóa'
              ) : (
                'Xác nhận Mở'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Confirmation dialog */}
      <AlertDialog open={roleChangeTarget !== null} onOpenChange={(open) => !open && setRoleChangeTarget(null)}>
        <AlertDialogContent className="rounded-3xl p-6 border-transparent shadow-xl max-w-md bg-card">
          <AlertDialogHeader className="sm:place-items-center">
            <AlertDialogTitle className="text-xl font-extrabold text-foreground w-full text-center">
              Thay đổi vai trò (Role)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed w-full text-center">
              Bạn có thực sự muốn thay đổi vai trò tài khoản{' '}
              <span className="font-bold text-foreground">'{roleChangeTarget?.user.email}'</span> sang{' '}
              <span className="font-bold text-primary">'{roleChangeTarget ? translateRole(roleChangeTarget.nextRole) : ''}'</span>{' '}
              không? Quyền truy cập các tính năng quản trị sẽ thay đổi ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <AlertDialogCancel className="rounded-xl border border-border bg-background hover:bg-muted text-foreground h-11 font-semibold px-5 mt-0 w-full sm:w-auto">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChangeConfirm}
              disabled={roleChangeLoading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 h-11 px-5 font-bold w-full sm:w-auto"
            >
              {roleChangeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận Thay đổi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
