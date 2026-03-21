import api from "@/lib/axios";

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    role: string;
    status: number;
  };
}

export interface CustomerListParams {
  page?: number;
  per_page?: number;
  name?: string;
  phone?: string;
  email?: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

const customerService = {
  getCustomers: async (params: CustomerListParams): Promise<CustomerListResponse> => {
    const response = await api.get<CustomerListResponse>("/customers", { params });
    return response.data;
  },

  createCustomer: async (data: any) => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  updateCustomer: async (id: number, data: any) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: number) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;