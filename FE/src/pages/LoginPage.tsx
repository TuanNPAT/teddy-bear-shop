import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authApi';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

import { cmsMockApi } from '../api/cmsMockApi';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(data);
      
      if (authResponse.role === 'STAFF' && !cmsMockApi.isStaffActive(authResponse.email)) {
        toast.error('Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
        setIsLoading(false);
        return;
      }
      
      setAuth(authResponse);
      toast.success('Đăng nhập thành công');
      
      if (authResponse.role === 'ADMIN') {
        navigate('/admin');
      } else if (authResponse.role === 'STAFF') {
        navigate('/admin/orders');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[28rem] mx-auto py-16 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card p-10 rounded-[1.5rem] border border-border shadow-sm space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Đăng nhập</h1>
          <p className="text-base text-muted-foreground">Chào mừng bạn quay lại với Teddy Shop</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
            <Input id="email" type="email" placeholder="Nhập email của bạn" {...register('email')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold text-foreground">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="Nhập mật khẩu" {...register('password')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-4" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border/50">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-foreground font-bold hover:underline underline-offset-4">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
