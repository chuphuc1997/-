
import React, { useState, useEffect, useRef } from 'react';
import { User, Role, Warehouse } from '../types';
import Modal from './Modal';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, InformationCircleIcon } from './Icons';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'password'> & { id?: string; password?: string }) => void;
  user: User | null;
  warehouses: Warehouse[];
  isLoading: boolean;
}

// Helper component for user avatars, also used for preview
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


const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, warehouses, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.STAFF,
    assignedWarehouseIds: [] as string[],
    avatarUrl: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkPasswordStrength = (pass: string) => {
    if (!pass) {
        setPasswordStrength({ score: 0, text: '', color: '' });
        return;
    }

    const hasNumber = /\d/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    
    let strength = 0;
    if (hasNumber) strength++;
    if (hasLower) strength++;
    if (hasUpper) strength++;

    if (pass.length < 8) {
        setPasswordStrength({ score: 1, text: '취약', color: 'bg-red-500' });
    } else if (pass.length >= 8 && strength < 3) {
        setPasswordStrength({ score: 2, text: '보통', color: 'bg-yellow-500' });
    } else if (pass.length >= 8 && strength >= 3) {
        setPasswordStrength({ score: 3, text: '강함', color: 'bg-green-500' });
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        assignedWarehouseIds: user.assignedWarehouseIds || [],
        avatarUrl: user.avatarUrl || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: Role.STAFF,
        assignedWarehouseIds: [],
        avatarUrl: '',
        password: '',
        confirmPassword: '',
      });
    }
    setPasswordError('');
    checkPasswordStrength('');
  }, [user, isOpen]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
      setFormData(prev => ({ ...prev, avatarUrl: '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
        checkPasswordStrength(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Fix: Use functional update for setFormData to correctly access previous state.
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      if (name === 'role' && value === Role.ADMIN) {
          newFormData.assignedWarehouseIds = [];
      }
      return newFormData;
    });
  };
  
  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, assignedWarehouseIds: value ? [value] : [] }));
  };
  
  const handleMultiWarehouseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const newIds = checked
            ? [...prev.assignedWarehouseIds, value]
            : prev.assignedWarehouseIds.filter(id => id !== value);
        return { ...prev, assignedWarehouseIds: newIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (formData.password && formData.password.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!user && !formData.password) {
        setPasswordError('새 사용자는 비밀번호를 설정해야 합니다.');
        return;
    }

    const { confirmPassword, ...saveDataRest } = formData;
    const saveData: Omit<User, 'id' | 'password'> & { id?: string; password?: string } = {
        ...saveDataRest,
        assignedWarehouseIds: formData.role === Role.ADMIN ? [] : formData.assignedWarehouseIds,
    };

    if (user) {
        saveData.id = user.id;
    }
    
    if (!formData.password) {
        delete saveData.password;
    }

    onSave(saveData);
  };

  const showWarehouseSelector = [Role.MANAGER, Role.STAFF, Role.AREA_MANAGER].includes(formData.role);
  const isAreaManager = formData.role === Role.AREA_MANAGER;
  const isSaveDisabled = (!!formData.password && passwordStrength.score < 2) || formData.password !== formData.confirmPassword || isLoading;

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="user-form" disabled={isSaveDisabled} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? '사용자 수정' : '새 사용자 추가'} footer={modalFooter}>
      <form id="user-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">프로필 사진</label>
            <div className="flex items-center space-x-4">
                <Avatar src={formData.avatarUrl} alt={formData.name} className="h-20 w-20" />
                <div className="flex flex-col space-y-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        사진 변경
                    </button>
                    {formData.avatarUrl && (
                        <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-3 py-1.5 text-sm text-red-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            제거
                        </button>
                    )}
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">역할</label>
            <select name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              {Object.values(Role).map(roleValue => (
                <option key={roleValue} value={roleValue}>{roleValue}</option>
              ))}
            </select>
          </div>
          {showWarehouseSelector ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">담당 창고</label>
              {isAreaManager ? (
                  <div className="max-h-32 overflow-y-auto space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md">
                      {warehouses.map(wh => (
                          <div key={wh.id} className="flex items-center">
                              <input 
                                type="checkbox" 
                                id={`wh-${wh.id}`} 
                                value={wh.id}
                                checked={formData.assignedWarehouseIds.includes(wh.id)}
                                onChange={handleMultiWarehouseChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`wh-${wh.id}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">{wh.name}</label>
                          </div>
                      ))}
                  </div>
              ) : (
                <select name="assignedWarehouseIds" value={formData.assignedWarehouseIds[0] || ''} onChange={handleWarehouseChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="">창고 선택...</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0 text-blue-500" />
                <span>이 사용자에게는 선택된 창고에 대한 접근 권한만 부여됩니다.</span>
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>총괄 관리자(Admin)는 모든 창고에 접근할 수 있는 전체 권한을 가집니다. 별도의 창고 배정이 필요하지 않습니다.</span>
              </div>
            </div>
          )}

          <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{user ? '비밀번호 변경 (선택)' : '비밀번호 설정'}</legend>
            <div className="space-y-4 mt-2">
              <div className="relative">
                <label htmlFor="password" className="sr-only">비밀번호</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="새 비밀번호"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {formData.password && (
                 <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 3) * 100}%` }}></div>
                 </div>
              )}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호 확인"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
             {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
          </fieldset>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
    