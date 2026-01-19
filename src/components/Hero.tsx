import { Sparkles, Mail, Phone, Calendar } from 'lucide-react';

export default function Hero() {
  const quickActions = [
    { icon: Sparkles, label: 'Spa', color: 'bg-white' },
    { icon: Mail, label: 'Email', color: 'bg-white' },
    { icon: Phone, label: 'Số điện thoại', color: 'bg-white' },
    { icon: Calendar, label: 'ĐẶT LỊCH', color: 'bg-orange-500 text-white' },
  ];

  return (
    <section className="bg-gradient-to-br from-teal-500 to-teal-600 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-white mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chăm Sóc Thú Cưng
              <br />
              Chuyên Nghiệp
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Đội ngũ bác sĩ thú y giàu kinh nghiệm, tận tâm với từng bệnh nhân
            </p>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Cute beagle dog"
              className="w-full max-w-md rounded-lg shadow-2xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2`}
            >
              <action.icon className="w-8 h-8" />
              <span className="font-medium text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
