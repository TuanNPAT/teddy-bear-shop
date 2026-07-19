import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

import { phoneSchema } from '../lib/validators';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phoneNumber: phoneSchema,
  shippingAddress: z.string().min(5, { message: 'Địa chỉ giao hàng quá ngắn' }),
});

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await userApi.getProfile();
        reset({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          shippingAddress: profile.shippingAddress,
        });
        setEmail(profile.email);
      } catch {
        toast.error('Không thể tải thông tin hồ sơ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, reset]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    try {
      await userApi.updateProfile(data);
      toast.success('Cập nhật hồ sơ thành công');
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <div className="bg-card p-8 rounded-[1.5rem] space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-14 w-40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-3 font-medium">Quản lý thông tin giao hàng để việc mua sắm thuận tiện hơn.</p>
      </div>

      <div className="bg-card p-10 rounded-[1.5rem] border border-border shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-foreground">Email (Không thể thay đổi)</Label>
            <Input id="email" value={email} disabled className="rounded-xl bg-muted/50 border-border h-12 px-4 opacity-70" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-semibold text-foreground">Họ và tên</Label>
            <Input id="fullName" placeholder="Nhập họ và tên" {...register('fullName')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
            {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="font-semibold text-foreground">Số điện thoại mặc định</Label>
            <Input id="phoneNumber" placeholder="Nhập số điện thoại" {...register('phoneNumber')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
            {errors.phoneNumber && <p className="text-sm font-medium text-destructive">{errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress" className="font-semibold text-foreground">Địa chỉ giao hàng mặc định</Label>
            <Input id="shippingAddress" placeholder="Nhập địa chỉ nhận hàng" {...register('shippingAddress')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
            {errors.shippingAddress && <p className="text-sm font-medium text-destructive">{errors.shippingAddress.message}</p>}
            <p className="text-xs text-muted-foreground mt-1 font-medium">TODO: Backend API update profile đang thiếu, tạm lưu trên Mock API.</p>
          </div>

          <Button type="submit" className="rounded-xl h-14 px-10 text-lg font-bold shadow-sm hover:shadow-md transition-all mt-6" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </form>
      </div>
    </div>
  );
}
