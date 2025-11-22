
import React, { useState, useMemo } from 'react';
import { Product, User, Warehouse, TransactionType } from '../types';
import Modal from './Modal';
import TransactionTypeInfo from './TransactionTypeInfo';
import { 
    EditIcon, ArrowRightLeftIcon, ClipboardDocumentListIcon, 
    PhotoIcon, MagnifyingGlassPlusIcon, XMarkIcon, ClockIcon,
    ExclamationTriangleIcon, MapPinIcon, CubeIcon, TagIcon,
    PackageIcon, CurrencyDollarIcon
} from './Icons';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  warehouse: Warehouse | null;
  users: User[];
  warehouses: Warehouse[];
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
    isOpen, onClose, product, warehouse, users, warehouses, onEdit, onAdjustStock 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const sortedHistory = useMemo(() => {
    if (!product?.quantityHistory) return [];
    return [...product.quantityHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [product?.quantityHistory]);

  if (!product || !warehouse) return null;

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || '알 수 없음';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '알 수 없음';

  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];
  const hasImages = images.length > 0;

  const getExpirationStatus = (expirationDate?: string) => {
      if (!expirationDate) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: '만료됨', color: 'text-red-600 bg-red-100' };
      if (diffDays <= 30) return { text: `${diffDays}일 남음 (임박)`, color: 'text-yellow-700 bg-yellow-100' };
      return { text: `${diffDays}일 남음`, color: 'text-green-700 bg-green-100' };
  };

  const expStatus = getExpirationStatus(product.expirationDate);

  const modalFooter = (
    <div className="flex justify-end space-x-3">
       <button onClick={() => onEdit(product)} className="inline-flex justify-center items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
          <EditIcon className="w-4 h-4 mr-2" />
          정보 수정
      </button>
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none">
        닫기
      </button>
    </div>
  );

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} title="상품 상세 정보" footer={modalFooter}>
        <div className="flex flex-col space-y-8">
            {/* Top Section: Image Gallery & Info */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Image Gallery */}
                <div className="w-full lg:w-1/3 space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                        {hasImages ? (
                            <>
                                <img 
                                    src={images[selectedImageIndex]} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                    onClick={() => setIsLightboxOpen(true)}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                                        <MagnifyingGlassPlusIcon className="w-4 h-4 mr-1" /> 확대
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <PhotoIcon className="w-16 h-16 mb-2" />
                                <span className="text-sm">이미지 없음</span>
                            </div>
                        )}
                    </div>
                    
                    {hasImages && images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                            {images.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${selectedImageIndex === idx ? 'border-blue-500' : 'border-transparent'}`}
                                >
                                    <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">SKU: {product.sku}</span>
                            {product.category && (
                                <span className="flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                    <TagIcon className="w-3.5 h-3.5 mr-1" /> {product.category}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Inventory Card */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">현재 재고</p>
                                {product.minStockLevel !== undefined && product.quantity < product.minStockLevel && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                        재고 부족
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline space-x-1">
                                    <span className={`text-3xl font-bold ${product.quantity < (product.minStockLevel || 0) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                        {product.quantity.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500">개</span>
                                </div>
                                <button 
                                    onClick={() => onAdjustStock(product)} 
                                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                                    title="재고 수량 조정"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                            </div>
                             {product.minStockLevel !== undefined && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center text-xs text-gray-500">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                                    최소 유지 재고: <span className="font-medium ml-1 text-gray-700 dark:text-gray-300">{product.minStockLevel.toLocaleString()}개</span>
                                </div>
                            )}
                        </div>

                        {/* Value Card */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">가격 정보</p>
                            <div className="flex items-baseline space-x-1 mb-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{product.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500">원</span>
                                <span className="text-xs text-gray-400 ml-1">(단가)</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 flex items-center">
                                        <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                        재고 총 가치
                                    </span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                        {(product.price * product.quantity).toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 py-2">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">보관 위치</p>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{warehouse.name} &rsaquo; {warehouse.location}</p>
                            </div>
                        </div>
                        
                        {product.expirationDate && (
                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <ClockIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">유통기한</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">{product.expirationDate}</span>
                                        {expStatus && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${expStatus.color}`}>
                                                {expStatus.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: History */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-gray-500" />
                    최근 입출고 내역
                </h3>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">날짜</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">구분</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">수량</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">담당자</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedHistory.length > 0 ? sortedHistory.slice(0, 5).map(entry => { // Show only last 5
                                const isPositive = entry.quantityChange > 0;
                                return (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <TransactionTypeInfo type={entry.type} />
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPositive ? '+' : ''}{entry.quantityChange.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {getUserName(entry.userId)}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">기록이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {sortedHistory.length > 5 && (
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-center border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">최근 5건만 표시됩니다. 전체 내역은 목록의 '히스토리' 아이콘을 이용하세요.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </Modal>

        {/* Lightbox Overlay */}
        {isLightboxOpen && (
            <div 
                className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setIsLightboxOpen(false)}
            >
                <button 
                    className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>
                <img 
                    src={images[selectedImageIndex]} 
                    alt="Product Fullscreen" 
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                />
            </div>
        )}
    </>
  );
};

export default ProductDetailModal;
