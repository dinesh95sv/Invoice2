import { Model } from '@watermelondb/Model';
import { field, date, readonly, text, children } from '@watermelondb/decorators';

export class Customer extends Model {
  static table = 'customers';
  
  static associations = {
    invoices: { type: 'has_many', foreignKey: 'customer_id' }
  };

  @text('name') name;
  @text('email') email;
  @text('phone') phone;
  @text('address') address;
  @text('company') company;
  @text('notes') notes;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @children('invoices') invoices;
}