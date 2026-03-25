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

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    customer_id: number | null;
    table_id: number;
    status: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    created_at: string;
  };
}

const orderService = {
  getOrders: async (params?: OrderListParams): Promise<OrderResponse> => {
    console.log("📦 [ORDER SERVICE] getOrders - Params:", params);
    try {
      const response = await api.get<OrderResponse>("/orders", { params });
      console.log("✅ [ORDER SERVICE] getOrders - Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [ORDER SERVICE] getOrders - Error:", error);
      throw error;
    }
  },

  getOrderById: async (id: number): Promise<{ success: boolean; data: Order }> => {
    console.log(`📦 [ORDER SERVICE] getOrderById - ID: ${id}`);
    try {
      const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
      console.log(`✅ [ORDER SERVICE] getOrderById - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] getOrderById - Error:`, error);
      throw error;
    }
  },

  updateOrderStatus: async (id: number, status: string): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] updateOrderStatus - ID: ${id}, Status: ${status}`);
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      console.log(`✅ [ORDER SERVICE] updateOrderStatus - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] updateOrderStatus - Error:`, error);
      throw error;
    }
  },

  deleteOrder: async (id: number): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] deleteOrder - ID: ${id}`);
    try {
      const response = await api.delete(`/orders/${id}`);
      console.log(`✅ [ORDER SERVICE] deleteOrder - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] deleteOrder - Error:`, error);
      throw error;
    }
  },

  createOrder: async (data: {
    table_id: number;
    customer_id?: number | null;
    items: { product_id: number; quantity: number }[];
  }): Promise<CreateOrderResponse> => {
    console.log("📦 [ORDER SERVICE] createOrder - Data:", data);
    try {
      const response = await api.post<CreateOrderResponse>("/orders", data);
      console.log("✅ [ORDER SERVICE] createOrder - Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [ORDER SERVICE] createOrder - Error:", error);
      throw error;
    }
  },

  getActiveOrderByTable: async (tableId: number): Promise<{ success: boolean; data: Order | null }> => {
    console.log(`📦 [ORDER SERVICE] getActiveOrderByTable - TableID: ${tableId}`);
    try {
      const response = await api.get<{ success: boolean; data: Order | null }>(`/orders/table/${tableId}/active`);
      console.log(`✅ [ORDER SERVICE] getActiveOrderByTable - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] getActiveOrderByTable - Error:`, error);
      throw error;
    }
  },

  updateOrderItems: async (id: number, items: { product_id: number; quantity: number }[]): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] updateOrderItems - ID: ${id}, Items:`, items);
    try {
      const response = await api.put(`/orders/${id}/items`, { items });
      console.log(`✅ [ORDER SERVICE] updateOrderItems - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] updateOrderItems - Error:`, error);
      throw error;
    }
  },

  applyVoucher: async (id: number, voucherCode: string): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] applyVoucher - ID: ${id}, Code: ${voucherCode}`);
    try {
      const response = await api.post(`/orders/${id}/voucher`, { voucher_code: voucherCode });
      console.log(`✅ [ORDER SERVICE] applyVoucher - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] applyVoucher - Error:`, error);
      throw error;
    }
  },

  removeVoucher: async (id: number): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] removeVoucher - ID: ${id}`);
    try {
      const response = await api.delete(`/orders/${id}/voucher`);
      console.log(`✅ [ORDER SERVICE] removeVoucher - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] removeVoucher - Error:`, error);
      throw error;
    }
  },

  cancelOrder: async (id: number, reason: string = "Khách hàng yêu cầu hủy"): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] cancelOrder - ID: ${id}, Reason: ${reason}`);
    try {
      const response = await api.post(`/orders/${id}/cancel`, { reason });
      console.log(`✅ [ORDER SERVICE] cancelOrder - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] cancelOrder - Error:`, error);
      throw error;
    }
  },

  payOrder: async (id: number, data: { payment_method: string; customer_id?: number | null }): Promise<any> => {
    console.log(`📦 [ORDER SERVICE] payOrder - ID: ${id}, Data:`, data);
    try {
      const response = await api.post(`/orders/${id}/payment`, data);
      console.log(`✅ [ORDER SERVICE] payOrder - Success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] payOrder - Error:`, error);
      throw error;
    }
  },
};

export default orderService;