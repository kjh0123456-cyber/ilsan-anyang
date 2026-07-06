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
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  toss_payment_key: string | null;
  created_at: string;
  order_items?: OrderItem[];
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
