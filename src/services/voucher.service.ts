import api from "@/lib/axios";

export interface Voucher {
  id: number;
  code: string;
  discount_type: 'FIXED' | 'PERCENTAGE';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  start_date: string;
  expired_at: string;
  usage_limit: number | null;
  used_count: number;
  remaining_uses: number;
  status: 1 | 0; // 1: Active, 0: Inactive
  is_active: boolean;
  created_at: string;
}

export interface VoucherListParams {
  page?: number;
  per_page?: number;
  status?: number;
  discount_type?: string;
  search?: string;
  active_only?: number;
}

export interface VoucherResponse {
  success: boolean;
  data: Voucher[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

const voucherService = {
  getVouchers: async (params?: VoucherListParams): Promise<VoucherResponse> => {
    const response = await api.get<VoucherResponse>("/vouchers", { params });
    return response.data;
  },

  createVoucher: async (data: any): Promise<any> => {
    const response = await api.post("/vouchers", data);
    return response.data;
  },

  updateVoucher: async (id: number, data: any): Promise<any> => {
    const response = await api.put(`/vouchers/${id}`, data);
    return response.data;
  },

  deleteVoucher: async (id: number): Promise<any> => {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  },

  checkVoucher: async (code: string): Promise<{ success: boolean; data: Voucher; message?: string }> => {
    const response = await api.get<{ success: boolean; data: Voucher; message?: string }>(`/vouchers/check/${code}`);
    return response.data;
  },
};

export default voucherService;