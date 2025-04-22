# Project Structure
src/
  ├── components/
  │   ├── CustomerForm.js
  │   ├── FactoryForm.js
  │   ├── InvoiceForm.js
  │   ├── ProductForm.js
  │   └── common/
  │       ├── Button.js
  │       ├── Card.js
  │       ├── Input.js
  │       ├── List.js
  │       └── SwipeableRow.js
  ├── database/
  │   ├── index.js
  │   ├── adapters.js
  │   └── models/
  │       ├── Customer.js
  │       ├── Factory.js
  │       ├── Invoice.js
  │       ├── InvoiceItem.js
  │       ├── Product.js
  │       ├── schema.js
  │       └── index.js
  ├── navigation/
  │   ├── AppNavigator.js
  │   └── TabNavigator.js
  ├── screens/
  │   ├── customers/
  │   │   ├── CustomerDetailScreen.js
  │   │   ├── CustomerListScreen.js
  │   │   └── AddCustomerScreen.js
  │   ├── factories/
  │   │   ├── FactoryDetailScreen.js
  │   │   ├── FactoryListScreen.js
  │   │   └── AddFactoryScreen.js
  │   ├── invoices/
  │   │   ├── CreateInvoiceScreen.js
  │   │   ├── InvoiceDetailScreen.js
  │   │   └── InvoiceListScreen.js
  │   └── products/
  │       ├── ProductDetailScreen.js
  │       ├── ProductListScreen.js
  │       └── AddProductScreen.js
  ├── services/
  │   └── pdfService.js
  ├── styles/
  │   ├── colors.js
  │   ├── fonts.js
  │   └── spacing.js
  └── utils/
      ├── dateUtils.js
      ├── formatUtils.js
      └── validators.js
App.js
babel.config.js
metro.config.js
package.json