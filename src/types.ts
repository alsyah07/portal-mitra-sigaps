export interface Role {
  id_role: number;
  id_users: number;
  role: string;
}

export interface User {
  id_users: number;
  code_customer: string;
  nama_customer: string;
  name_users?: string;
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
  phonenumber?: string;
  home_address?: string;
  phone_number2?: string;
  phone_number3?: string;
  ktp_number?: string;
  birth_date?: string;
  usia?: number;
  company_id?: number;
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

export interface UserRating {
  id: number;
  employee_id: string;
  passenger_name: string;
  service_date: string;
  vehicle_plate: string;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  q5_score: number;
  q6_score: number;
  q7_score: number;
  q8_score: number;
  q9_score: number | null;
  q10_comment: string | null;
  average_score: string;
  is_bonus_qualified: boolean;
  created_at: string;
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
  user_ratings?: UserRating[];
  expenses_count?: number;
}

export interface HariKerja {
  day_index: number;
  iwo_workdays_status: number;
  work_hour: string;
  dinner_breaktime: string;
  type: string | null;
  id: number;
  updated_at: string;
  lunch_breaktime: string;
  created_at: string;
}

export interface Agreement {
  expectedRenewalDate: string;
  tunjanganKonsumsiVIP: string;
  picTaxJob: string;
  userEmail: string;
  picPurchasingEmail: string;
  startDate: string;
  picHrGaEmail: string;
  workFrequency: string;
  dinnerBreak: string;
  userName: string;
  picHrGaPhone: string;
  endDate: string;
  expectedStartingDate: string;
  billingStreet: string;
  picTaxPhone: string;
  dinnerBreakNotes: string;
  tunjanganKinerja: string;
  spkPoNo: string;
  accountManager: string;
  picHrGaName: string;
  serviceSpecification: string;
  picFinanceJob: string;
  agreementType: string;
  picPurchasingPhone: string;
  tunjanganHariRaya: string;
  payrollDateOthers: string;
  picFinanceEmail: string;
  pph23Admin: string;
  termOfPaymentOthers: string;
  serviceDescription: string;
  additionalNotes: string;
  picPurchasingJob: string;
  payrollDate: string;
  npwpNo: string;
  officeAddress: string;
  employerCompany: string;
  dayOff: string;
  termOfPayment: string;
  hari_kerja: HariKerja[];
  picTaxEmail: string;
  billingCity: string;
  tunjanganKemitraan: string;
  picHrGaJob: string;
  picFinancePhone: string;
  officeStreet: string;
  cutOffDate: string;
  clientName: string;
  managementFee: string;
  tunjanganMobilMewah: string;
  id: string;
  billingAddressName: string;
  workDayType: string;
  numberOfPersonnel: string;
  userPhone: string;
  insentifTahunanMitra: string;
  serviceLocation: string;
  picTaxName: string;
  createdAt: any;
  iwoNo: string;
  cutOffDateOthers: string;
  upahPerJam: string;
  workDays: string[];
  officeCity: string;
  userId: string;
  notesOnAgreement: string;
  agreementNo: string;
  expectedEndingDate: string;
  picFinanceName: string;
  clientType: string;
  lunchBreak: string;
  codeCustomer: string;
  picPurchasingName: string;
  insentifLiburNasional: string;
  npwpAddress: string;
}
