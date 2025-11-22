
export interface QuantityHistoryEntry {
  id: string;
  date: string;
  userId: string;
  type: TransactionType;
  quantityChange: number;
  oldQuantity: number;

  newQuantity: number;
  relatedWarehouseId?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  price: number;
  minStockLevel?: number;
  lastUpdated: string;
  lastUpdatedBy?: string;
  quantityHistory?: QuantityHistoryEntry[];
  imageUrls?: string[];
  expirationDate?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  products: Product[];
}

export enum Role {
  ADMIN = '총관',
  AREA_MANAGER = '지역 관리자',
  MANAGER = '창고 관리자',
  STAFF = '직원',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  assignedWarehouseIds?: string[];
  avatarUrl?: string;
}

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  read: boolean;
}

export interface LowStockNotification extends BaseNotification {
  type: NotificationType.LOW_STOCK;
  currentQuantity: number;
  minStockLevel: number;
}

export interface ExpirationNotification extends BaseNotification {
  type: NotificationType.EXPIRED | NotificationType.EXPIRING_SOON;
  expirationDate: string;
  daysRemaining: number;
}

export type AppNotification = LowStockNotification | ExpirationNotification;


export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  RECEIVE = 'RECEIVE',
  ADJUST = 'ADJUST',
  QUICK_RECEIVE = 'QUICK_RECEIVE',
  QUICK_SHIP = 'QUICK_SHIP',
  SHIP = 'SHIP',
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  quantity: number;
  type: TransactionType;
  date: string;
  userId: string;
  relatedWarehouseId?: string; // For IN/OUT transactions
  totalValue?: number; // Financial value of the transaction
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ProductFilterStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
export type ProductFilterExpiration = 'all' | 'valid' | 'expiring-soon' | 'expired';
export type SortableProductKeys = 'name' | 'sku' | 'quantity' | 'price';
