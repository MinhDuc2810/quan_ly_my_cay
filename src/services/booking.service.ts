import api from "@/lib/axios";

export interface Booking {
  id: number;
  customer_id: number;
  customer?: {
    name: string;
    phone: string;
    email: string;
  };
  table_id: number | null;
  table?: {
    table_number: string;
    capacity: number;
  };
  booking_date: string;
  booking_time: string;
  number_of_guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  customer_id: number;
  reservation_time: string; // YYYY-MM-DD HH:mm:ss
  guest_count: number;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  booking_date: string;
  booking_time: string;
  number_of_guests: number;
  note?: string;
  table_id?: number | null;
}

export interface CreateReservationData {
  reservation_time: string;
  guest_count: number;
  customer_name: string;
  customer_phone: string;
  customer_note?: string;
}

const bookingService = {
  createBooking: async (data: CreateBookingData) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },

  createReservation: async (data: CreateReservationData) => {
    const response = await api.post("/reservations", data);
    return response.data;
  },

  getMyBookings: async (params?: { page?: number; per_page?: number }) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  },

  getMyReservations: async (params?: { page?: number; per_page?: number; status?: string }) => {
    const response = await api.get("/reservations/my", { params });
    return response.data;
  },

  cancelBooking: async (id: number) => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Admin: lấy tất cả đặt bàn
  getAllBookings: async (params?: { page?: number; per_page?: number; status?: string; date?: string }) => {
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  getAllReservations: async (params?: { 
    page?: number; 
    per_page?: number; 
    status?: string; 
    customer_id?: number; 
    date?: string; 
    from_date?: string; 
    to_date?: string 
  }) => {
    const response = await api.get("/reservations", { params });
    return response.data;
  },

  // Admin: cập nhật trạng thái đặt bàn
  updateBookingStatus: async (id: number, status: string) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  updateReservationStatus: async (id: number, status: string) => {
    const response = await api.put(`/reservations/${id}/status`, { status });
    return response.data;
  },

  confirmReservation: async (id: number) => {
    const response = await api.post(`/reservations/${id}/confirm`);
    return response.data;
  },

  cancelReservation: async (id: number, reason?: string) => {
    const response = await api.put(`/reservations/${id}/cancel`, { reason });
    return response.data;
  },

  noShowReservation: async (id: number) => {
    const response = await api.put(`/reservations/${id}/no-show`);
    return response.data;
  },

  // Admin: xóa đặt bàn
  deleteBooking: async (id: number) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  deleteReservation: async (id: number) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

export default bookingService;
