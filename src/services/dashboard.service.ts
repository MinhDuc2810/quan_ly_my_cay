import api from "@/lib/axios";

export interface DashboardOverview {
  success: boolean;
  message: string;
  data: {
    period: string;
    date_range: {
      from: string;
      to: string;
    };
    revenue: {
      current: number;
      previous: number;
      change_percent: number;
    };
    orders: {
      current: number;
      previous: number;
      change_percent: number;
    };
    customers: {
      current: number;
      previous: number;
      change_percent: number;
    };
    top_products: {
      id: number;
      name: string;
      price: number;
      category_name: string;
      total_sold: number;
      revenue: number;
    }[];
    table_status: {
      AVAILABLE: number;
      OCCUPIED: number;
      RESERVED: number;
      MAINTENANCE: number;
    };
  };
}

export interface ProductStats {
  success: boolean;
  message: string;
  data: {
    period: string;
    date_range: {
      from: string;
      to: string;
    };
    top_products: any[];
    low_stock: {
      id: number;
      category_id: number;
      name: string;
      price: string;
      description: string | null;
      image_url: string | null;
      stock_quantity: number;
      min_stock: number;
      status: number;
      created_at: string;
      updated_at: string;
      category_name: string;
    }[];
    category_stats: {
      category: string;
      product_count: number;
      total_sold: string;
      revenue: string;
    }[];
  };
}

const dashboardService = {
  getOverview: async (period: string = "month"): Promise<DashboardOverview> => {
    const response = await api.get<DashboardOverview>("/dashboard/overview", {
      params: { period },
    });
    return response.data;
  },

  getProductStats: async (period: string = "month"): Promise<ProductStats> => {
    const response = await api.get<ProductStats>("/dashboard/product-stats", {
      params: { period },
    });
    return response.data;
  },
};

export default dashboardService;
