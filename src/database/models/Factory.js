import { Model } from '@watermelondb/Model';
import { field, date, readonly, text, children } from '@watermelondb/decorators';

export class Factory extends Model {
  static table = 'factories';
  
  static associations = {
    products: { type: 'has_many', foreignKey: 'factory_id' }
  };

  @text('name') name;
  @text('location') location;
  @text('contact_person') contactPerson;
  @text('contact_number') contactNumber;
  @text('email') email;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @children('products') products;
}