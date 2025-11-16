
import { Warehouse, User, Role, TransactionType } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-admin', name: '김민준 (관리자)', role: Role.ADMIN },
  { id: 'user-manager-seoul', name: '이서연 (서울 담당)', role: Role.MANAGER, assignedWarehouseId: 'wh-seoul-main' },
  { id: 'user-staff-busan', name: '박하준 (부산 스태프)', role: Role.STAFF, assignedWarehouseId: 'wh-busan-port' },
];

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
        quantity: 150,
        price: 1200000,
        minStockLevel: 100,
        lastUpdated: '2023-10-27T10:00:00Z',
        lastUpdatedBy: 'user-manager-seoul',
        quantityHistory: [
          { id: 'hist-init-001', date: '2023-10-20T09:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 150, oldQuantity: 0, newQuantity: 150 }
        ]
      },
      {
        id: 'prod-002',
        name: '노이즈캔슬링 헤드폰',
        sku: 'NC-2030',
        quantity: 80,
        price: 350000,
        minStockLevel: 100,
        lastUpdated: '2023-10-27T11:30:00Z',
        lastUpdatedBy: 'user-manager-seoul',
        quantityHistory: [
          { id: 'hist-init-002', date: '2023-10-21T09:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 80, oldQuantity: 0, newQuantity: 80 }
        ]
      },
      {
        id: 'prod-003',
        name: '4K 스마트 TV 65인치',
        sku: 'TV-4K65',
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
        quantity: 25,
        price: 2100000,
        minStockLevel: 30,
        lastUpdated: '2023-10-25T09:00:00Z',
        lastUpdatedBy: 'user-staff-busan',
        quantityHistory: [
          { id: 'hist-init-004', date: '2023-10-20T10:00:00Z', userId: 'user-admin', type: TransactionType.CREATE, quantityChange: 25, oldQuantity: 0, newQuantity: 25 }
        ]
      },
      {
        id: 'prod-005',
        name: '무선 충전기',
        sku: 'WC-500',
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