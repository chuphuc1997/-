
import React, { useState, useEffect } from 'react';
import { User, Warehouse, Role } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, UserCircleIcon, WarehouseIcon, InformationCircleIcon } from './Icons';
import PermissionsGuideModal from './PermissionsGuideModal';

interface UserManagementProps {
    users: User[];
    warehouses: Warehouse[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    currentUserId: string;
}

// Helper component for user avatars
const Avatar: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className = 'h-8 w-8' }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError || !src) {
        return <UserCircleIcon className={`${className} text-gray-500 dark:text-gray-400`} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className={`${className} rounded-full object-cover`}
        />
    );
};

const UserManagement: React.FC<UserManagementProps> = ({ users, warehouses, onAddUser, onEditUser, onDeleteUser, currentUserId }) => {
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">사용자 관리</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">총괄 계정은 여기에서 다른 사용자의 권한 및 담당 창고를 수정할 수 있습니다.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setIsPermissionsModalOpen(true)} 
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <InformationCircleIcon className="w-5 h-5 mr-2" />
                        권한 안내
                    </button>
                    <button onClick={onAddUser} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        새 사용자 추가
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map(user => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col items-center text-center transition-shadow hover:shadow-lg">
                        <div className="relative mb-3">
                            <Avatar src={user.avatarUrl} alt={user.name} className="h-24 w-24" />
                             {user.id === currentUserId && (
                                <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">나</span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate w-full">{user.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full">{user.email}</p>
                        <div className="my-3">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === Role.ADMIN ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                user.role === Role.AREA_MANAGER ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                                user.role === Role.MANAGER ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            }`}>
                                {user.role}
                            </span>
                        </div>

                        <div className="flex-grow w-full border-t border-gray-200 dark:border-gray-700 my-3 pt-3">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">담당 창고</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 h-12 flex items-center justify-center">
                                {user.role === Role.ADMIN ? (
                                    <span className="italic">모든 창고 접근 가능</span>
                                ) : (user.assignedWarehouseIds && user.assignedWarehouseIds.length > 0) ? (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        {user.assignedWarehouseIds.map(whId => {
                                            const warehouse = warehouses.find(w => w.id === whId);
                                            return (
                                                <span key={whId} className="flex items-center text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full px-2 py-0.5">
                                                    <WarehouseIcon className="w-3 h-3 mr-1" />
                                                    {warehouse?.name || '알 수 없음'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span className="italic">할당된 창고 없음</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center space-x-2 mt-2 w-full">
                            <button onClick={() => onEditUser(user)} className="flex-1 inline-flex justify-center items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50" title="수정"><EditIcon className="w-4 h-4 mr-1" /> 수정</button>
                            <button 
                                onClick={() => onDeleteUser(user.id)} 
                                disabled={user.id === currentUserId}
                                className="flex-1 inline-flex justify-center items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                                title={user.id === currentUserId ? '자신을 삭제할 수 없습니다' : '삭제'}
                            >
                                <DeleteIcon className="w-4 h-4 mr-1" /> 삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <PermissionsGuideModal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} />
        </div>
    );
};

export default UserManagement;
