export interface User {
  id_users: number;
  code_customer: string;
  nama_customer: string;
  email: string;
  status: number;
}

export interface Driver {
  id: number;
  driver_code: string;
  nama_lengkap: string;
  foto?: string;
  phone: string;
  status?: string;
}

export interface Timesheet {
  id_timesheets_mitra: number;
  employee_id: string;
  code_customer: string;
  time_entry: string;
  km_entry: string;
  time_exit: string;
  km_exit: string;
  foto_km_in?: string | null;
  foto_km_out?: string | null;
  lat_masuk?: string | null;
  long_masuk?: string | null;
  lat_keluar?: string | null;
  long_keluar?: string | null;
  is_premium?: number | null;
  premium_name?: string | null;
  is_vip?: number | null;
  vip_name?: string | null;
  is_task?: number | null;
  task: string;
  status_approved: number; // 0: Pending, 1: Approved, -1: Rejected
  created_at: string;
}
