import { FieldValue, Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  bank_name: string;
  bank_account: string;
  role: "user" | "admin";
};

export type Admin = {
  id: string;
  email: string;
  name: string;
  role: "admin";
  online: boolean;
};

export type TransactionStatus = "pending" | "confirmed" | "failed";

export type Transaction = {
  id: string;
  user_id: string;
  assigned_admin?: string;
  amount_wld: number;
  rate_wld_idr: number;
  amount_idr: number;
  txid?: string;
  status: TransactionStatus;
  proof_url?: string;
  created_at: Timestamp | FieldValue;
  updated_at: Timestamp | FieldValue;
};

export type Message = {
  id: string;
  sender: "user" | "admin";
  message: string;
  timestamp: Timestamp | any;
  read: boolean;
};

export type Settings = {
  rate_wld_idr: number;
  service_fee_percent: number;
};
