export default function AboutPage() {
  const teamMembers = [
    {
      id: '1',
      imageUrl:
        'https://images.pexels.com/photos/6234302/pexels-photo-6234302.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: 'BS. Nguyễn Văn A',
      role: 'Bác sĩ điều trị',
    },
    {
      id: '2',
      imageUrl:
        'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: 'BS. Trần Thị B',
      role: 'Chuyên gia dinh dưỡng',
    },
    {
      id: '3',
      imageUrl:
        'https://images.pexels.com/photos/6234070/pexels-photo-6234070.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: 'BS. Lê Văn C',
      role: 'Phẫu thuật',
    },
    {
      id: '4',
      imageUrl:
        'https://images.pexels.com/photos/6234521/pexels-photo-6234521.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: 'BS. Phạm Thị D',
      role: 'Chăm sóc đặc biệt',
    },
  ];

  const stats = [
    { value: '10+', label: 'Năm kinh nghiệm' },
    { value: '50K+', label: 'Khách hàng tin tưởng' },
    { value: '15+', label: 'Bác sĩ chuyên môn' },
    { value: '24/7', label: 'Hỗ trợ khẩn cấp' },
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về chúng tôi</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            VetCare – Đồng hành chăm sóc sức khỏe thú cưng của bạn.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Câu chuyện của chúng tôi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Với hơn 10 năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe thú cưng, chúng tôi tự hào
              là một trong những phòng khám thú y uy tín và được yêu thích nhất. Đội ngũ bác sĩ thú y
              của chúng tôi được đào tạo chuyên sâu, luôn cập nhật những phương pháp điều trị tiên tiến
              nhất để mang đến dịch vụ tốt nhất cho thú cưng của bạn.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi tin rằng mỗi thú cưng đều xứng đáng được chăm sóc với sự tận tâm và chuyên
              nghiệp. Từ khám bệnh tại nhà, khám sức khỏe định kỳ, đến spa và chăm sóc răng miệng –
              VetCare luôn sẵn sàng đồng hành cùng bạn và thú cưng.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-teal-50 rounded-xl">
                <div className="text-3xl font-bold text-teal-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Đội ngũ bác sĩ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-teal-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
