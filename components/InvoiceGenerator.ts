
import { Product, User, Warehouse, TransactionType } from '../types';

interface InvoiceData {
    companyName: string;
    logoUrl: string;
    transactionId: string;
    date: string;
    type: 'RECEIVE' | 'SHIP' | 'TRANSFER';
    warehouseName: string;
    relatedWarehouseName?: string;
    userName: string;
    items: {
        name: string;
        sku: string;
        quantity: number;
        unitPrice?: number;
        total?: number;
    }[];
    canViewFinancials: boolean;
}

export const printInvoice = (data: InvoiceData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalAmount = data.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const isTransfer = data.type === 'TRANSFER';
    
    const title = isTransfer ? '재고 이동 전표 (TRANSFER NOTE)' : (data.type === 'RECEIVE' ? '입고 전표 (RECEIPT)' : '출고 전표 (DELIVERY NOTE)');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - ${data.transactionId}</title>
            <style>
                body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .company-info h1 { margin: 0 0 5px 0; font-size: 24px; }
                .logo { max-height: 60px; max-width: 150px; object-fit: contain; }
                .title { text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; color: #444; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .info-item { margin-bottom: 8px; }
                .label { font-weight: bold; color: #666; width: 100px; display: inline-block; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .text-right { text-align: right; }
                .total-row td { font-weight: bold; background-color: #f8f9fa; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
                .signature { border-top: 1px solid #333; padding-top: 10px; width: 200px; }
                @media print {
                    body { padding: 0; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="logo" />` : ''}
                    <h1>${data.companyName}</h1>
                </div>
                <div style="text-align: right;">
                    <div class="info-item"><span class="label">No:</span> ${data.transactionId}</div>
                    <div class="info-item"><span class="label">날짜:</span> ${new Date(data.date).toLocaleDateString()}</div>
                    <div class="info-item"><span class="label">담당자:</span> ${data.userName}</div>
                </div>
            </div>

            <div class="title">${title}</div>

            <div class="info-grid">
                <div>
                    <div class="info-item"><span class="label">${isTransfer ? '출발 창고:' : '창고:'}</span> ${data.warehouseName}</div>
                    ${isTransfer && data.relatedWarehouseName ? `<div class="info-item"><span class="label">도착 창고:</span> ${data.relatedWarehouseName}</div>` : ''}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>SKU</th>
                        <th class="text-right">수량</th>
                        ${data.canViewFinancials ? '<th class="text-right">단가</th><th class="text-right">합계</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.sku}</td>
                            <td class="text-right">${item.quantity.toLocaleString()}</td>
                            ${data.canViewFinancials ? `
                                <td class="text-right">${(item.unitPrice || 0).toLocaleString()}원</td>
                                <td class="text-right">${(item.total || 0).toLocaleString()}원</td>
                            ` : ''}
                        </tr>
                    `).join('')}
                    
                    ${data.canViewFinancials ? `
                        <tr class="total-row">
                            <td colspan="4" class="text-right">총계</td>
                            <td class="text-right">${totalAmount.toLocaleString()}원</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <div class="footer">
                <div>
                    <div style="height: 60px;"></div>
                    <div class="signature">담당자 확인</div>
                </div>
                <div>
                    <div style="height: 60px;"></div>
                    <div class="signature">${isTransfer ? '인수자 확인' : (data.type === 'RECEIVE' ? '입고 확인' : '수령인 확인')}</div>
                </div>
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
