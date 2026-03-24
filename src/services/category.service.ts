import api from "@/lib/axios";

export interface Category {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryListParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

const categoryService = {
  getCategories: async (params?: CategoryListParams): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>("/categories", { params });
    return response.data;
  },

  getAllCategories: async (): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>("/categories/all");
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
