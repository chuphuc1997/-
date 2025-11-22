
import React, { useState, useEffect } from 'react';
import { WarehouseIcon, EyeIcon, EyeSlashIcon, GoogleIcon } from './Icons';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  companyInfo: {
    name: string;
    logoUrl: string;
  };
}

const Login: React.FC<LoginProps> = ({ onLogin, companyInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      try {
        const { email: rememberedEmail, password: rememberedPassword } = JSON.parse(rememberedUser);
        setEmail(rememberedEmail);
        setPassword(rememberedPassword);
        setRememberMe(true);
      } catch (e) {
        console.error("Failed to parse remembered user from localStorage", e);
        localStorage.removeItem('rememberedUser');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const success = onLogin(email, password);
      if (success) {
        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('rememberedUser');
        }
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        onLogin('admin@example.com', 'password123');
        setIsLoading(false);
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
           <div className="flex justify-center items-center h-24 mb-4">
            {companyInfo.logoUrl ? (
                <img src={companyInfo.logoUrl} alt={`${companyInfo.name} 로고`} className="h-full w-auto max-w-[280px] object-contain drop-shadow-sm" />
            ) : (
                <WarehouseIcon className="mx-auto h-24 w-24 text-blue-600" />
            )}
           </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {companyInfo.name}
          </h2>
           <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            계정에 로그인하세요
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">이메일 주소</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                로그인 정보 저장
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              또는
            </span>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Google 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
