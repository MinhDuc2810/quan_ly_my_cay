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

export interface ForgotPasswordData {
  email: string;
  name: string;
  new_password: string;
  phone: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    message: string;
    data?: ForgotPasswordData;
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

  forgotPassword: async (phone: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>("/auth/forgot-password", { phone });
    return response.data;
  },

  changePassword: async (data: any): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>("/auth/change-password", data);
    return response.data;
  },
};

export default authService;