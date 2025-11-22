
import { Warehouse, User, Role, TransactionType } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-admin', name: '김민준', role: Role.ADMIN, email: 'admin@example.com', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'user-admin-2', name: '새 관리자', role: Role.ADMIN, email: 'admin2@example.com', password: 'password123' },
  { id: 'user-areamanager', name: '정우성', role: Role.AREA_MANAGER, assignedWarehouseIds: ['wh-seoul-main', 'wh-gyeonggi-logistics'], email: 'area.manager@example.com', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'user-manager-seoul', name: '이서연', role: Role.MANAGER, assignedWarehouseIds: ['wh-seoul-main'], email: 'manager.seoul@example.com', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'user-staff-busan', name: '박하준', role: Role.STAFF, assignedWarehouseIds: ['wh-busan-port'], email: 'staff.busan@example.com', password: 'password123' },
];

const today = new Date();
const expiringSoonDate = new Date();
expiringSoonDate.setDate(today.getDate() + 15);
const expiringSoonDateString = expiringSoonDate.toISOString().split('T')[0];


export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-seoul-main',
    name: '서울 본창고',
    location: '서울특별시 강남구',
    products: [
      {
        id: 'prod-001',
        name: '프리미엄 스마트폰',
        sku: 'PS-1001',
        category: '전자기기',
        quantity: 150,
        price: 1200000,
        minStockLevel: 100,
        lastUpdated: '2023-10-27T10:00:00Z',
        lastUpdatedBy: 'user-manager-seoul',
        imageUrls: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'],
        expirationDate: '2025-06-30',
        quantityHistory: [
          { id: 'hist-init-001', date: '2023-10-20T09:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 150, oldQuantity: 0, newQuantity: 150 }
        ]
      },
      {
        id: 'prod-002',
        name: '노이즈캔슬링 헤드폰',
        sku: 'NC-2030',
        category: '오디오',
        quantity: 80,
        price: 350000,
        minStockLevel: 100,
        lastUpdated: '2023-10-27T11:30:00Z',
        lastUpdatedBy: 'user-manager-seoul',
        imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
        expirationDate: expiringSoonDateString,
        quantityHistory: [
          { id: 'hist-init-002', date: '2023-10-21T09:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 80, oldQuantity: 0, newQuantity: 80 }
        ]
      },
      {
        id: 'prod-003',
        name: '4K 스마트 TV 65인치',
        sku: 'TV-4K65',
        category: '가전제품',
        quantity: 75,
        price: 1800000,
        minStockLevel: 50,
        lastUpdated: '2023-10-26T15:00:00Z',
        lastUpdatedBy: 'user-admin',
        quantityHistory: [
          { id: 'hist-init-003', date: '2023-10-22T09:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 75, oldQuantity: 0, newQuantity: 75 }
        ]
      },
    ],
  },
  {
    id: 'wh-busan-port',
    name: '부산항 창고',
    location: '부산광역시 중구',
    products: [
      {
        id: 'prod-004',
        name: '고성능 노트북',
        sku: 'LP-X1',
        category: '컴퓨터',
        quantity: 25,
        price: 2100000,
        minStockLevel: 30,
        lastUpdated: '2023-10-25T09:00:00Z',
        lastUpdatedBy: 'user-staff-busan',
        imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80'],
        expirationDate: '2024-01-01',
        quantityHistory: [
          { id: 'hist-init-004', date: '2023-10-20T10:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 25, oldQuantity: 0, newQuantity: 25 }
        ]
      },
      {
        id: 'prod-005',
        name: '무선 충전기',
        sku: 'WC-500',
        category: '액세서리',
        quantity: 500,
        price: 45000,
        minStockLevel: 200,
        lastUpdated: '2023-10-27T14:20:00Z',
        lastUpdatedBy: 'user-admin',
        quantityHistory: [
          { id: 'hist-init-005', date: '2023-10-21T10:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 500, oldQuantity: 0, newQuantity: 500 }
        ]
      },
    ],
  },
  {
    id: 'wh-gyeonggi-logistics',
    name: '경기 물류센터',
    location: '경기도 이천시',
    products: [
      {
        id: 'prod-006',
        name: 'AI 스마트 스피커',
        sku: 'AI-SPK-01',
        category: '스마트홈',
        quantity: 450,
        price: 130000,
        lastUpdated: '2023-10-27T08:45:00Z',
        lastUpdatedBy: 'user-admin',
        quantityHistory: [
          { id: 'hist-init-006', date: '2023-10-22T11:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 450, oldQuantity: 0, newQuantity: 450 }
        ]
      },
      {
        id: 'prod-007',
        name: '로봇 청소기',
        sku: 'RC-V9',
        category: '가전제품',
        quantity: 40,
        price: 650000,
        minStockLevel: 50,
        lastUpdated: '2023-10-26T18:10:00Z',
        lastUpdatedBy: 'user-admin',
        quantityHistory: [
          { id: 'hist-init-007', date: '2023-10-23T11:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 40, oldQuantity: 0, newQuantity: 40 }
        ]
      },
      {
        id: 'prod-008',
        name: '태블릿 PC 11인치',
        sku: 'TAB-11-PRO',
        category: '컴퓨터',
        quantity: 220,
        price: 890000,
        minStockLevel: 150,
        lastUpdated: '2023-10-27T13:00:00Z',
        lastUpdatedBy: 'user-admin',
        quantityHistory: [
          { id: 'hist-init-008', date: '2023-10-24T11:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 220, oldQuantity: 0, newQuantity: 220 }
        ]
      },
    ],
  },
];