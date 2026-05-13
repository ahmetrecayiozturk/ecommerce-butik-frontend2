export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'ROLE_ADMIN';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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

export interface ProductResponse {
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

export type Product = ProductResponse;

// --- GÜNCELLENEN KISIM ---
export type OrderItemStatus = 'ACTIVE' | 'CANCELLED' | 'RETURNED';

export interface OrderItemResponse {
  id: number; // <--- YENİ: Backend'deki OrderItem ID
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  paymentTransactionId?: string;
  status: OrderItemStatus;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'RETURN_RECEIVED';

export interface OrderResponse {
  id: number;
  items: OrderItemResponse[]; // <-- Burası önemli
  totalPrice: number;
  status: OrderStatus;
  paymentId?: string;
  shippingAddress?: string;
  cargoFirm?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
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
  checkoutUrl: string;
  providerReference: string;
  orderId: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
}

export interface OrderReturnRequest {
  reason: string;
}

export interface OrderReturnDecisionRequest {
  approved: boolean;
  adminNotes?: string;
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
  role: UserRole;
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
