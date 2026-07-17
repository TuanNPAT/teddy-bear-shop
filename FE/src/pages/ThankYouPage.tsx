import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-foreground mb-4">Cảm ơn bạn đã đặt hàng!</h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
        Đơn hàng <span className="font-bold text-foreground">#{orderId}</span> của bạn đã được xác nhận. Những bé gấu bông dễ thương sẽ sớm được giao đến tay bạn.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-full px-8 h-12">
          <Link to="/orders">Xem đơn hàng</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12">
          <Link to="/">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
