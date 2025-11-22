
import React from 'react';
import Modal from './Modal';
import { Role } from '../types';

interface PermissionsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const permissions = [
  { feature: '모든 창고 데이터 접근', roles: [Role.ADMIN] },
  { feature: '사용자 추가/수정/삭제', roles: [Role.ADMIN] },
  { feature: '통계 보고서 조회', roles: [Role.ADMIN] },
  { feature: '전체 감사 기록 조회', roles: [Role.ADMIN] },
  { feature: '시스템 설정 변경', roles: [Role.ADMIN] },
  { feature: '재무 정보(거래/가치) 조회', roles: [Role.ADMIN, Role.AREA_MANAGER] },
  { feature: '담당 창고 상품 추가/수정', roles: [Role.ADMIN, Role.AREA_MANAGER, Role.MANAGER] },
  { feature: '담당 창고 상품 삭제', roles: [Role.ADMIN, Role.AREA_MANAGER, Role.MANAGER] },
  { feature: '담당 창고 재고 이동/입고', roles: [Role.ADMIN, Role.AREA_MANAGER, Role.MANAGER, Role.STAFF] },
  { feature: '담당 창고 상품 조회', roles: [Role.ADMIN, Role.AREA_MANAGER, Role.MANAGER, Role.STAFF] },
];

const allRoles = Object.values(Role);

const CheckMark: React.FC<{ hasPermission: boolean }> = ({ hasPermission }) => {
  return hasPermission ? 
    <span className="text-green-500 font-bold">✓</span> : 
    <span className="text-red-500 font-bold">✗</span>;
};

const PermissionsGuideModal: React.FC<PermissionsGuideModalProps> = ({ isOpen, onClose }) => {
  const modalFooter = (
    <div className="flex justify-end">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none">
        닫기
      </button>
    </div>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="역할 및 권한 안내" footer={modalFooter}>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        <p>각 역할은 다음과 같은 권한을 가집니다. 사용자의 역할을 변경하여 접근 권한을 조정할 수 있습니다.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                기능
              </th>
              {allRoles.map(role => (
                <th key={role} scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {permissions.map(({ feature, roles }) => (
              <tr key={feature}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{feature}</td>
                {allRoles.map(role => (
                  <td key={role} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <CheckMark hasPermission={roles.includes(role)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default PermissionsGuideModal;
