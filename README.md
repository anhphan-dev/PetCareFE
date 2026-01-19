# VetCare - Trang Web Phòng Khám Thú Y

Website chuyên nghiệp cho phòng khám thú y, được xây dựng bằng React, TypeScript và Tailwind CSS.

## Tính năng

- **Header với menu điều hướng** - Responsive với mobile menu
- **Hero section** - Banner chính với hình ảnh và các nút hành động nhanh
- **Dịch vụ** - Hiển thị các dịch vụ chính của phòng khám
- **Về chúng tôi** - Giới thiệu về đội ngũ bác sĩ thú y
- **Tin tức** - Blog/tin tức về chăm sóc thú cưng
- **Footer** - Thông tin liên hệ và giờ làm việc
- **Nút chat nổi** - Nút liên hệ nhanh

## Cấu trúc dự án

```
src/
├── components/          # Các React components
│   ├── Header.tsx      # Menu điều hướng
│   ├── Hero.tsx        # Banner chính
│   ├── Services.tsx    # Danh sách dịch vụ
│   ├── About.tsx       # Phần giới thiệu
│   ├── News.tsx        # Tin tức
│   └── Footer.tsx      # Footer
├── services/           # API services
│   └── api.ts         # API integration layer
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Tích hợp API

Dự án đã được chuẩn bị sẵn cấu trúc để tích hợp API. Tất cả các API calls được tập trung trong `src/services/api.ts`.

### Cách sử dụng API Service

1. **Thêm biến môi trường**

Tạo file `.env` trong thư mục root:

```env
VITE_API_URL=https://your-api-url.com/api
```

2. **Sử dụng trong components**

```tsx
import { apiService } from '../services/api';
import { useEffect, useState } from 'react';

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    apiService.getServices()
      .then(data => setServices(data))
      .catch(error => console.error(error));
  }, []);

  // Render services...
}
```

### Các API endpoints có sẵn

- `getServices()` - Lấy danh sách dịch vụ
- `getTeamMembers()` - Lấy thông tin đội ngũ
- `getNewsArticles()` - Lấy danh sách tin tức
- `getContactInfo()` - Lấy thông tin liên hệ
- `bookAppointment(data)` - Đặt lịch hẹn
- `subscribeNewsletter(email)` - Đăng ký nhận tin

## Chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Tùy chỉnh

### Thay đổi màu sắc

Chỉnh sửa file `tailwind.config.js` để thay đổi bảng màu:

```js
theme: {
  extend: {
    colors: {
      primary: '#0d9488', // Teal
      secondary: '#f97316', // Orange
    }
  }
}
```

### Thay đổi nội dung

Dữ liệu hiện tại được hard-code trong các components. Để sử dụng API:

1. Import `apiService` từ `src/services/api.ts`
2. Sử dụng `useState` và `useEffect` để fetch data
3. Thay thế dữ liệu tĩnh bằng dữ liệu từ API

### Thêm Supabase (tùy chọn)

Nếu muốn sử dụng Supabase làm backend:

1. Tạo project trên Supabase
2. Thêm credentials vào `.env`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Tạo các bảng: services, team_members, news_articles, appointments
4. Cập nhật `src/services/api.ts` để sử dụng Supabase client

## Công nghệ sử dụng

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)
