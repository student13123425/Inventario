import React from 'react'
import type { SupplierProductResponse, SupplierResponse } from '../../script/objects'
import styled from 'styled-components'
import { MdEdit, MdPhone, MdEmail } from 'react-icons/md'

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: auto 2fr 1.5fr 1.5fr auto;
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
    
    /* Hide contact info on mobile, maybe show on expand in future */
    & > div:nth-child(3), & > div:nth-child(4) {
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

const SupplierName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ProductCount = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EditBtn = styled.button`
  width: 2.5rem;
  height: 2.5rem;  
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e7ff;
    border-color: #4f46e5;
  }
`

interface SupplyerItemProps {
  item: SupplierResponse;
  index: number;
  setEditing: (item: any) => void;
  products: SupplierProductResponse[];
}

export default function SupplyerItem({ item, index, setEditing, products }: SupplyerItemProps) {
  const displayIndex = index + 1;

  return (
    <ItemContainer>
      <IndexBox>{displayIndex}</IndexBox>
      
      <MainInfo>
        <SupplierName title={item.Name}>{item.Name}</SupplierName>
        <ProductCount>{products.length} Products Linked</ProductCount>
      </MainInfo>

      <ContactInfo>
        <MdEmail size={16} color="#9ca3af" />
        <span title={item.email}>{item.email || 'No email'}</span>
      </ContactInfo>

      <ContactInfo>
        <MdPhone size={16} color="#9ca3af" />
        <span>{item.phone_number || 'No phone'}</span>
      </ContactInfo>

      <EditBtn onClick={() => setEditing(item)} title="Edit supplier">
        <MdEdit size={18} />
      </EditBtn>
    </ItemContainer>
  )
}