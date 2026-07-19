import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ClipboardList,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, idx) => {
      let label = path;
      if (path === 'admin') label = 'Quản trị';
      else if (path === 'products') label = 'Sản phẩm';
      else if (path === 'categories') label = 'Danh mục';
      else if (path === 'orders') label = 'Đơn hàng';
      else if (path === 'staff') label = 'Nhân sự';
      else if (path === 'users') label = 'Người dùng';
      
      const to = '/' + paths.slice(0, idx + 1).join('/');
      const isLast = idx === paths.length - 1;

      return (
        <span key={to} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1.5 text-muted-foreground/60" />
          {isLast ? (
            <span className="font-semibold text-foreground">{label}</span>
          ) : (
            <Link to={to} className="hover:text-foreground hover:underline transition-all">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/admin',
      roles: ['ADMIN']
    },
    {
      label: 'Sản phẩm',
      icon: ShoppingBag,
      to: '/admin/products',
      roles: ['ADMIN']
    },
    {
      label: 'Danh mục',
      icon: Tags,
      to: '/admin/categories',
      roles: ['ADMIN']
    },
    {
      label: 'Đơn hàng',
      icon: ClipboardList,
      to: '/admin/orders',
      roles: ['ADMIN', 'STAFF']
    },
    {
      label: 'Nhân sự',
      icon: Users,
      to: '/admin/staff',
      roles: ['ADMIN']
    },
    {
      label: 'Người dùng',
      icon: Users,
      to: '/admin/users',
      roles: ['ADMIN']
    }
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-primary">Teddy CMS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1.5 p-4">
          {filteredMenu.map(item => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <Link to="/admin" className="hover:text-foreground transition-all">
                Teddy Shop
              </Link>
              {getBreadcrumbs()}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-foreground">
                {user?.email?.split('@')[0]}
              </div>
              <div className="text-xs font-semibold text-primary capitalize flex items-center justify-end gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
