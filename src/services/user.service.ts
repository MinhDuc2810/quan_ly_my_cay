import api from "@/lib/axios";

export interface UserListParams {
  page?: number;
  per_page?: number;
  role?: string;
  username?: string;
}

export interface UserListResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

const userService = {
  getUsers: async (params: UserListParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>("/users", { params });
    return response.data;
  },

  // Temporarily keeping CRUD as placeholders for future implementation
  createUser: async (data: any) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  updateUser: async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
