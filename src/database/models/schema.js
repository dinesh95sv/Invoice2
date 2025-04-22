import { appSchema, tableSchema } from '@watermelondb/Schema';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'sku', type: 'string' },
        { name: 'in_stock', type: 'boolean' },
        { name: 'factory_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'customers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'company', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'factories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'contact_person', type: 'string', isOptional: true },
        { name: 'contact_number', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'invoices',
      columns: [
        { name: 'invoice_number', type: 'string' },
        { name: 'customer_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number' },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'status', type: 'string' }, // draft, sent, paid, overdue
        { name: 'total_amount', type: 'number' },
        { name: 'tax_amount', type: 'number', isOptional: true },
        { name: 'discount_amount', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'invoice_items',
      columns: [
        { name: 'invoice_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'unit_price', type: 'number' },
        { name: 'total_price', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
});

// This is needed for Watermelon to work
export const migrations = [];