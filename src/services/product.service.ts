import api from "@/lib/axios";

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  min_stock: number;
  status: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface ProductListParams {
  page?: number;
  per_page?: number;
  name?: string;
  category_id?: number | string;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

const productService = {
  getProducts: async (params?: ProductListParams): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>("/products", { params });
    return response.data;
  },

  createProduct: async (data: any) => {
    // Nếu data là FormData, Axios sẽ tự động set boundary nếu header Content-Type được để trống hoặc set đúng.
    // Tuy nhiên do axios instance có default header là application/json, ta cần override nó.
    const response = await api.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProduct: async (id: number, data: any) => {
    // Dựa theo tài liệu Swagger: Khi upload file cần dùng POST với query ?_method=PUT thay vì PUT trực tiếp
    const response = await api.post(`/products/${id}?_method=PUT`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
