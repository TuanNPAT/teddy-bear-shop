import { useEffect, useState } from 'react';
import { cmsMockApi } from '../../api/cmsMockApi';
import { userAdminApi } from '../../api/userAdminApi';
import type { UserAdminResponse } from '../../api/userAdminApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { ShieldAlert, Plus, Lock, Unlock, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

export default function AdminStaff() {
  const { user: currentUser } = useAuthStore();
  const [staffList, setStaffList] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields for mock creation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Lock/Unlock dialog target
  const [statusChangeTarget, setStatusChangeTarget] = useState<UserAdminResponse | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      // Query users with role=STAFF
      const data = await userAdminApi.getUsers({ role: 'STAFF', size: 1000 });
      setStaffList(data.content || []);
    } catch {
      toast.error('Không thể tải danh sách nhân viên từ hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập họ và tên');
    if (!email.trim() || !email.includes('@')) return toast.error('Email không hợp lệ');

    // MOCK creation because backend has no API to create staff directly
    const res = cmsMockApi.createStaff(name.trim(), email.trim());
    if (res.success) {
      toast.success('Tạo tài khoản Nhân viên mô phỏng thành công!');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      // Note: we don't refresh loadStaff() because mock staff is local storage and won't be returned by backend /users?role=STAFF
      toast.warning('Tài khoản này chỉ được lưu tạm cục bộ để phục vụ demo.');
    } else {
      toast.error(res.message || 'Lỗi xảy ra');
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!statusChangeTarget) return;
    setStatusChangeLoading(true);
    const nextStatus = !statusChangeTarget.status;
    try {
      const updated = await userAdminApi.updateUserStatus(statusChangeTarget.id, nextStatus);
      toast.success(
        `Đã ${nextStatus ? 'kích hoạt' : 'khóa'} tài khoản nhân viên ${updated.email} thành công!`
      );
      setStaffList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Nhân sự</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Danh sách nhân viên thật được lấy từ hệ thống và quản lý trạng thái kích hoạt.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl h-11 px-5 font-bold shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Thêm nhân viên (Mock)
        </Button>
      </div>

      {/* Staff directory table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="font-bold">Đang tải danh sách nhân viên...</span>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground font-semibold">
            Không có nhân viên nào trên hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-5 text-sm font-bold text-muted-foreground">Họ và tên nhân viên</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground">Địa chỉ Email</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-36">Chức vụ</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-40">Ngày tham gia</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-36 text-center">Trạng thái</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground text-right w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {staffList.map(st => (
                  <tr key={st.email} className="hover:bg-muted/10 transition-colors duration-200">
                    <td className="p-5 font-bold text-foreground">
                      {st.fullName}
                    </td>
                    <td className="p-5 text-sm font-semibold text-muted-foreground">
                      {st.email}
                    </td>
                    <td className="p-5 text-sm">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-primary/10 text-primary border border-primary/10">
                        <Users className="h-3 w-3" />
                        Staff
                      </span>
                    </td>
                    <td className="p-5 text-sm font-semibold text-muted-foreground">
                      {st.createdAt ? new Date(st.createdAt).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="p-5 text-center">
                      {st.status ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/10">
                          Đang làm việc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive border border-destructive/10">
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      {currentUser?.email === st.email ? (
                        <span className="text-xs font-semibold text-muted-foreground italic pr-2">Tôi (Hiện tại)</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusChangeTarget(st)}
                          className={`rounded-lg font-bold ${
                            st.status ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                        >
                          {st.status ? (
                            <>
                              <Lock className="mr-1.5 h-4 w-4" />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-1.5 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card p-8 rounded-[1.5rem] border border-border shadow-lg space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Thêm Nhân viên mới</h3>
              <p className="text-xs text-muted-foreground mt-1.5">Tạo tài khoản quản trị viên cục bộ để phân quyền.</p>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="staffName" className="font-semibold text-foreground">Họ và tên *</Label>
                <Input
                  id="staffName"
                  placeholder="Nhập họ và tên nhân viên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staffEmail" className="font-semibold text-foreground">Địa chỉ Email *</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  placeholder="staff_new@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                  required
                />
              </div>

              {/* Warning Banner Required for Create Staff Part */}
              <div className="flex gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-700">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed space-y-1">
                  <p>CẢNH BÁO MÔ PHỎNG (MOCK):</p>
                  <p className="font-semibold">
                    Backend chưa hỗ trợ API tạo trực tiếp nhân viên. Tài khoản nhân viên mới được tạo ở đây sẽ được ghi nhận vào bộ nhớ cục bộ để phục vụ demo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="rounded-xl h-12 px-6 font-bold">
                  Tạo tài khoản
                </Button>
              </div>
            </form>
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
              Bạn có chắc chắn muốn {statusChangeTarget?.status ? 'khóa' : 'mở khóa'} tài khoản nhân viên{' '}
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
    </div>
  );
}
