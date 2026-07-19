import { useEffect, useState } from 'react';
import { cmsMockApi } from '../../api/cmsMockApi';
import type { CategoryMock } from '../../api/cmsMockApi';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Edit3, Info, AlertTriangle, Lock } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryMock[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryMock | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Dialog blocking alert
  const [blockingAlert, setBlockingAlert] = useState<{ isOpen: boolean; catName: string; count: number } | null>(null);

  useEffect(() => {
    setCategories(cmsMockApi.getCategories());
  }, []);

  const handleEditClick = (cat: CategoryMock) => {
    setCurrentCategory(cat);
    setEditName(cat.name);
    setEditDescription(cat.description);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentCategory) return;
    if (!editName.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }
    const updated = cmsMockApi.updateCategory(currentCategory.id, editName, editDescription);
    setCategories(updated);
    setIsEditModalOpen(false);
    toast.success('Cập nhật danh mục thành công');
  };

  const handleDeleteClick = async (cat: CategoryMock) => {
    try {
      // Check if there are active products belonging to this category in backend
      const res = await api.get(`/products?size=1000`);
      const products = res.data.result.content || [];
      const count = products.filter((p: any) => p.category === cat.id).length;

      if (count > 0) {
        // Block delete action and show popup alert
        setBlockingAlert({
          isOpen: true,
          catName: cat.name,
          count
        });
      } else {
        toast.warning(`Danh mục '${cat.name}' là hằng số Enum cố định từ Backend, không được phép xóa thật!`);
      }
    } catch {
      toast.error('Có lỗi xảy ra khi kiểm tra sản phẩm thuộc danh mục');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Danh mục</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Danh sách các loại danh mục sản phẩm thú bông hiện có.
          </p>
        </div>

        {/* Disabled Action Button with Warning Icon and Tooltip */}
        <div className="relative group self-start">
          <Button disabled className="rounded-xl h-11 px-5 font-bold cursor-not-allowed opacity-55">
            <Lock className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
          <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-destructive text-destructive-foreground text-xs rounded-xl shadow-lg border border-destructive/20 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <p className="font-semibold leading-relaxed">
                Không thể thêm danh mục mới tự do vì hệ thống danh mục gấu bông được cấu hình cố định bằng Enum ở phía Backend (TEDDY_BEAR, KEYCHAIN, PILLOW, ACCESSORY, GIFT_SET).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-amber-700">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm font-semibold leading-relaxed">
          <span className="font-bold">Lưu ý hệ thống:</span> Danh mục sản phẩm được đồng bộ hóa trực tiếp dưới dạng Enum ở cơ sở dữ liệu. Bạn chỉ có quyền chỉnh sửa tên hiển thị tiếng Việt và nội dung mô tả của 5 nhóm danh mục cố định dưới đây để không làm gián đoạn liên kết sản phẩm.
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-5 text-sm font-bold text-muted-foreground">Mã danh mục (Enum ID)</th>
                <th className="p-5 text-sm font-bold text-muted-foreground">Tên hiển thị</th>
                <th className="p-5 text-sm font-bold text-muted-foreground">Mô tả chi tiết</th>
                <th className="p-5 text-sm font-bold text-muted-foreground text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/10 transition-colors duration-200">
                  <td className="p-5 text-sm font-mono font-bold text-foreground">
                    {cat.id}
                  </td>
                  <td className="p-5 text-sm font-bold text-foreground">
                    {cat.name}
                  </td>
                  <td className="p-5 text-sm font-semibold text-muted-foreground max-w-md truncate" title={cat.description}>
                    {cat.description || 'Chưa có mô tả'}
                  </td>
                  <td className="p-5 text-sm text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(cat)}
                      className="rounded-lg hover:bg-muted font-bold text-primary"
                    >
                      <Edit3 className="mr-1.5 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(cat)}
                      className="rounded-lg text-destructive hover:bg-destructive/10 font-bold"
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card p-8 rounded-[1.5rem] border border-border shadow-lg space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Chỉnh sửa Danh mục</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="catId" className="font-semibold text-foreground">Mã danh mục (Enum)</Label>
                <Input id="catId" value={currentCategory?.id || ''} disabled className="rounded-xl bg-muted h-12" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catName" className="font-semibold text-foreground">Tên hiển thị</Label>
                <Input
                  id="catName"
                  placeholder="Nhập tên danh mục tiếng Việt"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catDesc" className="font-semibold text-foreground">Mô tả danh mục</Label>
                <textarea
                  id="catDesc"
                  placeholder="Nhập thông tin mô tả danh mục"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-muted/20 border border-border p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsEditModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button className="rounded-xl h-12 px-6 font-bold" onClick={handleSaveEdit}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Blocking Alert Dialog */}
      {blockingAlert?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card p-8 rounded-[1.5rem] border border-destructive/20 shadow-lg space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-foreground">Không được phép xóa!</h3>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Danh mục <span className="text-destructive font-bold">"{blockingAlert.catName}"</span> hiện đang chứa <span className="text-foreground font-bold">{blockingAlert.count} sản phẩm active</span> trong cơ sở dữ liệu. Hệ thống đã chặn thao tác để tránh lỗi hiển thị catalog ngoài Client.
              </p>
            </div>

            <Button
              className="w-full rounded-xl h-12 font-bold"
              variant="default"
              onClick={() => setBlockingAlert(null)}
            >
              Đã hiểu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
