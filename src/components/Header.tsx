import { PawPrint, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = ['TRANG CHỦ', 'GIỚI THIỆU', 'DỊCH VỤ', 'TIN TỨC', 'LIÊN HỆ'];

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-700">VetCare</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <button className="hidden md:block bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors">
            ĐẶT LỊCH
          </button>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="w-full bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors">
              ĐẶT LỊCH
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
