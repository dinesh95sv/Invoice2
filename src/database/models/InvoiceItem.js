import { Model } from '@watermelondb/Model';
import { field, date, relation, readonly, text } from '@watermelondb/decorators';

export class InvoiceItem extends Model {
  static table = 'invoice_items';
  
  static associations = {
    invoices: { type: 'belongs_to', key: 'invoice_id' },
    products: { type: 'belongs_to', key: 'product_id' }
  };

  @field('invoice_id') invoiceId;
  @field('product_id') productId;
  @field('quantity') quantity;
  @field('unit_price') unitPrice;
  @field('total_price') totalPrice;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('invoices', 'invoice_id') invoice;
  @relation('products', 'product_id') product;
}