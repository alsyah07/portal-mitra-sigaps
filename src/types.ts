export interface Role {
  id_role: number;
  id_users: number;
  role: string;
}

export interface User {
  id_users: number;
  code_customer: string;
  nama_customer: string;
  email: string;
  status: number;
  role?: Role[];
}

export interface Driver {
  id: string;
  driver_code: string;
  employee_id: string;
  nama_lengkap: string;
  foto?: string | null;
  phone: string;
  status?: string;
  company_name?: string;
  iwo_name?: string;
  user_name?: string;
  code_customer?: string;
}

export interface ApprovedTimesheet {
  id_approved_timesheets: number;
  status_approve: number;
  date_approve: string;
  note: string | null;
}

export interface FotoTimesheet {
  id_fototimesheets: number;
  foto_km_in: string;
  foto_km_out: string;
}

export interface LokasiTimesheet {
  id_lokasi_timesheets: number;
  lat_masuk: string;
  long_masuk: string;
  lat_keluar: string;
  long_keluar: string;
}

export interface Timesheet {
  id_timesheets_mitra: number;
  employee_id: string;
  code_customer: string;
  date_timesheets: string;
  time_entry: string;
  km_entry: string;
  time_exit: string;
  km_exit: string;
  is_premium?: number | null;
  premium_name?: string | null;
  is_vip?: number | null;
  vip_name?: string | null;
  status_hari_raya?: number | null;
  status_hari_libur?: number | null;
  penugasan: string;
  created_at: string;
  approved_timesheets: ApprovedTimesheet[];
  foto_timesheets: FotoTimesheet[];
  lokasi_timesheets: LokasiTimesheet[];
}
