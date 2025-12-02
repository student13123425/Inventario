import React, { useState } from 'react'
import type { ProductSupplierResponse, ProductResponse } from '../../script/objects';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { TbUnlink, TbTruckDelivery } from 'react-icons/tb';
import { MdEdit } from 'react-icons/md';
import { unlinkSupplierProduct } from '../../script/network';
import { getToken } from '../../script/utils';
import ConfirmModal from '../ConfirmModal';

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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`

const IconButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;  
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
`

const EditBtn = styled(IconButton)`
  color: #4f46e5;
  &:hover {
    background-color: #e0e7ff;
    border-color: #4f46e5;
  }
`

const UnlinkBtn = styled(IconButton)`
  color: #dc2626;
  &:hover {
    background-color: #fee2e2;
    border-color: #dc2626;
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
  // Accepts [ProductID, SupplierID]
  setEdit: (ids: [number, number]) => void;
}

export default function SupplierLinkerComponent(props: Props) {
  const [supplierToUnlink, setSupplierToUnlink] = useState<ProductSupplierResponse | null>(null);
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

  const initiateUnlink = (supplier: ProductSupplierResponse) => {
    setSupplierToUnlink(supplier);
    setIsUnlinkModalOpen(true);
  };

  const confirmUnlink = async () => {
    if (!supplierToUnlink) return;

    const token = await getToken();
    if (token) {
      await unlinkSupplierProduct(token, supplierToUnlink.ID, props.product.ID);
      await props.ForceReload();
    }
    setIsUnlinkModalOpen(false);
    setSupplierToUnlink(null);
  };

  return (
    <>
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
                <ActionButtons>
                  {/* Pass [ProductID, SupplierID] */}
                  <EditBtn onClick={() => props.setEdit([props.product.ID, s.ID])} title="Edit Link Details">
                    <MdEdit size={18} />
                  </EditBtn>
                  <UnlinkBtn onClick={() => initiateUnlink(s)} title="Unlink Supplier">
                    <TbUnlink size={18} />
                  </UnlinkBtn>
                </ActionButtons>
              </SupplierCard>
            ))}
          </List>
        )}
      </Container>

      <ConfirmModal
        isOpen={isUnlinkModalOpen}
        onClose={() => setIsUnlinkModalOpen(false)}
        onConfirm={confirmUnlink}
        title="Unlink Supplier"
        content={`Are you sure you want to unlink "${supplierToUnlink?.Name}" from this product?`}
        icon={TbUnlink}
        confirmText="Unlink"
        confirmColor="danger"
      />
    </>
  )
}