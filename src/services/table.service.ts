import api from "@/lib/axios";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  is_deleted?: number;
  created_at: string;
  updated_at: string;
}

export interface TableListParams {
  page?: number;
  per_page?: number;
  search?: string;
  min_capacity?: number;
  status?: TableStatus | "";
}

export interface TableResponse {
  success: boolean;
  data: Table[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

const tableService = {
  getTables: async (params?: TableListParams): Promise<TableResponse> => {
    const response = await api.get<TableResponse>("/tables", { params });
    return response.data;
  },

  createTable: async (data: any) => {
    const response = await api.post("/tables", data);
    return response.data;
  },

  updateTable: async (id: number, data: any) => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: number) => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },
};

export default tableService;
