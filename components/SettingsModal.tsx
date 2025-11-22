
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { WarehouseIcon, SunIcon, MoonIcon, ComputerDesktopIcon, SwatchIcon, AdjustmentsHorizontalIcon, Cog6ToothIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { 
    receiveAmount: number; 
    shipAmount: number; 
    companyName: string; 
    logoUrl: string; 
    skuTemplate: string; 
    skuExcludedChars: string;
    expiringSoonThreshold: number;
    theme: 'light' | 'dark' | 'system';
    features: {
      financials: boolean;
      auditTrail: boolean;
      statistics: boolean;
      userManagement: boolean;
    };
  }) => void;
  currentReceiveAmount: number;
  currentShipAmount: number;
  currentCompanyName: string;
  currentLogoUrl: string;
  currentSkuTemplate: string;
  currentSkuExcludedChars: string;
  currentExpiringSoonThreshold: number;
  currentTheme: 'light' | 'dark' | 'system';
  currentFeatures: {
    financials: boolean;
    auditTrail: boolean;
    statistics: boolean;
    userManagement: boolean;
  };
  isLoading: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, onSave, 
  currentReceiveAmount, currentShipAmount, currentCompanyName, currentLogoUrl, 
  currentSkuTemplate, currentSkuExcludedChars, currentExpiringSoonThreshold,
  currentTheme, currentFeatures,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'features'>('general');
  
  // General Settings
  const [receiveAmount, setReceiveAmount] = useState(currentReceiveAmount);
  const [shipAmount, setShipAmount] = useState(currentShipAmount);
  const [companyName, setCompanyName] = useState(currentCompanyName);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [skuTemplate, setSkuTemplate] = useState(currentSkuTemplate);
  const [skuExcludedChars, setSkuExcludedChars] = useState(currentSkuExcludedChars);
  const [expiringSoonThreshold, setExpiringSoonThreshold] = useState(currentExpiringSoonThreshold);
  
  // Appearance Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(currentTheme);

  // Feature Settings
  const [features, setFeatures] = useState(currentFeatures);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReceiveAmount(currentReceiveAmount);
      setShipAmount(currentShipAmount);
      setCompanyName(currentCompanyName);
      setLogoUrl(currentLogoUrl);
      setSkuTemplate(currentSkuTemplate);
      setSkuExcludedChars(currentSkuExcludedChars);
      setExpiringSoonThreshold(currentExpiringSoonThreshold);
      setTheme(currentTheme);
      setFeatures(currentFeatures);
      setActiveTab('general');
    }
  }, [isOpen, currentReceiveAmount, currentShipAmount, currentCompanyName, currentLogoUrl, currentSkuTemplate, currentSkuExcludedChars, currentExpiringSoonThreshold, currentTheme, currentFeatures]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
      setLogoUrl('');
  };

  const handleFeatureToggle = (key: keyof typeof features) => {
      setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receiveAmount > 0 && shipAmount > 0 && expiringSoonThreshold >= 0) {
      onSave({ 
        receiveAmount, 
        shipAmount, 
        companyName, 
        logoUrl, 
        skuTemplate, 
        skuExcludedChars, 
        expiringSoonThreshold,
        theme,
        features
      });
    }
  };

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="settings-form" disabled={receiveAmount <= 0 || shipAmount <= 0 || expiringSoonThreshold < 0 || isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500">
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </div>
  );

  const TabButton: React.FC<{ id: typeof activeTab, label: string, icon: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm flex justify-center items-center ${
        activeTab === id
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="시스템 설정" footer={modalFooter}>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex -mb-px">
          <TabButton id="general" label="일반 설정" icon={<Cog6ToothIcon className="w-4 h-4" />} />
          <TabButton id="appearance" label="화면 설정" icon={<SwatchIcon className="w-4 h-4" />} />
          <TabButton id="features" label="기능 관리" icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} />
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSubmit}>
        
        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in-up">
            <fieldset className="space-y-4">
              <legend className="text-base font-semibold text-gray-900 dark:text-white">브랜딩</legend>
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  회사명
                </label>
                <input
                  type="text"
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      회사 로고
                  </label>
                  <div className="flex items-center space-x-4">
                      <div className="h-16 w-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                          {logoUrl ? (
                              <img src={logoUrl} alt="회사 로고 미리보기" className="h-full w-full object-contain" />
                          ) : (
                              <WarehouseIcon className="h-8 w-8 text-gray-400" />
                          )}
                      </div>
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
                              로고 변경
                          </button>
                          {logoUrl && (
                              <button
                                  type="button"
                                  onClick={handleRemoveLogo}
                                  className="px-3 py-1.5 text-sm text-red-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                  제거
                              </button>
                          )}
                      </div>
                  </div>
              </div>
            </fieldset>
            
            <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              <legend className="text-base font-semibold text-gray-900 dark:text-white">SKU 자동 생성 규칙</legend>
              <div>
                <label htmlFor="sku-template" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU 템플릿
                </label>
                <input
                  type="text"
                  id="sku-template"
                  value={skuTemplate}
                  onChange={(e) => setSkuTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                />
              </div>
               <div>
                <label htmlFor="sku-excluded-chars" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제외할 문자 (SKU 접두사용)
                </label>
                <input
                  type="text"
                  id="sku-excluded-chars"
                  value={skuExcludedChars}
                  onChange={(e) => setSkuExcludedChars(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                  placeholder="예: _-"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                <p className="font-semibold font-sans">사용 가능한 변수:</p>
                <ul className="list-disc list-inside space-y-1 pl-2 font-mono">
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[CAT]</code>: 전체 카테고리명</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[CAT3]</code>: 카테고리 앞 3글자</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[NAME3]</code>: 상품명 앞 3글자</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[INIT]</code>: 상품명 이니셜</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[YYYY]</code>/<code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[YY]</code>: 연도</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[MM]</code>/<code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[DD]</code>: 월/일</li>
                  <li><code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">[RAND4-7]</code>: 난수</li>
                </ul>
              </div>
            </fieldset>
  
            <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <legend className="text-base font-semibold text-gray-900 dark:text-white mb-2">알림 설정</legend>
                    <label htmlFor="expiring-soon-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      '만료 임박' 기준 (일)
                    </label>
                    <input
                      type="number"
                      id="expiring-soon-threshold"
                      value={expiringSoonThreshold}
                      onChange={(e) => setExpiringSoonThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                 </div>
                 <div>
                    <legend className="text-base font-semibold text-gray-900 dark:text-white mb-2">빠른 작업 설정</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="quick-receive-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          입고 수량
                        </label>
                        <input
                          type="number"
                          id="quick-receive-amount"
                          value={receiveAmount}
                          onChange={(e) => setReceiveAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="quick-ship-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          출고 수량
                        </label>
                        <input
                          type="number"
                          id="quick-ship-amount"
                          value={shipAmount}
                          onChange={(e) => setShipAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                 </div>
              </div>
            </fieldset>
          </div>
        )}

        {/* --- APPEARANCE TAB --- */}
        {activeTab === 'appearance' && (
           <div className="space-y-6 animate-fade-in-up">
              <fieldset>
                <legend className="text-base font-semibold text-gray-900 dark:text-white mb-4">테마 설정</legend>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                        <SunIcon className={`w-8 h-8 mb-2 ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>라이트 모드</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                        <MoonIcon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>다크 모드</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                        <ComputerDesktopIcon className={`w-8 h-8 mb-2 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'system' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>시스템 설정</span>
                    </button>
                </div>
              </fieldset>
           </div>
        )}

        {/* --- FEATURES TAB --- */}
        {activeTab === 'features' && (
            <div className="space-y-6 animate-fade-in-up">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">기능 표시/숨김</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        사용하지 않는 기능을 비활성화하여 관리자 메뉴를 간소화할 수 있습니다.
                    </p>
                    
                    <div className="space-y-4">
                        {[
                            { key: 'financials', label: '재무 관리 (거래/보고서)', desc: '입출고 가치, 자산 변동 보고서 및 거래 관리 페이지' },
                            { key: 'statistics', label: '재고 통계 보고서', desc: '카테고리별 재고, 유통기한 분석 등 통계 대시보드' },
                            { key: 'auditTrail', label: '감사 기록 (Audit Trail)', desc: '모든 재고 이동 및 수정 이력 추적' },
                            { key: 'userManagement', label: '사용자 관리', desc: '사용자 추가, 역할 할당 및 창고 배정 기능' },
                        ].map((feature) => (
                            <div key={feature.key} className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center h-5">
                                    <input
                                        id={`feature-${feature.key}`}
                                        type="checkbox"
                                        checked={features[feature.key as keyof typeof features]}
                                        onChange={() => handleFeatureToggle(feature.key as keyof typeof features)}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={`feature-${feature.key}`} className="font-medium text-gray-900 dark:text-white select-none cursor-pointer">
                                        {feature.label}
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </form>
    </Modal>
  );
};

export default SettingsModal;
