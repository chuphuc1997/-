
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Logic to create page numbers with ellipses for better UX on large lists
  const pageNumbers = [];
  const maxPagesToShow = 5;
  const halfPagesToShow = Math.floor(maxPagesToShow / 2);

  if (totalPages <= maxPagesToShow + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > halfPagesToShow + 2) {
      pageNumbers.push('...');
    }

    let startPage = Math.max(2, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

    if (currentPage <= halfPagesToShow + 1) {
        endPage = startPage + maxPagesToShow - 1;
    }
    
    if (currentPage >= totalPages - halfPagesToShow) {
        startPage = endPage - maxPagesToShow + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    if (currentPage < totalPages - halfPagesToShow - 1) {
      pageNumbers.push('...');
    }
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          다음
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            총 <span className="font-medium">{totalPages}</span> 페이지 중 <span className="font-medium">{currentPage}</span> 페이지
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="sr-only">이전</span>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {pageNumbers.map((page, index) =>
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-gray-700 dark:border-blue-500 dark:text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  ...
                </span>
              )
            )}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="sr-only">다음</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
