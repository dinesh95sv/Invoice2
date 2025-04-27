import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

/**
 * Generate HTML content for invoice PDF
 * @param {Object} invoice - Invoice data object
 * @param {Object} customer - Customer data object
 * @param {Array} items - Array of invoice items with product details
 * @returns {String} HTML content for PDF
 */
export const generateInvoiceHTML = (invoice, factory, customer, items) => {
  const currentDate = new Date(invoice.date).toLocaleDateString();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';
  
  let itemsHTML = '';
  items.forEach((item, index) => {
    itemsHTML += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .company-details {
            text-align: right;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #007AFF;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .customer-details {
            width: 50%;
          }
          .invoice-info {
            width: 50%;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
            padding: 10px 8px;
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 5px;
          }
          .total-label {
            width: 150px;
            font-weight: bold;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #007AFF;
            margin-top: 10px;
          }
          .notes {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>${factory.name}</div>
            <div>${factory.gstin}</div>
            <div>${factory.address}</div>
            <div>Phone: ${factory.phone}</div>
            <div>Email: ${factory.email}</div>
          </div>
          <div class="company-details">
            <div style="font-size: 18px; font-weight: bold;">Invoice #${invoice.invoiceNumber}</div>
            <div>Status: ${invoice.status.toUpperCase()}</div>
            <div>Date: ${currentDate}</div>
            <div>Due Date: ${dueDate}</div>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="customer-details">
            <div style="font-weight: bold; margin-bottom: 10px;">Bill To:</div>
            <div>${customer.name}</div>
            <div>${customer.company || ''}</div>
            <div>${customer.address || ''}</div>
            <div>${customer.email || ''}</div>
            <div>${customer.phone || ''}</div>
          </div>
          <div class="invoice-info">
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 40%">Item</th>
              <th style="width: 15%">Quantity</th>
              <th style="width: 20%">Unit Price</th>
              <th style="width: 20%">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div>$${invoice.totalAmount.toFixed(2)}</div>
          </div>
          ${invoice.taxAmount ? `
            <div class="total-row">
              <div class="total-label">Tax:</div>
              <div>$${invoice.taxAmount.toFixed(2)}</div>
            </div>
          ` : ''}
          ${invoice.discountAmount ? `
            <div class="total-row">
              <div class="total-label">Discount:</div>
              <div>-$${invoice.discountAmount.toFixed(2)}</div>
            </div>
          ` : ''}
          <div class="total-row grand-total">
            <div class="total-label">TOTAL:</div>
            <div>$${calculateGrandTotal(invoice).toFixed(2)}</div>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="notes">
            <div style="font-weight: bold; margin-bottom: 5px;">Notes:</div>
            <div>${invoice.notes}</div>
          </div>
        ` : ''}
      </body>
    </html>
  `;
};

/**
 * Calculate grand total based on invoice data
 */
const calculateGrandTotal = (invoice) => {
  let total = invoice.totalAmount || 0;
  
  if (invoice.taxAmount) {
    total += invoice.taxAmount;
  }
  
  if (invoice.discountAmount) {
    total -= invoice.discountAmount;
  }
  
  return total;
};

/**
 * Generate PDF from invoice data and share it
 */
export const generateAndShareInvoicePDF = async (invoice, factory, customer, items) => {
  try {
    const htmlContent = generateInvoiceHTML(invoice, factory, customer, items);
    
    // Create PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });
    
    // Generate a more user-friendly filename
    const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
    const newUri = FileSystem.documentDirectory + fileName;
    
    // Copy the file to a directory with a better name
    await FileSystem.copyAsync({
      from: uri,
      to: newUri
    });
    
    // Share the PDF
    await shareAsync(newUri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share Invoice #${invoice.invoiceNumber}`
    });
    
    return { success: true, uri: newUri };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Preview PDF for invoice
 */
export const previewInvoicePDF = async (invoice, factory, customer, items) => {
  try {
    const htmlContent = generateInvoiceHTML(invoice, factory, customer, items);
    await Print.printAsync({
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Error previewing PDF:', error);
    return { success: false, error: error.message };
  }
};