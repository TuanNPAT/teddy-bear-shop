import { useEffect, useState } from 'react';
import { cmsMockApi } from '../../api/cmsMockApi';
import type { StaffMock } from '../../api/cmsMockApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { ShieldAlert, Plus, Lock, Unlock, Users, Info } from 'lucide-react';

export default function AdminStaff() {
  const [staffList, setStaffList] = useState<StaffMock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const loadStaff = () => {
    setStaffList(cmsMockApi.getStaff());
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập họ và tên');
    if (!email.trim() || !email.includes('@')) return toast.error('Email không hợp lệ');

    const res = cmsMockApi.createStaff(name.trim(), email.trim());
    if (res.success) {
      toast.success('Tạo tài khoản Nhân viên thành công!');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      loadStaff();
    } else {
      toast.error(res.message || 'Lỗi xảy ra');
    }
  };

  const handleToggleStatus = (targetEmail: string, currentActive: boolean) => {
    if (targetEmail === 'staff@gmail.com') {
      toast.error('Không được phép khóa tài khoản Nhân viên Seeder mặc định!');
      return;
    }
    const actionName = currentActive ? 'Khóa' : 'Mở khóa';
    const confirmToggle = window.confirm(`Bạn có chắc chắn muốn ${actionName.toLowerCase()} tài khoản '${targetEmail}' không?`);
    if (confirmToggle) {
      cmsMockApi.toggleStaffStatus(targetEmail);
      toast.success(`Đã ${actionName.toLowerCase()} tài khoản nhân viên thành công`);
      loadStaff();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Nhân sự</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Danh sách nhân viên vận hành hệ thống, cấp tài khoản và quản lý trạng thái kích hoạt.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl h-11 px-5 font-bold shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Warning Banner Required */}
      <div className="flex gap-3 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-700">
        <ShieldAlert className="h-5.5 w-5.5 shrink-0 mt-0.5" />
        <div className="text-sm font-bold leading-relaxed space-y-1">
          <p>CẢNH BÁO MÔ PHỎNG (MOCK DATA):</p>
          <p className="font-semibold">
            Chức năng đang mô phỏng do Backend chưa có API tạo tài khoản Staff, dữ liệu tạo ở đây chỉ lưu tạm cục bộ (LocalStorage), chưa thể dùng để đăng nhập thật thông qua cơ sở dữ liệu backend.
          </p>
        </div>
      </div>

      {/* Staff directory table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
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
                    {st.name}
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
                    {st.active ? (
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
                    {st.email === 'staff@gmail.com' ? (
                      <span className="text-xs font-semibold text-muted-foreground italic pr-2">Mặc định</span>
                    ) : st.active ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(st.email, true)}
                        className="rounded-lg text-destructive hover:bg-destructive/10 font-bold"
                      >
                        <Lock className="mr-1.5 h-4 w-4" />
                        Khóa
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(st.email, false)}
                        className="rounded-lg text-emerald-600 hover:bg-emerald-500/10 font-bold"
                      >
                        <Unlock className="mr-1.5 h-4 w-4" />
                        Kích hoạt
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

              <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-700 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Chú ý: Tài khoản nhân viên mới được tạo ở đây sẽ được ghi nhận vào kho nhân sự cục bộ trên trình duyệt để kiểm thử giao diện phân quyền.</span>
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
    </div>
  );
}
