import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TbChevronLeft, TbTruckDelivery, TbBuildingStore } from 'react-icons/tb'
import { fetchSuppliers, fetchSupplierProducts, addInventoryBatch, createTransaction } from '../../script/network'
import { getToken } from '../../script/utils'
import type { SupplierResponse, SupplierProductResponse } from '../../script/objects'
import ConfirmModal from '../ConfirmModal'

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(17, 24, 39, 0.6); /* Darker overlay */
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
`

const ModalCard = styled.div`
  width: 100%; max-width: 600px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex; flex-direction: column;
  max-height: 90vh;
`

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
  background-color: #ffffff;
`

const Title = styled.h2`
  font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;
  display: flex; align-items: center; gap: 0.75rem;
`

const Content = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 1.5rem;
  background-color: #f9fafb;
`

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem; font-weight: 500; color: #374151;
`

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
  }
`

const StyledInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const CostSummary = styled.div`
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 1rem;
  border-radius: 8px;
  display: flex; justify-content: space-between; align-items: center;
`

const TotalCostLabel = styled.span`
  color: #1e40af; font-size: 0.875rem; font-weight: 500;
`

const TotalCostValue = styled.span`
  font-size: 1.25rem; font-weight: 700; color: #1e40af;
`

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 0.75rem;
  background-color: #ffffff;
`

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; gap: 0.5rem;
  
  background-color: ${props => props.primary ? '#4f46e5' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: ${props => props.primary ? '1px solid transparent' : '1px solid #d1d5db'};
  box-shadow: ${props => props.primary ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    background-color: ${props => props.primary ? '#4338ca' : '#f9fafb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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
  const [salePrice, setSalePrice] = useState<number>(0);
  
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
    if (prod) setSalePrice(prod.price);
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !selectedSupplierId) return;

    const token = await getToken();
    if (!token) return;

    try {
      const purchasePrice = selectedProduct.supplier_price || 0;
      await addInventoryBatch(token, {
        ProductID: selectedProduct.ID,
        purchase_price: purchasePrice,
        sale_price: salePrice,
        quantity: quantity,
      });

      await createTransaction(token, {
        TransactionType: 'Purchase',
        payment_type: 'paid',
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
              <StyledSelect onChange={handleSupplierChange} value={selectedSupplierId || ''}>
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(s => <option key={s.ID} value={s.ID}>{s.Name}</option>)}
              </StyledSelect>
            </FormGroup>

            <FormGroup>
              <Label>Select Product</Label>
              <StyledSelect onChange={handleProductChange} disabled={!selectedSupplierId} value={selectedProduct?.ID || ''}>
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.ID} value={p.ID}>
                    {p.name} (Cost: ${p.supplier_price})
                  </option>
                ))}
              </StyledSelect>
            </FormGroup>

            {selectedProduct && (
              <>
                <GridRow>
                  <FormGroup>
                    <Label>Quantity Received</Label>
                    <StyledInput 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={e => setQuantity(parseInt(e.target.value))} 
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Public Selling Price ($)</Label>
                    <StyledInput 
                      type="number" 
                      step="0.01" 
                      value={salePrice} 
                      onChange={e => setSalePrice(parseFloat(e.target.value))} 
                    />
                  </FormGroup>
                </GridRow>
                
                <CostSummary>
                  <TotalCostLabel>Total Cost (to Supplier)</TotalCostLabel>
                  <TotalCostValue>${totalCost.toFixed(2)}</TotalCostValue>
                </CostSummary>
              </>
            )}
          </Content>
          <Footer>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary disabled={!selectedProduct} onClick={() => setIsConfirmOpen(true)}>
              Confirm Purchase
            </Button>
          </Footer>
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