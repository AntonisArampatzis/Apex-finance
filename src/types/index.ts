export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  category_name: string;
  category_color: string;
  month_key: string;
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month_key: string;
  amount: number;
  created_at: string;
}

export type MonthKey = string; // "YYYY-MM"
