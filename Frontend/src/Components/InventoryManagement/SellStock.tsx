import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TbShoppingCart, TbChevronLeft, TbScan } from 'react-icons/tb'
import { fetchProducts, reduceInventory, createTransaction } from '../../script/network'
import { getToken } from '../../script/utils'
import type { ProductResponse } from '../../script/objects'
import ConfirmModal from '../ConfirmModal'

// Shared styles for consistency
const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  font-family: 'Inter', sans-serif;
  padding: 1rem; box-sizing: border-box;
`

const ModalCard = styled.div`
  width: 100%; max-width: 600px; background-color: white; border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column;
`

const Header = styled.div`
  padding: 1.5rem; border-bottom: 1px solid #e5e7eb; background-color: white;
  display: flex; justify-content: space-between; align-items: center;
`

const Title = styled.h2`
  font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;
  display: flex; align-items: center; gap: 0.75rem;
`

const Content = styled.div`
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;
  background-color: #f9fafb;
`

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem; font-weight: 500; color: #374151;
`

const StyledSelect = styled.select`
  width: 100%; padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #111827;
  &:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
`

const StyledInput = styled.input`
  width: 100%; padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #111827;
  &:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  box-sizing: border-box;
`

const SearchWrapper = styled.div`
  position: relative; display: flex; align-items: center;
`

const SummaryBox = styled.div`
  background-color: #ecfdf5; border: 1px solid #a7f3d0;
  padding: 1.5rem; border-radius: 8px; text-align: center;
`

const TotalPrice = styled.div`
  font-size: 2rem; font-weight: 800; color: #059669;
`

const Footer = styled.div`
  padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 0.75rem; background-color: white;
`

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s ease;
  background-color: ${props => props.primary ? '#4f46e5' : 'white'};
  color: ${props => props.primary ? 'white' : '#374151'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  box-shadow: ${props => props.primary ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    background-color: ${props => props.primary ? '#4338ca' : '#f9fafb'};
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`

interface SellStockProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SellStock({ onClose, onSuccess }: SellStockProps) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      if (token) {
        const res = await fetchProducts(token);
        if (res.success) setProducts(res.products);
      }
    }
    loadData();
  }, []);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = products.find(p => p.ID === Number(e.target.value));
    setSelectedProduct(prod || null);
  }

  const handleSale = async () => {
    if (!selectedProduct) return;
    const token = await getToken();
    if (!token) return;

    try {
      await reduceInventory(token, {
        productId: selectedProduct.ID,
        quantity: quantity
      });

      await createTransaction(token, {
        TransactionType: 'Sale',
        payment_type: 'paid',
        amount: selectedProduct.price * quantity,
        TransactionDate: new Date().toISOString(),
        CustomerID: 1 
      });

      setIsConfirmOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Sale failed. Check stock levels.");
    }
  }

  const totalPrice = (selectedProduct?.price || 0) * quantity;
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.product_bar_code.includes(searchTerm)
  );

  return (
    <>
      <Overlay>
        <ModalCard>
          <Header>
            <Title><TbShoppingCart size={24}/> Register Public Sale</Title>
            <Button onClick={onClose}><TbChevronLeft /> Back</Button>
          </Header>
          <Content>
             <FormGroup>
              <Label>Search Product (Name or Barcode)</Label>
              <SearchWrapper>
                <TbScan style={{position: 'absolute', left: '10px', color: '#6b7280', pointerEvents: 'none'}} />
                <StyledInput 
                  placeholder="Scan or type..." 
                  style={{paddingLeft: '35px'}}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </SearchWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Select Product</Label>
              <StyledSelect onChange={handleProductSelect} value={selectedProduct?.ID || ''}>
                <option value="">-- Select from list --</option>
                {filteredProducts.map(p => (
                  <option key={p.ID} value={p.ID}>
                    {p.name} (${p.price})
                  </option>
                ))}
              </StyledSelect>
            </FormGroup>

            <FormGroup>
              <Label>Quantity Sold</Label>
              <StyledInput 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value))} 
              />
            </FormGroup>

            {selectedProduct && (
              <SummaryBox>
                <div style={{marginBottom: '0.5rem', color: '#065f46', fontSize: '0.875rem', fontWeight: 600}}>TOTAL REVENUE</div>
                <TotalPrice>${totalPrice.toFixed(2)}</TotalPrice>
              </SummaryBox>
            )}
          </Content>
          <Footer>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary disabled={!selectedProduct} onClick={() => setIsConfirmOpen(true)}>
              Complete Sale
            </Button>
          </Footer>
        </ModalCard>
      </Overlay>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSale}
        onCancel={() => setIsConfirmOpen(false)}
        title="Confirm Sale"
        content={`Confirm sale of ${quantity}x ${selectedProduct?.name} to public? Revenue: $${totalPrice.toFixed(2)}`}
        confirmText="Confirm Sale"
        cancelText="Cancel"
        icon={TbShoppingCart}
        confirmColor="success"
      />
    </>
  )
}