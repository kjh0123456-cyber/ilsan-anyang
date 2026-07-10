export type Category = "vacuum" | "air" | "speaker" | "light" | "hub";
export type OrderStatus = "paid" | "shipping" | "delivered" | "cancelled";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  images: string[];
  specs: Record<string, string>;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  toss_payment_key: string | null;
  created_at: string;
  recipient_name: string | null;
  phone: string | null;
  zip_code: string | null;
  address: string | null;
  address_detail: string | null;
  delivery_request: string | null;
  order_items?: OrderItem[];
  buyer_email?: string;
}

export interface ShippingInfo {
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  deliveryRequest: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
