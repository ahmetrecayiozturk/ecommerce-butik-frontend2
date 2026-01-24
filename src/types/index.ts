// Backend'deki UserResponse ve AuthResponse
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

// Backend'deki ProductResponse
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
}

// Backend'deki ProductListResponse
export interface ProductListResponse {
  products: Product[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

// Backend'deki CartItemResponse
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Backend'deki CartResponse
export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

// Backend'deki CategoryResponse
export interface Category {
  id: number;
  name: string;
  description: string;
}

// Backend'deki OrderItemResponse
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Backend'deki OrderResponse
export interface Order {
  id: number;
  items: OrderItem[]; // Can be detailed further if needed
  totalPrice: number;
  status: string;
  createdAt: string;
}