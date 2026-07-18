import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import type { ProductPageResponse } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MOCK_CATEGORIES } from '../mock/mockData';
import { Skeleton } from '../components/ui/skeleton';
import BannerBear from '../assets/Gemini_Generated_Image_yxi75yyxi75yyxi7.png';

export default function HomePage() {
  const [data, setData] = useState<ProductPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { size: 12 };
        if (search) params.name = search;
        if (category !== 'ALL') params.category = category;
        
        const result = await productApi.getProducts(params);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [search, category]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-16">
      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden rounded-3xl bg-secondary/30 mt-6 border border-border/50">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-10 md:p-16 lg:p-20 space-y-6 text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] text-foreground">
              Thế giới Gấu Bông Dành Cho Bạn
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[65ch]">
              Tìm kiếm những món quà ấm áp và dễ thương nhất để trao gửi yêu thương cho những người quan trọng.
            </p>
          </div>
          <div className="relative h-64 md:h-full w-full bg-muted/50 hidden sm:block">
            <img 
              src={BannerBear} 
              alt="Teddy bear" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Bạn muốn tìm gấu gì hôm nay?" 
            className="w-full pl-12 rounded-full h-12 text-base bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-72">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full h-12 rounded-full bg-muted/30 border-border/50 shadow-sm">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              {MOCK_CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Product Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-border/50 pb-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sản phẩm nổi bật</h2>
          {data && <span className="text-sm font-medium text-muted-foreground">{data.totalElements} kết quả</span>}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-12 w-full rounded-full mt-2" />
              </div>
            ))}
          </div>
        ) : data?.content && data.content.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {data.content.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/20 rounded-3xl border border-border/50">
            <p className="text-xl text-muted-foreground font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
      </section>
    </div>
  );
}
