import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userApi } from '../api/userApi';
import { authService } from '../api/authApi';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Send, Loader2 } from 'lucide-react';

import { phoneSchema } from '../lib/validators';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phoneNumber: phoneSchema,
  shippingAddress: z.string().min(5, { message: 'Địa chỉ giao hàng quá ngắn' }),
});

// Password rules synchronised with RegisterPage.tsx (min 6 chars)
const changePasswordSchema = z.object({
  otp: z.string().min(6, { message: 'Mã OTP phải có ít nhất 6 ký tự' }),
  newPassword: z.string().min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }),
  confirmPassword: z.string().min(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');

  // Change password UI state
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
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

  const handleSendOtp = async () => {
    if (!email) return;
    setOtpSending(true);
    try {
      await authService.sendOtpForForgotPassword(email);
      setOtpSent(true);
      toast.success('Đã gửi mã OTP tới email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setOtpSending(false);
    }
  };

  const onChangePassword = async (data: z.infer<typeof changePasswordSchema>) => {
    setIsChangingPassword(true);
    try {
      await authService.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      // Reset form to initial state
      resetPwd();
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
    } finally {
      setIsChangingPassword(false);
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

      {/* Personal Information Section */}
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
          </div>

          <Button type="submit" className="rounded-xl h-14 px-10 text-lg font-bold shadow-sm hover:shadow-md transition-all mt-6" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-card p-10 rounded-[1.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Đổi mật khẩu</h2>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Xác thực qua OTP gửi đến email của bạn để thay đổi mật khẩu.
            </p>
          </div>
        </div>

        {/* Step 1: Send OTP button */}
        {!otpSent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              OTP sẽ được gửi đến email: <span className="font-bold text-foreground">{email}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={otpSending}
              className="rounded-xl h-12 px-6 font-bold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              {otpSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi OTP...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi mã OTP
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Step 2: OTP + new password form */
          <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-600 font-bold">
                ✓ Mã OTP đã được gửi đến {email}
              </p>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending}
                className="text-xs font-semibold text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50"
              >
                {otpSending ? 'Đang gửi...' : 'Gửi lại OTP'}
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="font-semibold text-foreground">Mã OTP</Label>
              <Input
                id="otp"
                placeholder="Nhập mã OTP 6 chữ số"
                maxLength={6}
                {...registerPwd('otp')}
                className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary tracking-widest font-mono text-center text-lg"
              />
              {pwdErrors.otp && <p className="text-sm font-medium text-destructive">{pwdErrors.otp.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-semibold text-foreground">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                {...registerPwd('newPassword')}
                className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary"
              />
              {pwdErrors.newPassword && <p className="text-sm font-medium text-destructive">{pwdErrors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-foreground">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                {...registerPwd('confirmPassword')}
                className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary"
              />
              {pwdErrors.confirmPassword && <p className="text-sm font-medium text-destructive">{pwdErrors.confirmPassword.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl h-12 px-6"
                onClick={() => { setOtpSent(false); resetPwd(); }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-12 px-6 font-bold"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận đổi mật khẩu'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
