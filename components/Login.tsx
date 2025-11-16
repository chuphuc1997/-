
import React, { useState } from 'react';
import { User } from '../types';
import { WarehouseIcon } from './Icons';

interface LoginProps {
  users: User[];
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onLogin(selectedUserId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <WarehouseIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-3xl font-bold text-gray-800 dark:text-gray-100">
            재고 관리 시스템 로그인
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">계정을 선택하여 계속하세요.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                사용자 계정
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
