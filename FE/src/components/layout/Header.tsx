import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">🧸 Teddy Shop</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm thú bông..."
                className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px] rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated() ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">Lịch sử đơn hàng</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium truncate">
                      {user?.email}
                    </div>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">Đăng xuất</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login">Đăng nhập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register">Đăng ký</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
