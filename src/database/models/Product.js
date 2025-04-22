import { Model } from '@watermelondb/Model';
import { field, date, relation, readonly, text, children } from '@watermelondb/decorators';

export class Product extends Model {
  static table = 'products';
  
  static associations = {
    factories: { type: 'belongs_to', key: 'factory_id' },
    invoice_items: { type: 'has_many', foreignKey: 'product_id' }
  };

  @text('name') name;
  @text('description') description;
  @field('price') price;
  @text('sku') sku;
  @field('in_stock') inStock;
  @field('factory_id') factoryId;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('factories', 'factory_id') factory;
  @children('invoice_items') invoiceItems;
}