import { previewInvoicePDF } from "../../services/pdfService";

// src/screens/invoices/CreateInvoiceScreen.js (continuation)
const CreateInvoiceScreen = ({ route, navigation }) => {
  const editingInvoice = route.params?.invoice;
  const isEditing = !!editingInvoice;
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceNumber: '',
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'PENDING',
    items: [],
    notes: '',
  });
  
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Calculate total amount whenever items change
    const total = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    setTotalAmount(total);
  }, [formData.items]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load customers
      const customersCollection = database.get('customers');
      const customerRecords = await customersCollection.query().fetch();
      setCustomers(customerRecords);
      
      // Load products
      const productsCollection = database.get('products');
      const productRecords = await productsCollection.query().fetch();
      setProducts(productRecords);
      
      if (isEditing) {
        await loadExistingInvoiceData();
      } else {
        // Generate new invoice number
        const newInvoiceNumber = await generateInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoiceNumber: newInvoiceNumber
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingInvoiceData = async () => {
    try {
      // Fetch invoice items
      const invoiceItems = await editingInvoice.items.fetch();
      
      // Prepare items data with product information
      const itemsData = await Promise.all(
        invoiceItems.map(async (item) => {
          const product = await item.product.fetch();
          return {
            id: item.id,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description || ''
          };
        })
      );
      
      // Get customer
      const customer = await editingInvoice.customer.fetch();
      setCustomer(customer);
      const factory = await editingInvoice.factory.fetch();
      setFactory(factory);
      
      // Update form data
      setFormData({
        customerId: customer.id,
        factoryId: factory.id,
        invoiceNumber: editingInvoice.invoiceNumber,
        date: new Date(editingInvoice.date),
        dueDate: editingInvoice.dueDate ? new Date(editingInvoice.dueDate) : null,
        status: editingInvoice.status,
        items: itemsData,
        notes: editingInvoice.notes || '',
      });
    } catch (error) {
      console.error('Error loading invoice data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    }
  };

  const generateInvoiceNumber = async () => {
    
    const dateInfo = formData.date;
    const factoryCode = factory.code || 'ADH';
    const year = dateInfo.getFullYear().padStart(4, '0');
    const month = dateInfo.getMonth() + 1;
    const monthPadded = month.padStart(2, '0')
    const date = dateInfo.getDate().padStart(2, '0');
    try {
      // Get the latest invoice to generate a new invoice number
      
      const invoicesCollection = database.get('invoices');
      const latestInvoices = await invoicesCollection
        .query(Q.where('invoiceNumber', Q.like(`INV-${factoryCode}${year}${monthPadded}%`)),Q.sortBy('created_at', Q.desc))
        .fetch();
      if (latestInvoices.length > 0) {
        const lastInvoiceNumber = latestInvoices[0].invoiceNumber;
        // Extract numeric part and increment
        const invoiceNumPart = parseInt(lastInvoiceNumber.substr(lastInvoiceNumber.length - 3), 10)
        return `INV-${factoryCode}${year}${monthPadded}${date}${(invoiceNumPart + 1 ).padStart(3, '0')}`;
      } else {
        // First invoice
        return `INV-${factoryCode}${year}${monthPadded}${date}001`;
      }
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now()}`;
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = (item) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  const handleUpdateItem = (index, updatedItem) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = updatedItem;
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const validateForm = () => {
    if (!formData.customerId) {
      Alert.alert('Error', 'Please select a customer');
      return false;
    }
    
    if (!formData.invoiceNumber) {
      Alert.alert('Error', 'Invoice number is required');
      return false;
    }
    
    if (!formData.date) {
      Alert.alert('Error', 'Invoice date is required');
      return false;
    }
    
    if (formData.items.length === 0) {
      Alert.alert('Error', 'At least one item is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      await database.write(async () => {
        if (isEditing) {
          // Update existing invoice
          await editingInvoice.update((invoice) => {
            invoice.invoiceNumber = formData.invoiceNumber;
            invoice.date = formData.date.toISOString();
            invoice.dueDate = formData.dueDate ? formData.dueDate.toISOString() : null;
            invoice.status = formData.status;
            invoice.totalAmount = totalAmount;
            invoice.notes = formData.notes;
          });
          
          // Update invoice customer if changed
          if (editingInvoice.customer.id !== formData.customerId) {
            await editingInvoice.update((invoice) => {
              invoice.customer.set(formData.customerId);
            });
          }
          if (editingInvoice.factory.id !== formData.factoryId) {
            await editingInvoice.update((invoice) => {
              invoice.factory.set(formData.factoryId);
            });
          }
          
          // Fetch existing items to compare with new items
          const existingItems = await editingInvoice.items.fetch();
          
          // Update, delete or create items
          for (const existingItem of existingItems) {
            const matchingItem = formData.items.find(item => item.id === existingItem.id);
            if (!matchingItem) {
              // Item was deleted
              await existingItem.markAsDeleted();
            }
          }
          
          for (const item of formData.items) {
            if (item.id) {
              // Update existing item
              const invoiceItemToUpdate = await database.get('invoice_items').find(item.id);
              await invoiceItemToUpdate.update((invoiceItem) => {
                invoiceItem.product.set(item.productId);
                invoiceItem.quantity = item.quantity;
                invoiceItem.unitPrice = item.unitPrice;
                invoiceItem.description = item.description || '';
              });
            } else {
              // Create new item
              await database.get('invoice_items').create((invoiceItem) => {
                invoiceItem.invoice.set(editingInvoice.id);
                invoiceItem.product.set(item.productId);
                invoiceItem.quantity = item.quantity;
                invoiceItem.unitPrice = item.unitPrice;
                invoiceItem.description = item.description || '';
              });
            }
          }
          
        } else {
          // Create new invoice
          const invoicesCollection = database.get('invoices');
          const newInvoice = await invoicesCollection.create((invoice) => {
            invoice.customer.set(formData.customerId);
            invoice.factory.set(formData.factoryId);
            invoice.invoiceNumber = formData.invoiceNumber;
            invoice.date = formData.date.toISOString();
            invoice.dueDate = formData.dueDate ? formData.dueDate.toISOString() : null;
            invoice.status = formData.status;
            invoice.totalAmount = totalAmount;
            invoice.notes = formData.notes;
          });
          
          // Create invoice items
          const invoiceItemsCollection = database.get('invoice_items');
          for (const item of formData.items) {
            await invoiceItemsCollection.create((invoiceItem) => {
              invoiceItem.invoice.set(newInvoice.id);
              invoiceItem.product.set(item.productId);
              invoiceItem.quantity = item.quantity;
              invoiceItem.unitPrice = item.unitPrice;
              invoiceItem.description = item.description || '';
            });
          }
        }
      });
      
      // Success message and navigate back
      Alert.alert(
        'Success',
        isEditing ? 'Invoice updated successfully' : 'Invoice created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <InvoiceForm
          formData={formData}
          onValueChange={handleFormChange}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          isEditing={isEditing}
        />
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>

        <Button
          title={isEditing ? 'Update Invoice' : 'Create Invoice'}
          onPress={handleSubmit}
          loading={saving}
          style={styles.submitButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          type="outline"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  formContainer: {
    padding: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  submitButton: {
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 12,
    marginBottom: 30,
  },
});

export default CreateInvoiceScreen;