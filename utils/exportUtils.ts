/**
 * Utility for exporting data to CSV format compatible with Microsoft Excel.
 * Handles UTF-8 with BOM for correct character encoding in Portuguese.
 */

export const exportToCSV = (data: any[], fileName: string, customHeaders?: string[]) => {
    if (!data || !data.length) {
        alert("Nenhum dado disponível para exportar.");
        return;
    }

    // Use custom headers if provided, otherwise grab keys from the first object
    const headers = customHeaders || Object.keys(data[0]);

    // Format rows
    const csvContent = [
        headers.join(';'), // Excel in some locales (like PT-BR) prefers semicolon
        ...data.map(row =>
            headers.map(header => {
                let value = row[header] ?? '';

                // Handle values that might contain semicolon or newlines
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""'); // Escape double quotes
                    if (value.includes(';') || value.includes('\n') || value.includes('"')) {
                        value = `"${value}"`;
                    }
                }

                // Handle arrays (like items in an order)
                if (Array.isArray(value)) {
                    value = `"${value.map(v => v.name || v).join(', ')}"`;
                }

                return value;
            }).join(';')
        )
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportDashboardToExcel = (contextData: any) => {
    // This is a more complex aggregation for a general report
    const { transactions, sales, employees, inventory, fleet } = contextData;

    // We can't easily export multiple tabs into one file without a heavy library like xlsx,
    // so we provide a selection or export the most important one (Financials/Transactions)
    exportToCSV(transactions, 'Relatorio_Financeiro_Completo');
};

export const printDocument = (title: string, htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Por favor, permita pop-ups para imprimir documentos.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1e293b; 
                    line-height: 1.5;
                }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start;
                    border-bottom: 4px solid #0891b2; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .company-info h1 { margin: 0; color: #0891b2; font-weight: 900; font-size: 28px; }
                .doc-info { text-align: right; }
                .doc-info h2 { margin: 0; font-size: 20px; text-transform: uppercase; color: #64748b; }
                .details-grid { 
                    display: grid; 
                    grid-template-cols: 1fr 1fr; 
                    gap: 40px; 
                    margin-bottom: 40px;
                }
                .detail-box h3 { 
                    font-size: 12px; 
                    text-transform: uppercase; 
                    color: #94a3b8; 
                    margin-bottom: 8px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 4px;
                }
                .detail-box p { margin: 4px 0; font-weight: bold; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 30px 0; 
                }
                th { 
                    background-color: #f8fafc; 
                    text-align: left; 
                    padding: 12px; 
                    font-size: 10px; 
                    text-transform: uppercase; 
                    color: #64748b;
                    border-bottom: 2px solid #e2e8f0;
                }
                td { 
                    padding: 12px; 
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                .text-right { text-align: right; }
                .totals { 
                    margin-left: auto; 
                    width: 300px;
                    margin-top: 20px;
                }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 8px 0;
                }
                .total-final { 
                    border-top: 2px solid #0891b2;
                    margin-top: 10px;
                    padding-top: 10px;
                    font-size: 22px;
                    font-weight: 900;
                    color: #0891b2;
                }
                .footer { 
                    margin-top: 100px; 
                    border-top: 1px solid #e2e8f0; 
                    padding-top: 20px; 
                    font-size: 10px; 
                    color: #94a3b8;
                    text-align: center; 
                }
                @media print {
                    @page { margin: 2cm; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${htmlContent}
            <div class="footer">
                Documento gerado eletronicamente por Construsys ERP - ${new Date().toLocaleString('pt-BR')}
            </div>
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
