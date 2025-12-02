import React from 'react'
import type { ProductSupplierResponse, ProductResponse } from '../../script/objects';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { TbUnlink, TbTruckDelivery } from 'react-icons/tb';
import { unlinkSupplierProduct } from '../../script/network';
import { getToken } from '../../script/utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #4f46e5;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dbeafe;
    border-color: #bfdbfe;
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const SupplierCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: #4f46e5;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Name = styled.span`
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
`

const Meta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
`

const Price = styled.span`
  color: #059669;
  font-weight: 500;
`

const UnlinkButton = styled.button`
  padding: 0.5rem;
  color: #9ca3af;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #dc2626;
    background: #fef2f2;
    border-color: #fecaca;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  gap: 1rem;
`

interface Props {
  suppliers: ProductSupplierResponse[];
  product: ProductResponse;
  setIsNewLink: (v: boolean) => void;
  ForceReload: () => Promise<void>;
}

export default function SupplierLinkerComponent(props: Props) {
  const handleUnlink = async (supplierId: number) => {
    if (!window.confirm("Unlink supplier?")) return;
    const token = await getToken();
    if (token) {
      await unlinkSupplierProduct(token, supplierId, props.product.ID);
      await props.ForceReload();
    }
  };

  return (
    <Container>
      <Header>
        <SectionTitle>Sourcing Suppliers</SectionTitle>
        <AddButton onClick={() => props.setIsNewLink(true)}>
          <FaPlus size={12} /> Link Supplier
        </AddButton>
      </Header>

      {props.suppliers.length === 0 ? (
        <EmptyState>
          <TbTruckDelivery size={40} />
          <span>No suppliers linked to this product yet.</span>
        </EmptyState>
      ) : (
        <List>
          {props.suppliers.map(s => (
            <SupplierCard key={s.ID}>
              <Info>
                <Name>{s.Name}</Name>
                <Meta>
                  <Price>${s.supplier_price}</Price>
                  {s.lead_time_days && <span>Lead: {s.lead_time_days} days</span>}
                  {s.min_order_quantity && <span>Min Qty: {s.min_order_quantity}</span>}
                </Meta>
              </Info>
              <UnlinkButton onClick={() => handleUnlink(s.ID)} title="Unlink Supplier">
                <TbUnlink size={18} />
              </UnlinkButton>
            </SupplierCard>
          ))}
        </List>
      )}
    </Container>
  )
}