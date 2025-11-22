import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import Modal from './Modal';
import { PackageIcon, XMarkIcon, SparklesIcon } from './Icons';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
  skuTemplate: string;
  skuExcludedChars: string;
  isLoading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, skuTemplate, skuExcludedChars, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '0',
    price: '0',
    minStockLevel: '0',
    imageUrls: [] as string[],
    expirationDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const generateSku = useCallback((name: string, category?: string): string => {
    if (!skuTemplate) return `SKU-${Date.now().toString().slice(-7)}`;

    let result = skuTemplate;
    const now = new Date();

    const cleanString = (str: string): string => {
        if (!str) return '';
        let cleaned = str;
        if (skuExcludedChars) {
            const userExcludedRegex = new RegExp(`[${skuExcludedChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`, 'g');
            cleaned = cleaned.replace(userExcludedRegex, '');
        }
        return cleaned.replace(/[^a-zA-Z0-9\uAC00-\uD7A3\s]/g, '').trim();
    };


    const fullCat = cleanString(category || '').replace(/\s/g, '').toUpperCase();
    result = result.replace(/\[CAT\]/g, fullCat);
    const catPrefix = fullCat.substring(0, 3);
    result = result.replace(/\[CAT3\]/g, catPrefix);

    const cleanedName = cleanString(name || '');
    const namePrefix = cleanedName.replace(/\s/g, '').substring(0, 3).toUpperCase();
    result = result.replace(/\[NAME3\]/g, namePrefix);
    
    const words = cleanedName.split(/\s+/).filter(Boolean);
    let initials = '';
    if (words.length > 1) {
        initials = words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
    } else if (words.length === 1 && words[0]) {
        initials = words[0].substring(0, 3).toUpperCase();
    }
    result = result.replace(/\[INIT\]/g, initials);

    result = result.replace(/\[YYYY\]/g, now.getFullYear().toString());
    result = result.replace(/\[YY\]/g, now.getFullYear().toString().slice(-2));
    result = result.replace(/\[MM\]/g, (now.getMonth() + 1).toString().padStart(2, '0'));
    result = result.replace(/\[DD\]/g, now.getDate().toString().padStart(2, '0'));
    
    result = result.replace(/\[RAND([4-7])\]/g, (match, lengthStr) => {
        const length = parseInt(lengthStr, 10);
        const chars = '0123456789';
        let random = '';
        for (let i = 0; i < length; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return random;
    });
    
    const finalSku = result.replace(/\[.*?\]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').trim();
    if (!finalSku.replace(/[^a-zA-Z0-9-]/g, '')) {
        return `SKU-${Date.now().toString().slice(-7)}`;
    }

    return finalSku;
}, [skuTemplate, skuExcludedChars]);
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        quantity: String(product.quantity),
        price: String(product.price),
        minStockLevel: String(product.minStockLevel || 0),
        imageUrls: product.imageUrls || [],
        expirationDate: product.expirationDate || '',
      });
      setIsSkuManuallyEdited(!!product.sku);
    } else {
      setFormData({ name: '', sku: '', category: '', quantity: '0', price: '0', minStockLevel: '0', imageUrls: [], expirationDate: '' });
      setIsSkuManuallyEdited(false);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      if (!isSkuManuallyEdited && !product && (name === 'name' || name === 'category')) {
        const newName = name === 'name' ? value : prev.name;
        const newCategory = name === 'category' ? value : prev.category;
        newFormData.sku = generateSku(newName, newCategory);
      }
      return newFormData;
    });

    const numberFields = ['quantity', 'price', 'minStockLevel'];
    if (numberFields.includes(name)) {
        const numValue = parseFloat(value);
        if (value && numValue < 0) {
            setErrors(prevErrors => ({...prevErrors, [name]: '음수 값은 입력할 수 없습니다.'}));
        } else {
            setErrors(prevErrors => {
                const newErrors = {...prevErrors};
                delete newErrors[name];
                return newErrors;
            });
        }
    }
  };
  
  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSkuManuallyEdited(true);
    setFormData(prev => ({ ...prev, sku: e.target.value }));
  };

  const handleRegenerateSku = () => {
    if (formData.name || formData.category) {
      setFormData(prev => ({ ...prev, sku: generateSku(prev.name!, prev.category) }));
      setIsSkuManuallyEdited(false);
    }
  };

  const handleFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const promises = imageFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Urls => {
      setFormData(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...base64Urls],
      }));
    });
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleDragOverUpload = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
  };
  
  const handleDropUpload = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, index) => index !== indexToRemove),
    }));
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (index: number) => {
      if (draggedIndex !== null && draggedIndex !== index) {
          setDragOverIndex(index);
      }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };
  const handleDropReorder = () => {
      if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) return;
      
      setFormData(prev => {
          const items = [...(prev.imageUrls || [])];
          const [reorderedItem] = items.splice(draggedIndex, 1);
          items.splice(dragOverIndex, 0, reorderedItem);
          return { ...prev, imageUrls: items };
      });
  };
  const handleDragEnd = () => {
      setDraggedIndex(null);
      setDragOverIndex(null);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(err => err)) {
        return;
    }
    const quantityNum = parseFloat(formData.quantity);
    const priceNum = parseFloat(formData.price);
    const minStockLevelNum = parseFloat(formData.minStockLevel);

    if (isNaN(quantityNum) || isNaN(priceNum) || isNaN(minStockLevelNum)) {
        return;
    }

    const newProduct: Product = {
      id: product?.id || `prod-${new Date().getTime()}`,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      quantity: quantityNum,
      price: priceNum,
      minStockLevel: minStockLevelNum,
      imageUrls: formData.imageUrls || [],
      expirationDate: formData.expirationDate,
      lastUpdated: new Date().toISOString(),
    };
    onSave(newProduct);
  };

  const isEditing = !!product;
  const isSaveDisabled = Object.values(errors).some(err => err);
  
  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="product-form" disabled={isSaveDisabled || isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? '상품 수정' : '새 상품 추가'} footer={modalFooter}>
      <form id="product-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상품명</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
                <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <div className="relative">
                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleSkuChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10" />
                <button type="button" onClick={handleRegenerateSku} title="SKU 자동 생성" className="absolute inset-y-0 right-0 flex items-center pr-3 text-yellow-500 hover:text-yellow-400">
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">상품 이미지</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                {(formData.imageUrls || []).map((url, index) => {
                    const isFeatured = index === 0;
                    const isDragging = draggedIndex === index;
                    const isDragOverPlaceholder = dragOverIndex === index;

                    return (
                    <div
                        key={url + index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragOver={handleDragOver}
                        onDrop={handleDropReorder}
                        onDragEnd={handleDragEnd}
                        className={`relative group aspect-square rounded-lg cursor-grab transition-transform duration-200
                        ${isDragging ? 'opacity-50 scale-105 shadow-2xl z-10 transform-gpu' : 'shadow-sm'}
                        `}
                    >
                        {isDragOverPlaceholder && draggedIndex !== index && (
                        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-blue-500 z-10 animate-pulse" />
                        )}

                        <div className={`w-full h-full rounded-lg overflow-hidden transition-all ${isFeatured ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}>
                        <img src={url} alt={`상품 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                        </div>

                        {isFeatured && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md shadow">
                            대표
                        </div>
                        )}

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="이미지 제거"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    );
                })}
            </div>
            <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors duration-200 ${isDraggingOverUpload ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
            >
                <div className="space-y-1 text-center">
                    <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    {isDraggingOverUpload ? (
                        <p className="font-semibold text-blue-600 dark:text-blue-300">여기에 파일을 놓으세요</p>
                    ) : (
                        <>
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>파일 업로드</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} multiple />
                            </label>
                            <p className="pl-1">또는 드래그 앤 드롭</p>
                        </>
                    )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        여러 파일을 선택할 수 있습니다
                    </p>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">수량</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                disabled={isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
              {isEditing && !errors.quantity && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  수량은 목록의 +/- 버튼으로 조정하세요.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">가격 (원)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">최소 재고 수준 (경고 기준)</label>
              <input type="number" name="minStockLevel" id="minStockLevel" value={formData.minStockLevel} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              {errors.minStockLevel && <p className="mt-1 text-xs text-red-500">{errors.minStockLevel}</p>}
            </div>
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">유통기한</label>
              <input type="date" name="expirationDate" id="expirationDate" value={formData.expirationDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
