import api from "@/lib/axios";

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: number;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
    profile: any;
  };
}

const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email });
    return response.data;
  },

  changePassword: async (data: any): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>("/auth/change-password", data);
    return response.data;
  },
};

export default authService;