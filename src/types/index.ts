export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

//------------------------------------------------------------------------------------------------------------
//SHOP PET
export interface ProductCategory {
  id: number;
  name: string;               // "Thức ăn", "Phụ kiện", "Thuốc", ...
  description?: string;
  imageUrl?: string | null;
  parentId?: number | null;
  isActive: boolean;
  subCategories?: ProductCategory[]; // nếu dùng hierarchy
}

export interface Product {
  id: number;
  name: string;               // "ROYAL CANIN MAXI ADULT 10kg"
  description?: string;
  price: number;
  originalPrice?: number;     // giá gốc nếu có giảm giá
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  stock: number;
  isActive: boolean;
  createdAt?: string;
}