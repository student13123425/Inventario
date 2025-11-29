import React from 'react'
import type { SupplierResponse } from '../../script/objects'
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
  }
  
  &:nth-child(3) {
    color: #6b7280;
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
export default function SupplyerItem(props: { item: SupplierResponse, index: number,setEditing:Function}) {
  const displayIndex = props.index + 1; // Convert to 1-based indexing for display
  return (
    <Container>
      <SmallContainer>
        {displayIndex}
      </SmallContainer>
      <ExtendedContainer>
        {props.item.Name || <EmptyField>No name</EmptyField>}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.email || <EmptyField>No email</EmptyField>}
      </ExtendedContainer>
      <ExtendedContainer>
        {props.item.phone_number || <EmptyField>No phone</EmptyField>}
      </ExtendedContainer>
      <SmallContainer>
        <EditBtn onClick={()=>props.setEditing(props.item)} title="Edit supplier">
          <EditIcon />
        </EditBtn>
      </SmallContainer>
    </Container>
  )
}