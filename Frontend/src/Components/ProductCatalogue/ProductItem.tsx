import React from 'react'
import type { ProductResponse } from '../../script/objects'
import styled from 'styled-components'
import { MdEdit } from 'react-icons/md'

const Container = styled.div`
  height: 3.5rem;
  display: flex;
  width: 100%;
  border-radius: 8px;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`

const SmallContainer = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  border-right: 1px solid #f3f4f6;
  font-weight: 600;
  color: #4f46e5;
  font-size: 1rem;
  flex-shrink: 0;
  
  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  
  &:last-child {
    border-right: none;
    border-radius: 0 8px 8px 0;
    background-color: transparent;
  }
`

const ExtendedContainer = styled.div`
  flex: 1;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 1rem;
  border-right: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #374151;
  
  &:last-child {
    border-right: none;
  }
  
  &:nth-child(2) {
    font-weight: 600;
    color: #111827;
    font-size: 0.9rem;
    flex: 2; /* Give name more space */
  }
  
  &:nth-child(3) {
    color: #059669; /* Green for price */
    font-weight: 500;
  }
  
  &:nth-child(4) {
    color: #6b7280;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
`

const EditBtn = styled.button`
  width: 2.5rem;
  height: 2.5rem;  
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #4f46e5;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #4338ca;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`

const EditIcon = styled(MdEdit)`
  font-size: 1.1rem;
`

const EmptyField = styled.span`
  color: #9ca3af;
  font-style: italic;
  font-size: 0.8rem;
`

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ProductItem(props: { item: ProductResponse, index: number, setEditing: Function }) {
  const displayIndex = props.index + 1;
  
  return (
    <Container>
      <SmallContainer>
        {displayIndex}
      </SmallContainer>
      <ExtendedContainer>
        {props.item.name || <EmptyField>No Name</EmptyField>}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.price ? `$${Number(props.item.price).toFixed(2)}` : <EmptyField>--</EmptyField>}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.product_bar_code || <EmptyField>No Barcode</EmptyField>}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.nation_of_origin || <EmptyField>N/A</EmptyField>}
      </ExtendedContainer>
      <SmallContainer>
        <EditBtn onClick={() => props.setEditing(props.item)} title="Edit product">
          <EditIcon />
        </EditBtn>
      </SmallContainer>
    </Container>
  )
}