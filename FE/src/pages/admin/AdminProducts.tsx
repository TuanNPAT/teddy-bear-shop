import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Search, Filter, Edit3, Trash2, Plus, Check, X, RotateCcw, Loader2 } from 'lucide-react';
import { cmsMockApi } from '../../api/cmsMockApi';

interface Product {
  productId: number;
  productCode: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  status: 'ACTIVE' | 'INACTIVE';
  stock: number;
  deletedAt?: string | null;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED'>('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('TEDDY_BEAR');
  const [stock, setStock] = useState('');
  const [productStatus, setProductStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories list
  const categories = cmsMockApi.getCategories();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (statusFilter === 'DELETED') {
        // Fetch deleted products
        const res = await api.get('/products/deleted');
        const list = res.data.result || [];
        setProducts(list);
        setTotalPages(1);
      } else {
        // Fetch normal products with filtering
        const params: Record<string, any> = {
          page: currentPage,
          size: pageSize,
        };
        if (searchTerm.trim()) params.name = searchTerm.trim();
        if (categoryFilter) params.category = categoryFilter;

        const res = await api.get('/products', { params });
        const data = res.data.result;
        
        let content = data.content || [];
        // Filter locally by active/inactive status if statusFilter is not ALL
        if (statusFilter === 'ACTIVE') {
          content = content.filter((p: Product) => p.status === 'ACTIVE');
        } else if (statusFilter === 'INACTIVE') {
          content = content.filter((p: Product) => p.status === 'INACTIVE');
        }

        setProducts(content);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProducts();
  };

  const handleAddClick = () => {
    setModalType('ADD');
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('TEDDY_BEAR');
    setStock('');
    setProductStatus('ACTIVE');
    setImageFile(null);
    setFallbackImageUrl('');
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setModalType('EDIT');
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCategory(product.category);
    setStock(product.stock.toString());
    setProductStatus(product.status);
    setImageFile(null);
    setFallbackImageUrl(product.imageUrls[0] || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    if (!name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!price || Number(price) < 0) return toast.error('Giá sản phẩm không hợp lệ');
    if (!stock || Number(stock) < 0) return toast.error('Số lượng tồn không hợp lệ');

    setIsSubmitting(true);
    try {
      if (modalType === 'ADD') {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);
        if (imageFile) {
          formData.append('files', imageFile);
        } else if (fallbackImageUrl) {
          // If a direct URL is given, we will save it.
          // Note: Backend requires a file array, so if no file is provided, we send a mocked blob
          // or rely on fallback URLs mapped. To handle this reliably, we construct a dummy file
          // or try sending file. If no file, backend creates it.
          // Let's create a dummy small file representing the URL
          const dummy = new File([new Blob([''])], 'image_url_placeholder.txt');
          formData.append('files', dummy);
        }

        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Thêm sản phẩm mới thành công');
      } else if (selectedProduct) {
        // Edit info
        const updateBody = {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock),
          status: productStatus
        };
        await api.put(`/products/${selectedProduct.productId}/info`, updateBody);

        // Upload images if any
        if (imageFile) {
          const formData = new FormData();
          formData.append('files', imageFile);
          await api.post(`/products/${selectedProduct.productId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        toast.success('Cập nhật sản phẩm thành công');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (product: Product) => {
    try {
      // Check if product exists in any order logs
      const res = await api.get('/orders?size=1000');
      const orders = res.data.result.content || [];
      const hasBeenOrdered = orders.some((o: any) =>
        o.orderDetails?.some((d: any) => d.productId === product.productId)
      );

      if (hasBeenOrdered) {
        // Cannot delete. Offer to de-activate
        if (product.status === 'ACTIVE') {
          const confirmDeactivate = window.confirm(
            `Sản phẩm '${product.name}' đã phát sinh đơn hàng, không thể xóa khỏi cơ sở dữ liệu để bảo vệ nhật ký bán hàng.\n\nBạn có muốn chuyển trạng thái sản phẩm thành ẨN (INACTIVE) không?`
          );
          if (confirmDeactivate) {
            const updateBody = {
              name: product.name,
              description: product.description,
              price: product.price,
              category: product.category as any,
              stock: product.stock,
              status: 'INACTIVE' as const
            };
            await api.put(`/products/${product.productId}/info`, updateBody);
            toast.success('Đã chuyển trạng thái sản phẩm sang ẨN');
            fetchProducts();
          }
        } else {
          toast.error(`Sản phẩm '${product.name}' đã phát sinh đơn hàng và hiện đã ở trạng thái ẨN.`);
        }
      } else {
        // Can be soft-deleted
        const confirmDelete = window.confirm(
          `Bạn có chắc chắn muốn XÓA MỀM sản phẩm '${product.name}' không? Sản phẩm sẽ được đưa vào thùng rác.`
        );
        if (confirmDelete) {
          await api.delete(`/products/${product.productId}`);
          toast.success('Đã xóa mềm sản phẩm thành công');
          fetchProducts();
        }
      }
    } catch {
      toast.error('Có lỗi xảy ra khi kiểm tra lịch sử đặt hàng của sản phẩm');
    }
  };

  const handleRestoreClick = async (product: Product) => {
    try {
      await api.patch(`/products/${product.productId}/restore`);
      toast.success('Đã khôi phục sản phẩm thành công');
      fetchProducts();
    } catch {
      toast.error('Không thể khôi phục sản phẩm');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || catId;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Xem danh sách, thêm, chỉnh sửa hoặc ẩn/xóa sản phẩm thú bông.
          </p>
        </div>

        <Button onClick={handleAddClick} className="rounded-xl h-11 px-5 font-bold shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl bg-muted/20 border-border h-12 pl-11 pr-4 shadow-sm"
            />
          </div>
          <Button type="submit" className="rounded-xl h-12 px-6 font-bold">
            Tìm
          </Button>
        </form>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-xl bg-muted/20 border border-border p-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(0);
            }}
            className="rounded-xl bg-muted/20 border border-border p-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán (Active)</option>
            <option value="INACTIVE">Đang ẩn (Inactive)</option>
            <option value="DELETED">Đã xóa mềm (Thùng rác)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground animate-pulse">
            Đang tải dữ liệu sản phẩm...
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            Không tìm thấy sản phẩm nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-5 text-sm font-bold text-muted-foreground w-20">Ảnh</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground">Tên sản phẩm</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-36">Danh mục</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-28">Đơn giá</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-28 text-center">Tồn kho</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-32 text-center">Trạng thái</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground text-right w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map(prod => (
                  <tr key={prod.productId} className="hover:bg-muted/10 transition-colors duration-200">
                    <td className="p-5">
                      <div className="h-12 w-12 rounded-xl bg-muted/30 overflow-hidden border border-border">
                        {prod.imageUrls && prod.imageUrls[0] ? (
                          <img
                            src={prod.imageUrls[0]}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/100x100?text=Bear';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-foreground">{prod.name}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">{prod.productCode}</div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-muted-foreground">
                      {getCategoryName(prod.category)}
                    </td>
                    <td className="p-5 text-sm font-bold text-foreground">
                      {formatPrice(prod.price)}
                    </td>
                    <td className="p-5 text-sm font-semibold text-center text-foreground">
                      {prod.stock}
                    </td>
                    <td className="p-5 text-center">
                      {statusFilter === 'DELETED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive border border-destructive/10">
                          Thùng rác
                        </span>
                      ) : prod.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/10">
                          <Check className="h-3 w-3" />
                          Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/70 text-muted-foreground border border-border">
                          <X className="h-3 w-3" />
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right space-x-1.5">
                      {statusFilter === 'DELETED' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreClick(prod)}
                          className="rounded-lg hover:bg-muted font-bold text-primary"
                        >
                          <RotateCcw className="mr-1.5 h-4 w-4" />
                          Khôi phục
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(prod)}
                            className="rounded-lg hover:bg-muted font-bold text-primary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(prod)}
                            className="rounded-lg text-destructive hover:bg-destructive/10 font-bold"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {statusFilter !== 'DELETED' && totalPages > 1 && (
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

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card p-8 rounded-[1.5rem] border border-border shadow-lg space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {modalType === 'ADD' ? 'Thêm Sản phẩm mới' : 'Chỉnh sửa Sản phẩm'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prodName" className="font-semibold text-foreground">Tên sản phẩm *</Label>
                <Input
                  id="prodName"
                  placeholder="Nhập tên sản phẩm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prodPrice" className="font-semibold text-foreground">Đơn giá (VND) *</Label>
                  <Input
                    id="prodPrice"
                    type="number"
                    placeholder="250000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodStock" className="font-semibold text-foreground">Số lượng tồn kho *</Label>
                  <Input
                    id="prodStock"
                    type="number"
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prodCategory" className="font-semibold text-foreground">Danh mục *</Label>
                  <select
                    id="prodCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-muted/20 border border-border p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-12"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {modalType === 'EDIT' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="prodStatus" className="font-semibold text-foreground">Trạng thái bán *</Label>
                    <select
                      id="prodStatus"
                      value={productStatus}
                      onChange={(e) => setProductStatus(e.target.value as any)}
                      className="w-full rounded-xl bg-muted/20 border border-border p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-12"
                    >
                      <option value="ACTIVE">Đang bán (Active)</option>
                      <option value="INACTIVE">Đang ẩn (Inactive)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prodDesc" className="font-semibold text-foreground">Mô tả sản phẩm</Label>
                <textarea
                  id="prodDesc"
                  placeholder="Nhập mô tả sản phẩm gấu bông..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-muted/20 border border-border p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-foreground"
                />
              </div>

              {/* Image upload parameters */}
              <div className="space-y-2 border-t border-border/50 pt-4">
                <span className="text-sm font-bold text-foreground">Hình ảnh sản phẩm</span>
                
                <div className="space-y-1.5">
                  <Label htmlFor="prodFile" className="font-semibold text-muted-foreground text-xs">Tải ảnh lên từ máy tính (Multipart Upload)</Label>
                  <Input
                    id="prodFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="rounded-xl border-border h-12 py-2 px-3 bg-muted/10 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodUrl" className="font-semibold text-muted-foreground text-xs">Hoặc dán URL ảnh trực tiếp</Label>
                  <Input
                    id="prodUrl"
                    placeholder="https://example.com/bear.jpg"
                    value={fallbackImageUrl}
                    onChange={(e) => setFallbackImageUrl(e.target.value)}
                    className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl h-12 px-6 font-bold min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {modalType === 'ADD' ? 'Đang tạo...' : 'Đang lưu...'}
                    </>
                  ) : (
                    modalType === 'ADD' ? 'Tạo sản phẩm' : 'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
