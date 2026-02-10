import { Product, Category, Brand, Order, User, Review } from '@prisma/client';

// Extended types with relations
export type ProductWithDetails = Product & {
  category: Category;
  brand: Brand;
  reviews: Review[];
};

export type OrderWithDetails = Order & {
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  user: User;
};

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// Filter types
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}
