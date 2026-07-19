import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

import { phoneSchema } from '../lib/validators';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  phoneNumber: phoneSchema,
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP phải có 6 ký tự' }),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedData, setSavedData] = useState<z.infer<typeof registerSchema> | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors } } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  });

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      await authService.sendRegisterOtp(data.email);
      setSavedData(data);
      setStep(2);
      toast.success('Mã OTP đã được gửi đến email của bạn');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    if (!savedData) return;
    setIsLoading(true);
    try {
      // NOTE: We pass phoneNumber in the body but backend ignores it since RegisterRequest doesn't have it
      await authService.verifyRegister({
        fullName: savedData.fullName,
        email: savedData.email,
        password: savedData.password,
        phoneNumber: savedData.phoneNumber
      }, data.otp);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[28rem] mx-auto py-16 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card p-10 rounded-[1.5rem] border border-border shadow-sm space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Đăng ký</h1>
          <p className="text-base text-muted-foreground">Tạo tài khoản để mua sắm dễ dàng hơn</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-semibold text-foreground">Họ và tên</Label>
              <Input id="fullName" placeholder="Nhập họ và tên" {...register('fullName')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
              {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="Nhập email" {...register('email')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-semibold text-foreground">Số điện thoại</Label>
              <Input id="phoneNumber" placeholder="Nhập số điện thoại" {...register('phoneNumber')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
              {errors.phoneNumber && <p className="text-sm font-medium text-destructive">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-foreground">Mật khẩu</Label>
              <Input id="password" type="password" placeholder="Tạo mật khẩu" {...register('password')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-4" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-8">
            <div className="p-5 bg-secondary/30 rounded-xl text-center mb-2 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Chúng tôi đã gửi mã OTP gồm 6 chữ số đến email</p>
              <p className="font-bold text-foreground text-base">{savedData?.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="font-semibold text-foreground">Nhập mã OTP</Label>
              <Input id="otp" placeholder="123456" {...registerOtp('otp')} className="rounded-xl bg-muted/20 border-border h-14 px-4 text-center text-2xl tracking-[0.5em] font-mono shadow-sm focus-visible:ring-primary" maxLength={6} />
              {otpErrors.otp && <p className="text-sm font-medium text-destructive">{otpErrors.otp.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận OTP'}
              </Button>
              
              <Button type="button" variant="ghost" className="w-full rounded-xl h-12 text-base font-medium" onClick={() => setStep(1)} disabled={isLoading}>
                Quay lại
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border/50">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-foreground font-bold hover:underline underline-offset-4">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
