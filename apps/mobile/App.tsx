import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { buildEmptyEstimate } from '@smeta/core';
import { Estimate, LineItem } from '@smeta/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  
  // Catalog State
  const [catalog, setCatalog] = useState([
    { id: 'c1', name: 'Штукатурка стен', unit: 'м²', price: 450 },
    { id: 'c2', name: 'Грунтовка стен', unit: 'м²', price: 50 },
    { id: 'c3', name: 'Шпаклевка стен', unit: 'м²', price: 280 },
    { id: 'c4', name: 'Покраска стен', unit: 'м²', price: 180 },
    { id: 'c5', name: 'Укладка плитки', unit: 'м²', price: 1200 },
  ]);

  // Bottom Sheet State
  const [isEditorVisible, setIsBottomSheetVisible] = useState(false);
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');

  // Catalog Editor State
  const [isCatalogEditorVisible, setIsCatalogEditorVisible] = useState(false);
  const [editingCatalogItem, setEditingCatalogItem] = useState<any>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  const handleGenerate = async () => {
    if (description.length < 10) return;
    setLoading(true);
    try {
      // Simulate API call with multi-agent logic results
      const dummyUserId = 'user-123';
      const newEstimate = buildEmptyEstimate(dummyUserId);
      
      // Mock generated items for "штукатурка стен 109 м2" or similar
      const mockItems: LineItem[] = [
        {
          id: '1',
          parentId: null,
          name: 'Штукатурка стен по маякам',
          unit: 'м²',
          quantity: 109,
          unitPrice: 450,
          sortOrder: 1,
        },
        {
          id: '2',
          parentId: null,
          name: 'Грунтовка стен',
          unit: 'м²',
          quantity: 109,
          unitPrice: 50,
          sortOrder: 2,
        }
      ];
      
      newEstimate.lineItems = mockItems;
      newEstimate.name = 'Смета на штукатурку';
      
      // Calculate totals
      const subtotal = mockItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      newEstimate.subtotal = subtotal;
      newEstimate.total = subtotal * (1 + newEstimate.vatRate);
      
      setEstimate(newEstimate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (item: LineItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.unitPrice.toString());
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit);
    setIsBottomSheetVisible(true);
  };

  const saveEdit = () => {
    if (!editingItem || !estimate) return;

    const updatedItems = estimate.lineItems.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editName,
          unitPrice: parseFloat(editPrice) || 0,
          quantity: parseFloat(editQuantity) || 0,
          unit: editUnit,
        };
      }
      return item;
    });

    const subtotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    
    setEstimate({
      ...estimate,
      lineItems: updatedItems,
      subtotal,
      total: subtotal * (1 + estimate.vatRate),
      updatedAt: Date.now(),
    });

    setIsBottomSheetVisible(false);
    setEditingItem(null);
  };

  const addManualItem = () => {
    if (!estimate) return;
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      parentId: null,
      name: 'Новая позиция',
      unit: 'шт',
      quantity: 1,
      unitPrice: 0,
      sortOrder: estimate.lineItems.length + 1,
    };
    setEstimate({
      ...estimate,
      lineItems: [...estimate.lineItems, newItem],
    });
    openEditor(newItem);
  };

  const addFromCatalog = (catalogItem: any) => {
    if (!estimate) return;
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      parentId: null,
      name: catalogItem.name,
      unit: catalogItem.unit,
      quantity: 1,
      unitPrice: catalogItem.price,
      sortOrder: estimate.lineItems.length + 1,
    };
    setEstimate({
      ...estimate,
      lineItems: [...estimate.lineItems, newItem],
    });
    setIsCatalogVisible(false);
    addNotification('success', `Добавлено: ${catalogItem.name}`);
  };

  // Mock notification
  const addNotification = (type: string, msg: string) => {
    console.log(`[${type}] ${msg}`);
  };

  const updateCatalogPrice = (id: string, newPrice: string) => {
    setCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
    ));
  };

  const removeFromCatalog = (id: string) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
  };

  const addNewToCatalog = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Новая работа/материал',
      unit: 'шт',
      price: 0,
    };
    setCatalog(prev => [newItem, ...prev]);
  };

  const updateCatalogItemName = (id: string, newName: string) => {
    setCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, name: newName } : item
    ));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Smeta Mobile</Text>
          <Text style={styles.subtitle}>Профессиональный редактор смет</Text>
        </View>

        {!estimate && (
          <View>
            <View style={styles.inputCard}>
              <Text style={styles.label}>Описание работ для AI</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Например: Ремонт кухни 15м2, укладка плитки..."
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleGenerate}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Генерация...' : '🚀 Сгенерировать с AI'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.outlineButton, { marginTop: 12 }]} 
              onPress={() => setIsCatalogEditorVisible(true)}
            >
              <Text style={styles.outlineButtonText}>⚙️ Редактор цен каталога</Text>
            </TouchableOpacity>
          </View>
        )}

        {estimate && (
          <View style={styles.estimateContainer}>
            <View style={styles.estimateHeader}>
              <Text style={styles.estimateTitle}>{estimate.name}</Text>
              <TouchableOpacity onPress={() => setEstimate(null)}>
                <Text style={styles.resetText}>Сбросить</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Позиций:</Text>
                <Text style={styles.summaryValue}>{estimate.lineItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Итого:</Text>
                <Text style={styles.totalValue}>{formatCurrency(estimate.total)}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.smallButton} onPress={addManualItem}>
                <Text style={styles.smallButtonText}>+ Вручную</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#3b82f6' }]} onPress={() => setIsCatalogVisible(true)}>
                <Text style={styles.smallButtonText}>+ Из каталога</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Позиции сметы</Text>
            {estimate.lineItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.itemCard}
                onPress={() => openEditor(item)}
              >
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Editor Bottom Sheet */}
      <Modal
        visible={isEditorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBottomSheetVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsBottomSheetVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentContainer}
          >
            <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Редактирование позиции</Text>
              
              <View style={styles.form}>
                <Text style={styles.fieldLabel}>Наименование</Text>
                <TextInput
                  style={styles.formInput}
                  value={editName}
                  onChangeText={setEditName}
                />

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 2 }]}>
                    <Text style={styles.fieldLabel}>Цена за ед.</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.fieldLabel}>Ед. изм.</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editUnit}
                      onChangeText={setEditUnit}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Количество</Text>
                <TextInput
                  style={styles.formInput}
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                  <Text style={styles.saveButtonText}>Сохранить в смете</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.outlineButton, { marginTop: 8 }]} 
                  onPress={() => {
                    const id = Math.random().toString(36).substr(2, 9);
                    setCatalog(prev => [...prev, { id, name: editName, price: parseFloat(editPrice) || 0, unit: editUnit }]);
                    setIsBottomSheetVisible(false);
                  }}
                >
                  <Text style={styles.outlineButtonText}>💾 Сохранить в каталог цен</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setIsBottomSheetVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Catalog Selector Modal */}
      <Modal
        visible={isCatalogVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCatalogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { minHeight: SCREEN_HEIGHT * 0.7 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Выберите из каталога</Text>
            <ScrollView>
              {catalog.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.catalogCard} 
                  onPress={() => addFromCatalog(item)}
                >
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>{item.unit} — {formatCurrency(item.price)}</Text>
                  </View>
                  <Plus className="text-primary-500" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setIsCatalogVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Catalog Price Editor Modal */}
      <Modal
        visible={isCatalogEditorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCatalogEditorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { minHeight: SCREEN_HEIGHT * 0.9 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Ручной редактор цен</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addNewToCatalog}>
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск по каталогу..."
                value={catalogSearch}
                onChangeText={setCatalogSearch}
              />
            </View>

            <ScrollView style={{ flex: 1 }}>
              {catalog
                .filter(item => item.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                .map(item => (
                <View key={item.id} style={styles.priceEditorCard}>
                  <View style={styles.editorRow}>
                    <TextInput
                      style={styles.priceEditorName}
                      value={item.name}
                      onChangeText={(val) => updateCatalogItemName(item.id, val)}
                      placeholder="Наименование"
                    />
                    <TouchableOpacity onPress={() => removeFromCatalog(item.id)}>
                      <Text style={styles.deleteText}>Удалить</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceInputRow}>
                    <TextInput
                      style={styles.priceInput}
                      value={item.price.toString()}
                      onChangeText={(val) => updateCatalogPrice(item.id, val)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.priceInputUnit}>₽ / {item.unit}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: '#10b981', marginTop: 20 }]} 
              onPress={() => setIsCatalogEditorVisible(false)}
            >
              <Text style={styles.saveButtonText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  estimateContainer: {
    marginTop: 10,
  },
  estimateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  estimateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  resetText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: '#fb923c',
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    marginLeft: 5,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: '#64748b',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 10,
  },
  catalogCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceEditorCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  priceEditorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    width: 120,
  },
  priceInputUnit: {
    marginLeft: 10,
    color: '#64748b',
    fontSize: 14,
  },
  
  // Modal & Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    width: '100%',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
});
