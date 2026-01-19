export default function About() {
  const teamMembers = [
    {
      id: '1',
      imageUrl:
        'https://images.pexels.com/photos/6234302/pexels-photo-6234302.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      imageUrl:
        'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      imageUrl:
        'https://images.pexels.com/photos/6234070/pexels-photo-6234070.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      imageUrl:
        'https://images.pexels.com/photos/6234521/pexels-photo-6234521.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  return (
    <section className="py-16 bg-teal-600 text-white" id="giới thiệu">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">VỀ CHÚNG TÔI</h2>

        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-lg leading-relaxed opacity-95">
            Với hơn 10 năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe thú cưng,
            chúng tôi tự hào là một trong những phòng khám thú y uy tín và được
            yêu thích nhất. Đội ngũ bác sĩ thú y của chúng tôi được đào tạo
            chuyên sâu, luôn cập nhật những phương pháp điều trị tiên tiến nhất
            để mang đến dịch vụ tốt nhất cho thú cưng của bạn.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
            >
              <img
                src={member.imageUrl}
                alt="Bác sĩ thú y"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
