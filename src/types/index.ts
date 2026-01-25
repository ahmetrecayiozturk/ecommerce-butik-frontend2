export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryName: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface UpdateCartItemRequest {
  quantity?: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalPrice: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  paymentTransactionId?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED';

export interface OrderResponse {
  id: number;
  items: OrderItemResponse[];
  totalPrice: number;
  status: OrderStatus;
  paymentId?: string;
  shippingAddress?: string;
  cargoFirm?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RefundRequest {
  paymentTransactionId: string;
  amount: number;
  ip?: string;
}

export interface RefundResponse {
  status: string;
  paymentId: string;
  paymentTransactionId: string;
  price: number;
  currency: string;
}

export interface PaymentInitiateRequest {
  orderId: number;
}

export interface PaymentInitiateResponse {
  status: string;
  checkoutFormContent: string;
  paymentPageUrl?: string;
  token: string;
  orderId: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ProductListResponse {
  products: Product[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export type CartItem = CartItemResponse;
export type Cart = CartResponse;
export type OrderItem = OrderItemResponse;
export type Order = OrderResponse;
