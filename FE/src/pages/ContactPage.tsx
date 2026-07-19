import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { MapPin, Phone, Mail } from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  message: z.string().min(10, { message: 'Nội dung liên hệ phải có ít nhất 10 ký tự' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    toast.success('Cảm ơn bạn đã liên hệ, chúng tôi sẽ phản hồi sớm nhất');
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="text-center space-y-4 py-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Liên hệ</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Gửi tin nhắn cho chúng tôi nếu bạn có bất kỳ câu hỏi nào về sản phẩm hoặc đơn hàng.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-3 bg-card p-8 md:p-10 rounded-[2rem] border border-border shadow-sm text-left">
          <h2 className="text-2xl font-bold text-foreground mb-6">Gửi tin nhắn</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-semibold text-foreground">Họ và tên</Label>
              <Input 
                id="fullName" 
                placeholder="Nhập họ và tên của bạn" 
                {...register('fullName')} 
                className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" 
              />
              {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                {...register('email')} 
                className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" 
              />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-semibold text-foreground">Nội dung liên hệ</Label>
              <textarea 
                id="message" 
                placeholder="Nhập lời nhắn của bạn gửi tới Teddy Shop..." 
                {...register('message')} 
                rows={5}
                className="w-full rounded-xl bg-muted/20 border border-border p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground bg-card transition-all"
              />
              {errors.message && <p className="text-sm font-medium text-destructive">{errors.message.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full sm:w-auto px-8 rounded-xl h-12 text-sm font-bold shadow-sm hover:shadow-md transition-all mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi liên hệ'}
            </Button>
          </form>
        </div>

        {/* Contact Info Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/20 p-8 rounded-[2rem] border border-border shadow-sm space-y-8 text-left h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-foreground">Thông tin liên hệ</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Địa chỉ cửa hàng</p>
                  <p className="text-sm text-muted-foreground mt-1">123 Đường Gấu Bông, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Hotline hỗ trợ</p>
                  <p className="text-sm text-muted-foreground mt-1">0987 654 321</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Email hỗ trợ</p>
                  <p className="text-sm text-muted-foreground mt-1">support@teddyshop.com</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Giờ mở cửa</p>
              <p className="text-sm font-medium text-foreground">Thứ 2 - Chủ nhật: 08:00 - 22:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
