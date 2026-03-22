import api from "@/lib/axios";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  note: string | null;
  product?: {
    name: string;
    image_url: string | null;
  };
}

export interface Order {
  id: number;
  customer_id: number | null;
  staff_id: number | null;
  table_id: number | null;
  voucher_id: number | null;
  order_code: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PAID' | 'REFUNDED';
  payment_method: 'CASH' | 'TRANSFER' | 'CARD';
  note: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    phone_number: string;
  };
  table?: {
    table_number: string;
  };
  items?: OrderItem[];
}

export interface OrderListParams {
  page?: number;
  per_page?: number;
  status?: string;
  order_code?: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

const orderService = {
  getOrders: async (params?: OrderListParams): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>("/orders", { params });
    return response.data;
  },

  getOrderById: async (id: number): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<any> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: number): Promise<any> => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;