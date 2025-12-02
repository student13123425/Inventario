import React from 'react'
import type { ProductResponse } from '../../script/objects'
import styled from 'styled-components'
import { MdEdit } from 'react-icons/md'

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ProductItem(props: { item: ProductResponse, index: number, setEditing: Function }) {
  const displayIndex = props.index + 1;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.item.price);
  
  return (
    <ItemContainer>
      <IndexBox>{displayIndex}</IndexBox>
      
      <MainInfo>
        <ProductName title={props.item.name}>{props.item.name}</ProductName>
        <BarcodeBadge>{props.item.product_bar_code || 'No Barcode'}</BarcodeBadge>
      </MainInfo>

      <PriceInfo>
        {formattedPrice}
      </PriceInfo>

      <DetailText title="Barcode">
        {props.item.product_bar_code || '-'}
      </DetailText>

      <DetailText title="Nation of Origin">
        {props.item.nation_of_origin || 'N/A'}
      </DetailText>

      <EditBtn onClick={() => props.setEditing(props.item)} title="Edit product">
        <MdEdit size={18} />
      </EditBtn>
    </ItemContainer>
  )
}