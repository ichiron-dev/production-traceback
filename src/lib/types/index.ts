// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

// ─── Navigation ─────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// ─── Flyout ──────────────────────────────────────────────────────────────────
export interface FlyoutItem {
  type: 'item';
  label: string;
  icon: string;
  badge?: string;
}
export interface FlyoutGroup {
  type: 'group';
  label: string;
  items: NavItem[];
}
export interface FlyoutUser {
  type: 'user';
  avatar: string;
  name: string;
  role: string;
}
export type FlyoutData = FlyoutItem | FlyoutGroup | FlyoutUser;
export interface FlyoutState {
  id: string;
  data: FlyoutData;
  x: number;
  y: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
}

export type OrderStatus = 'success' | 'pending' | 'shipping' | 'cancelled';

export interface Order {
  id: string;
  twoCode: string;   // 2D barcode / QR code value
  line?: string;     // Production line
  dateRaw?: string;  // ISO date YYYY-MM-DD for comparison
  customer: string;
  amount: string;
  amountRaw: number;
  status: string;
  type: OrderStatus;
  date: string;
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
export interface Breadcrumb {
  label: string;
  href?: string;
}

// ─── Excel ───────────────────────────────────────────────────────────────────
export interface ExcelRow {
  [key: string]: string | number;
}
