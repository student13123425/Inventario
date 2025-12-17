import React, { useState } from 'react'
import type { ProductResponse } from '../../script/objects'
import styled from 'styled-components'
import { MdEdit, MdDelete, MdWarning } from 'react-icons/md'
import ConfirmModal from '../ConfirmModal'

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: auto 2fr 1fr 1.5fr 1fr auto;
  align-items: center;
  gap: 1.5rem;
  background-color: #ffffff;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    
    /* Hide extra columns on mobile */
    & > div:nth-child(3), 
    & > div:nth-child(4), 
    & > div:nth-child(5) {
      display: none;
    }
  }
`

const IndexBox = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`

const ProductName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BarcodeBadge = styled.span`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
`

const PriceInfo = styled.div`
  font-weight: 600;
  color: #059669;
  font-size: 0.95rem;
`

const DetailText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`

const IconButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;  
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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

const DeleteBtn = styled(IconButton)`
  color: #dc2626;
  &:hover {
    background-color: #fee2e2;
    border-color: #dc2626;
  }
`

interface ProductItemProps {
  item: ProductResponse;
  index: number;
  setEditing: (item: ProductResponse) => void;
  onDelete: (item: ProductResponse) => void;
}

export default function ProductItem({ item, index, setEditing, onDelete }: ProductItemProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const displayIndex = index + 1;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price);
  
  const handleDeleteConfirm = () => {
    onDelete(item);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <ItemContainer>
        <IndexBox>{displayIndex}</IndexBox>
        
        <MainInfo>
          <ProductName title={item.name}>{item.name}</ProductName>
          <BarcodeBadge>{item.product_bar_code || 'No Barcode'}</BarcodeBadge>
        </MainInfo>

        <PriceInfo>
          {formattedPrice}
        </PriceInfo>

        <DetailText title="Barcode">
          {item.product_bar_code || '-'}
        </DetailText>

        <DetailText title="Nation of Origin">
          {item.nation_of_origin || 'N/A'}
        </DetailText>

        <ActionButtons>
          <EditBtn onClick={() => setEditing(item)} title="Edit product">
            <MdEdit size={18} />
          </EditBtn>
          <DeleteBtn onClick={() => setIsDeleteModalOpen(true)} title="Delete product">
            <MdDelete size={18} />
          </DeleteBtn>
        </ActionButtons>
      </ItemContainer>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        content={`Are you sure you want to remove "${item.name}" from the catalogue?`}
        icon={MdWarning}
        confirmText="Delete Product"
        confirmColor="danger"
      />
    </>
  )
} 