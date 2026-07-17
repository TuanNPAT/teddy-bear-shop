export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary">🧸 Teddy Shop</h3>
            <p className="text-sm text-muted-foreground">
              Mang yêu thương qua từng món quà. Thế giới gấu bông đáng yêu nhất dành cho bạn và người thân.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Câu chuyện thương hiệu</li>
              <li>Tuyển dụng</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Chính sách bảo mật</li>
              <li>Điều khoản dịch vụ</li>
              <li>Chính sách đổi trả</li>
              <li>Phương thức thanh toán</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kết nối</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Teddy Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
