import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TbChevronLeft, TbTruckDelivery, TbBuildingStore } from 'react-icons/tb'
import { fetchSuppliers, fetchSupplierProducts, addInventoryBatch, createTransaction } from '../../script/network'
import { getToken } from '../../script/utils'
import type { SupplierResponse, SupplierProductResponse } from '../../script/objects'
import ConfirmModal from '../ConfirmModal'

// Using same styled components patterns as your Design System
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  font-family: 'Inter', sans-serif;
`

const ModalCard = styled.div`
  width: 90%; max-width: 600px;
  background-color: #ffffff; border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;
`

const Header = styled.div`
  padding: 1.5rem 2rem; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
  background-color: #f9fafb;
`

const Title = styled.h2`
  font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;
  display: flex; align-items: center; gap: 0.75rem;
`

const Content = styled.div`
  padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem; font-weight: 500; color: #374151;
`

const Select = styled.select`
  padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 1rem; color: #111827; background-color: white;
  &:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
`

const Input = styled.input`
  padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 1rem; color: #111827;
  &:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
`

const CostSummary = styled.div`
  background-color: #f3f4f6; padding: 1rem; border-radius: 8px;
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem; border: 1px solid #e5e7eb;
`

const TotalCost = styled.span`
  font-size: 1.25rem; font-weight: 700; color: #4f46e5;
`

const ButtonGroup = styled.div`
  padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 1rem; background-color: #f9fafb;
`

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 1rem;
  cursor: pointer; transition: all 0.2s ease;
  background-color: ${props => props.primary ? '#4f46e5' : 'white'};
  color: ${props => props.primary ? 'white' : '#374151'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};

  &:hover {
    background-color: ${props => props.primary ? '#4338ca' : '#f9fafb'};
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`

interface PurchaseStockProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseStock({ onClose, onSuccess }: PurchaseStockProps) {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [products, setProducts] = useState<SupplierProductResponse[]>([]);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProductResponse | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(0); // Price we sell to public
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      const token = await getToken();
      if (token) {
        const res = await fetchSuppliers(token);
        if (res.success) setSuppliers(res.suppliers);
      }
    }
    loadSuppliers();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedSupplierId) {
        setProducts([]);
        return;
      }
      const token = await getToken();
      if (token) {
        const res = await fetchSupplierProducts(token, selectedSupplierId);
        if (res.success) setProducts(res.products);
      }
    }
    loadProducts();
  }, [selectedSupplierId]);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSupplierId(Number(e.target.value));
    setSelectedProduct(null);
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = products.find(p => p.ID === Number(e.target.value));
    setSelectedProduct(prod || null);
    if (prod) setSalePrice(prod.price); // Default to current product price
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !selectedSupplierId) return;

    const token = await getToken();
    if (!token) return;

    try {
      // 1. Add Inventory Batch
      const purchasePrice = selectedProduct.supplier_price || 0;
      await addInventoryBatch(token, {
        ProductID: selectedProduct.ID,
        purchase_price: purchasePrice,
        sale_price: salePrice,
        quantity: quantity,
      });

      // 2. Create Financial Transaction (Stock Out of money, Stock In of goods)
      await createTransaction(token, {
        TransactionType: 'Purchase',
        payment_type: 'paid', // Assuming immediate payment for this MVP
        amount: purchasePrice * quantity,
        SupplierID: selectedSupplierId,
        TransactionDate: new Date().toISOString()
      });

      setIsConfirmOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Purchase failed", error);
      alert("Failed to process purchase");
    }
  }

  const totalCost = (selectedProduct?.supplier_price || 0) * quantity;

  return (
    <>
      <Overlay>
        <ModalCard>
          <Header>
            <Title><TbTruckDelivery size={24}/> Receive Stock</Title>
            <Button onClick={onClose}><TbChevronLeft /> Cancel</Button>
          </Header>
          <Content>
            <FormGroup>
              <Label>Select Supplier</Label>
              <Select onChange={handleSupplierChange} value={selectedSupplierId || ''}>
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(s => <option key={s.ID} value={s.ID}>{s.Name}</option>)}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Select Product (Linked to Supplier)</Label>
              <Select onChange={handleProductChange} disabled={!selectedSupplierId} value={selectedProduct?.ID || ''}>
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.ID} value={p.ID}>
                    {p.name} (Cost: ${p.supplier_price})
                  </option>
                ))}
              </Select>
            </FormGroup>

            {selectedProduct && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup>
                    <Label>Quantity Received</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={e => setQuantity(parseInt(e.target.value))} 
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Public Selling Price ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={salePrice} 
                      onChange={e => setSalePrice(parseFloat(e.target.value))} 
                    />
                  </FormGroup>
                </div>
                
                <CostSummary>
                  <span style={{color: '#374151'}}>Total Purchase Cost:</span>
                  <TotalCost>${totalCost.toFixed(2)}</TotalCost>
                </CostSummary>
              </>
            )}
          </Content>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary disabled={!selectedProduct} onClick={() => setIsConfirmOpen(true)}>
              Confirm Purchase
            </Button>
          </ButtonGroup>
        </ModalCard>
      </Overlay>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSubmit}
        onCancel={() => setIsConfirmOpen(false)}
        title="Confirm Purchase Order"
        content={`You are about to purchase ${quantity} units of ${selectedProduct?.name}. Total cost is $${totalCost.toFixed(2)}. This will update your inventory immediately.`}
        confirmText="Confirm & Add Stock"
        cancelText="Review"
        icon={TbBuildingStore}
      />
    </>
  )
}