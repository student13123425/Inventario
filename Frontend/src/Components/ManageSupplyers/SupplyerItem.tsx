import React from 'react'
import type { SupplierResponse } from '../../script/objects'
import styled from 'styled-components'

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
  border-radius: 8px 0 0 8px;
  border-right: 1px solid #f3f4f6;
  font-weight: 600;
  color: #4f46e5;
  font-size: 1rem;
  flex-shrink: 0;
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
  }
  
  &:nth-child(3) {
    color: #6b7280;
  }
  
  &:nth-child(4) {
    color: #6b7280;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
`

const EmptyField = styled.span`
  color: #9ca3af;
  font-style: italic;
  font-size: 0.8rem;
`

export default function SupplyerItem(props: { item: SupplierResponse, index: number }) {
  const displayIndex = props.index + 1; // Convert to 1-based indexing for display

  return (
    <Container>
      <SmallContainer>
        {displayIndex}
      </SmallContainer>
      <ExtendedContainer>
        {props.item.Name}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.email}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.phone_number}
      </ExtendedContainer>
    </Container>
  )
}