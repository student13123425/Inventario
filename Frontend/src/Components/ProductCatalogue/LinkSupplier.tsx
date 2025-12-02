import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TbChevronLeft, TbLink } from 'react-icons/tb'
import { fetchSuppliers, linkSupplierProduct, updateSupplierPricing } from '../../script/network'
import { getToken } from '../../script/utils'
import type { ProductResponse, SupplierResponse } from '../../script/objects'
import LoadingCard from '../../Pages/Private/LoadingCard'

interface LinkSupplierProps {
  item: ProductResponse
  setIsNewLink: (value: boolean) => void
  onLinkSupplier: () => void
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: #f9fafb;
  display: flex;
  justify-content: center;
`

const Card = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: fit-content;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  &:focus { outline: none; border-color: #4f46e5; ring: 3px rgba(79,70,229,0.1); }
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  &:focus { outline: none; border-color: #4f46e5; ring: 3px rgba(79,70,229,0.1); }
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: ${p => p.primary ? 'none' : '1px solid #d1d5db'};
  background: ${p => p.primary ? '#4f46e5' : 'white'};
  color: ${p => p.primary ? 'white' : '#374151'};
  
  &:hover {
    background: ${p => p.primary ? '#4338ca' : '#f9fafb'};
  }
`

export default function LinkSupplier({ item, setIsNewLink, onLinkSupplier }: LinkSupplierProps) {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | string>("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (token) {
        const res = await fetchSuppliers(token);
        if (res.success) setSuppliers(res.suppliers);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async () => {
    const token = await getToken();
    if (!token || !selectedSupplierId) return;

    try {
      await linkSupplierProduct(token, {
        supplier_id: Number(selectedSupplierId),
        product_id: item.ID,
        supplier_price: Number(price),
        supplier_sku: sku,
        is_active: true
      });
      
      await updateSupplierPricing(token, Number(selectedSupplierId), item.ID, {
        supplier_price: Number(price),
        supplier_sku: sku,
        is_active: true
      });

      onLinkSupplier();
    } catch (error) {
      console.error("Failed to link", error);
    }
  };

  if (isLoading) return <LoadingCard msg="Loading suppliers..." />;

  return (
    <Container>
      <Card>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Title>Link Supplier</Title>
          <Button onClick={() => setIsNewLink(false)}><TbChevronLeft/> Cancel</Button>
        </div>

        <FormGroup>
          <Label>Select Supplier</Label>
          <Select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
            <option value="">-- Choose Supplier --</option>
            {suppliers.map(s => (
              <option key={s.ID} value={s.ID}>{s.Name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Supplier Price ($)</Label>
          <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
        </FormGroup>

        <FormGroup>
          <Label>Supplier SKU (Optional)</Label>
          <Input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="XYZ-987" />
        </FormGroup>

        <Actions>
          <Button onClick={() => setIsNewLink(false)}>Cancel</Button>
          <Button primary onClick={handleSubmit} disabled={!selectedSupplierId || !price}>
            <TbLink /> Link Supplier
          </Button>
        </Actions>
      </Card>
    </Container>
  );
}