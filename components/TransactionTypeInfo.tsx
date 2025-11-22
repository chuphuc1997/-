import React from 'react';
import { TransactionType } from '../types';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, PlusCircleIcon, MinusCircleIcon, ReceiveIcon, EditIcon, QuickReceiveIcon, QuickShipIcon } from './Icons';

interface TransactionTypeInfoProps {
    type: TransactionType;
}

const TransactionTypeInfo: React.FC<TransactionTypeInfoProps> = ({ type }) => {
    switch (type) {
        case TransactionType.IN:
            return <span className="flex items-center text-sm text-green-600 dark:text-green-400"><ArrowDownOnSquareIcon className="w-5 h-5 mr-2" />입고 (이동)</span>;
        case TransactionType.OUT:
            return <span className="flex items-center text-sm text-red-600 dark:text-red-400"><ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />출고 (이동)</span>;
        case TransactionType.CREATE:
            return <span className="flex items-center text-sm text-blue-600 dark:text-blue-400"><PlusCircleIcon className="w-5 h-5 mr-2" />생성</span>;
        case TransactionType.DELETE:
            return <span className="flex items-center text-sm text-gray-500 dark:text-gray-400"><MinusCircleIcon className="w-5 h-5 mr-2" />삭제</span>;
        case TransactionType.RECEIVE:
             return <span className="flex items-center text-sm text-cyan-600 dark:text-cyan-400"><ReceiveIcon className="w-5 h-5 mr-2" />입고 (구매)</span>;
        case TransactionType.ADJUST:
             return <span className="flex items-center text-sm text-yellow-600 dark:text-yellow-400"><EditIcon className="w-5 h-5 mr-2" />수량 조정</span>;
        case TransactionType.QUICK_RECEIVE:
             return <span className="flex items-center text-sm text-cyan-600 dark:text-cyan-400"><QuickReceiveIcon className="w-5 h-5 mr-2" />빠른 입고</span>;
        case TransactionType.QUICK_SHIP:
             return <span className="flex items-center text-sm text-orange-600 dark:text-orange-400"><QuickShipIcon className="w-5 h-5 mr-2" />빠른 출고</span>;
        case TransactionType.SHIP:
             return <span className="flex items-center text-sm text-orange-600 dark:text-orange-400"><ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />출고 (판매)</span>;
        default:
            return <span>{type}</span>;
    }
};

export const getTransactionTypeName = (type: TransactionType) => {
    switch (type) {
        case TransactionType.IN: return '입고 (이동)';
        case TransactionType.OUT: return '출고 (이동)';
        case TransactionType.CREATE: return '생성';
        case TransactionType.DELETE: return '삭제';
        case TransactionType.RECEIVE: return '입고 (구매)';
        case TransactionType.ADJUST: return '수량 조정';
        case TransactionType.QUICK_RECEIVE: return '빠른 입고';
        case TransactionType.QUICK_SHIP: return '빠른 출고';
        case TransactionType.SHIP: return '출고 (판매)';
        default: return type;
    }
};

export default TransactionTypeInfo;