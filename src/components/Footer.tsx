import { PawPrint, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t" id="liên hệ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <PawPrint className="w-12 h-12 text-teal-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">VetCare Clinic</h3>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                <p className="text-sm">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p className="text-sm">0123 456 789</p>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p className="text-sm">contact@vetcare.com</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4">GIỜ LÀM VIỆC</h4>
            <div className="flex items-start gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
              <div className="text-sm">
                <p>Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                <p>Thứ 7 - Chủ nhật: 8:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 VetCare Clinic. All rights reserved.</p>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all hover:scale-110">
        <MessageCircle className="w-6 h-6" />
      </button>
    </footer>
  );
}
