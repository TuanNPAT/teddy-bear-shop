import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-primary whitespace-nowrap">🧸 Teddy Shop</span>
            </Link>
          </div>

          {/* Center: Centered Nav Links */}
          <div className="hidden md:flex flex-1 items-center justify-center h-full">
            <nav className="flex items-center gap-8 text-sm h-full">
              <Link
                to="/"
                className={cn(
                  "relative h-full flex items-center px-1 transition-colors font-bold border-b-2",
                  isLinkActive('/')
                    ? "text-primary border-primary"
                    : "text-muted-foreground/80 hover:text-foreground border-transparent"
                )}
              >
                Cửa hàng
              </Link>
              <Link
                to="/about"
                className={cn(
                  "relative h-full flex items-center px-1 transition-colors font-bold border-b-2",
                  isLinkActive('/about')
                    ? "text-primary border-primary"
                    : "text-muted-foreground/80 hover:text-foreground border-transparent"
                )}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className={cn(
                  "relative h-full flex items-center px-1 transition-colors font-bold border-b-2",
                  isLinkActive('/contact')
                    ? "text-primary border-primary"
                    : "text-muted-foreground/80 hover:text-foreground border-transparent"
                )}
              >
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-4">
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
              <DropdownMenuContent align="end" className="rounded-2xl shadow-lg border-border/40 p-1.5">
                {isAuthenticated() ? (
                  <>
                    <DropdownMenuItem asChild className="rounded-xl font-medium">
                      <Link to="/profile">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl font-medium">
                      <Link to="/orders">Lịch sử đơn hàng</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1.5" />
                    <div className="px-2.5 py-1.5 text-xs text-muted-foreground font-semibold truncate max-w-[180px]">
                      {user?.email}
                    </div>
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl font-bold text-destructive focus:text-destructive focus:bg-destructive/10">
                      Đăng xuất
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="rounded-xl font-medium">
                      <Link to="/login">Đăng nhập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl font-medium">
                      <Link to="/register">Đăng ký</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-lg border-border/40 p-1.5">
                <DropdownMenuItem asChild className="rounded-xl font-semibold">
                  <Link to="/">Cửa hàng</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl font-semibold">
                  <Link to="/about">Giới thiệu</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl font-semibold">
                  <Link to="/contact">Liên hệ</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
