import { Model } from '@watermelondb/Model';
import { field, date, relation, readonly, text, children } from '@watermelondb/decorators';

export class Invoice extends Model {
  static table = 'invoices';
  
  static associations = {
    customers: { type: 'belongs_to', key: 'customer_id' },
    invoice_items: { type: 'has_many', foreignKey: 'invoice_id' }
  };

  @text('invoice_number') invoiceNumber;
  @field('customer_id') customerId;
  @date('date') date;
  @date('due_date') dueDate;
  @text('status') status;
  @field('total_amount') totalAmount;
  @field('tax_amount') taxAmount;
  @field('discount_amount') discountAmount;
  @text('notes') notes;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('customers', 'customer_id') customer;
  @children('invoice_items') items;
}