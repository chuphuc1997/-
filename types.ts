
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
  quantity: number;
  price: number;
  minStockLevel?: number;
  lastUpdated: string;
  lastUpdatedBy?: string;
  quantityHistory?: QuantityHistoryEntry[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  products: Product[];
}

export enum Role {
  ADMIN = 'Administrator',
  MANAGER = 'Warehouse Manager',
  STAFF = 'Staff',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  assignedWarehouseId?: string;
}

export interface LowStockNotification {
  id: string; // Composite key like `${warehouse.id}-${product.id}`
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  minStockLevel: number;
  read: boolean;
}

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  RECEIVE = 'RECEIVE',
  ADJUST = 'ADJUST',
  QUICK_RECEIVE = 'QUICK_RECEIVE',
  QUICK_SHIP = 'QUICK_SHIP',
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
}