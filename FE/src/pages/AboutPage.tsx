import { Heart, Gift, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8">
        <div>
          <span className="text-primary font-extrabold text-sm uppercase tracking-wider bg-primary/10 px-5 py-2 rounded-full shadow-sm">
            Câu chuyện thương hiệu
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mt-4">
          Teddy Shop
        </h1>
        <p className="text-xl italic text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-2">
          "Mang yêu thương qua từng món quà"
        </p>
      </section>

      {/* Intro section */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-card p-8 md:p-12 rounded-[2rem] border border-border shadow-sm">
        <div className="space-y-6 text-left">
          <h2 className="text-2xl font-bold text-foreground">Hành trình ấm áp</h2>
          <p className="text-muted-foreground leading-relaxed">
            Teddy Shop được sinh ra từ niềm đam mê đem lại nụ cười và sự ấm áp cho mọi người. Chúng tôi tin rằng mỗi bé gấu bông không chỉ là một món đồ chơi, mà còn là một người bạn lắng nghe, một người đồng hành trung thành chia sẻ mọi niềm vui nỗi buồn.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Mỗi sản phẩm tại Teddy Shop đều được lựa chọn kỹ lưỡng từ chất liệu bông gòn tự nhiên, vải mịn không xơ và thiết kế dễ thương, mang lại trải nghiệm ôm ấp tuyệt vời nhất cho bạn và những người thân yêu.
          </p>
        </div>
        <div className="bg-primary/5 rounded-[1.5rem] p-8 flex items-center justify-center border border-primary/10 min-h-[250px]">
          <span className="text-[8rem] filter drop-shadow-md select-none animate-bounce duration-1000">🧸</span>
        </div>
      </div>

      {/* Values Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-foreground">Giá trị cốt lõi</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-muted/20 p-6 rounded-[1.5rem] border border-border text-center space-y-4 shadow-inner">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Sứ mệnh Yêu thương</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Truyền tải những thông điệp yêu thương ý nghĩa nhất thông qua những món quà gấu bông xinh xắn và ấm áp.
            </p>
          </div>

          <div className="bg-muted/20 p-6 rounded-[1.5rem] border border-border text-center space-y-4 shadow-inner">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Món quà Ý nghĩa</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mỗi đơn đặt hàng đều được chăm chút, đóng gói cẩn thận như một món quà hoàn hảo nhất gửi đến tay khách hàng.
            </p>
          </div>

          <div className="bg-muted/20 p-6 rounded-[1.5rem] border border-border text-center space-y-4 shadow-inner">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Chất lượng Vượt trội</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bông gòn cao cấp 100%, vải mịn kháng khuẩn và an toàn tuyệt đối cho sức khỏe của trẻ nhỏ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
