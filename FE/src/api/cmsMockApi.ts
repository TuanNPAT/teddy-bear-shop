import { api } from '../lib/api';

export interface CategoryMock {
  id: string;
  name: string;
  description: string;
}

export interface StaffMock {
  name: string;
  email: string;
  active: boolean;
  role: 'STAFF';
  createdAt: string;
}

// Default Seed Categories matching backend Enum
const DEFAULT_CATEGORIES: CategoryMock[] = [
  { id: 'TEDDY_BEAR', name: 'Gấu Teddy', description: 'Các loại gấu bông Teddy truyền thống và hiện đại' },
  { id: 'KEYCHAIN', name: 'Móc khóa', description: 'Thú bông móc khóa nhỏ xinh, dễ thương' },
  { id: 'PILLOW', name: 'Gối ôm', description: 'Thú bông gối ôm dáng dài, mềm mịn thích hợp ôm ngủ' },
  { id: 'ACCESSORY', name: 'Phụ kiện', description: 'Áo, mũ, nơ trang trí xinh xắn cho thú bông' },
  { id: 'GIFT_SET', name: 'Set quà tặng', description: 'Hộp quà kết hợp thú bông và hoa sáp sang trọng' }
];

// Default Seed Staff accounts
const DEFAULT_STAFF: StaffMock[] = [
  { name: 'Nguyễn Văn Staff', email: 'staff@gmail.com', active: true, role: 'STAFF', createdAt: '2026-07-01T08:00:00Z' },
  { name: 'Trần Thị Staff 2', email: 'staff2@gmail.com', active: true, role: 'STAFF', createdAt: '2026-07-05T09:30:00Z' },
  { name: 'Lê Văn Khóa', email: 'inactive_staff@gmail.com', active: false, role: 'STAFF', createdAt: '2026-06-15T10:00:00Z' }
];

export const cmsMockApi = {
  // --- Category CRUD ---
  getCategories: (): CategoryMock[] => {
    const data = localStorage.getItem('teddy-shop-cms-categories');
    if (!data) {
      localStorage.setItem('teddy-shop-cms-categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  },

  updateCategory: (id: string, name: string, description: string): CategoryMock[] => {
    const categories = cmsMockApi.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { id, name, description };
      localStorage.setItem('teddy-shop-cms-categories', JSON.stringify(categories));
    }
    return categories;
  },

  // --- Staff Management ---
  getStaff: (): StaffMock[] => {
    const data = localStorage.getItem('teddy-shop-cms-staff');
    if (!data) {
      localStorage.setItem('teddy-shop-cms-staff', JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(data);
  },

  createStaff: (name: string, email: string): { success: boolean; message?: string } => {
    const staffList = cmsMockApi.getStaff();
    if (staffList.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email nhân viên đã tồn tại!' };
    }
    const newStaff: StaffMock = {
      name,
      email,
      active: true,
      role: 'STAFF',
      createdAt: new Date().toISOString()
    };
    staffList.push(newStaff);
    localStorage.setItem('teddy-shop-cms-staff', JSON.stringify(staffList));
    return { success: true };
  },

  toggleStaffStatus: (email: string): StaffMock[] => {
    const staffList = cmsMockApi.getStaff();
    const index = staffList.findIndex(s => s.email === email);
    if (index !== -1) {
      staffList[index].active = !staffList[index].active;
      localStorage.setItem('teddy-shop-cms-staff', JSON.stringify(staffList));
    }
    return staffList;
  },

  isStaffActive: (email: string): boolean => {
    // If the email is in the staff mock repository, check its status
    const staffList = cmsMockApi.getStaff();
    const found = staffList.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (found) {
      return found.active;
    }
    // Default fallback to true for seeder accounts (e.g. staff@gmail.com) if not initialized
    return true;
  },

  // --- Dashboard Data calculation from real order logs ---
  getDashboardData: async () => {
    // Retrieve all orders from backend
    const res = await api.get('/orders?size=1000');
    const orders = res.data.result.content || [];

    // Filter revenue-generating orders (PAID, DELIVERED, COMPLETED, CONFIRMED, SHIPPED)
    const revenueOrders = orders.filter((o: any) =>
      ['DELIVERED', 'COMPLETED', 'PAID', 'CONFIRMED', 'SHIPPED'].includes(o.status)
    );

    // Total Revenue
    const totalRevenue = revenueOrders.reduce((acc: number, o: any) => acc + (Number(o.totalAmount) || 0), 0);

    const parseDateStr = (createdAt: any): string => {
      if (!createdAt) return '';
      if (Array.isArray(createdAt) && createdAt.length >= 3) {
        const y = createdAt[0];
        const m = String(createdAt[1]).padStart(2, '0');
        const d = String(createdAt[2]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      if (typeof createdAt === 'string') {
        return createdAt.substring(0, 10);
      }
      try {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime())) {
          return d.toISOString().substring(0, 10);
        }
      } catch {
        // Ignore
      }
      return '';
    };

    // Group sales by YYYY-MM-DD
    const chartDataMap: Record<string, number> = {};
    revenueOrders.forEach((o: any) => {
      const dateStr = parseDateStr(o.createdAt);
      if (dateStr) {
        chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + (Number(o.totalAmount) || 0);
      }
    });

    const trendCharts = Object.entries(chartDataMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top Selling Products Calculation
    const productSalesMap: Record<number, { name: string; quantity: number; image: string; category: string; price: number }> = {};
    orders.forEach((o: any) => {
      if (o.status !== 'CANCELLED' && o.orderDetails) {
        o.orderDetails.forEach((d: any) => {
          if (!productSalesMap[d.productId]) {
            productSalesMap[d.productId] = {
              name: d.productName,
              quantity: 0,
              image: d.productImageUrl || '',
              category: '',
              price: d.price
            };
          }
          productSalesMap[d.productId].quantity += d.quantity;
        });
      }
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([id, info]) => ({ id: Number(id), ...info }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
      trendCharts,
      topProducts
    };
  }
};
