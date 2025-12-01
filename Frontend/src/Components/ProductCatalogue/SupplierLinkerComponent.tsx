import React, { useState } from 'react'
import type { ProductSupplierResponse, ProductResponse } from '../../script/objects';
import styled from 'styled-components';
import { FaTimesCircle, FaPlus } from 'react-icons/fa';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
`

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
`

const TitleContainer = styled.div`
  width: 100%;
  padding: 1.25rem 1.5rem;
  background-color: #f9fafb;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  user-select: none;
  flex-shrink: 0;
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex child to respect overflow */
`

const Content = styled.div`
  flex: 1;
  width: 100%;
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 0; /* Important for scrolling */

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`

const AddBtnContainer = styled.div`
  padding: 10px;
  width: 100%;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`

const AddBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(79, 70, 229, 0.05);
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`

const EmptyContent = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  flex-direction: column;
  padding: 3rem 2rem;
  color: #6b7280;
`

const EmptyIcon = styled(FaTimesCircle)`
  color: #dc2626;
  font-size: 4rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`

const Text = styled.div`
  width: 100%;
  max-width: 400px;
  font-size: 1.125rem;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 300px;
  }
`

const SubText = styled.div`
  width: 100%;
  max-width: 400px;
  font-size: 0.875rem;
  text-align: center;
  color: #9ca3af;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 300px;
  }
`

const SupplierList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const SupplierItem = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    box-shadow: 0 1px 3px 0 rgba(79, 70, 229, 0.1);
  }
`

const SupplierInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const SupplierName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`

const SupplierDetails = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`

const SupplierPrice = styled.span`
  color: #059669;
  font-weight: 600;
`

const SupplierContact = styled.span`
  color: #6b7280;
`

const SupplierActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.5rem 1rem;
  background-color: ${props => 
    props.variant === 'danger' ? '#fef2f2' : 
    props.variant === 'primary' ? '#4f46e5' : '#f9fafb'};
  color: ${props => 
    props.variant === 'danger' ? '#dc2626' : 
    props.variant === 'primary' ? '#ffffff' : '#374151'};
  border: 1px solid ${props => 
    props.variant === 'danger' ? '#fecaca' : 
    props.variant === 'primary' ? '#4f46e5' : '#d1d5db'};
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => 
      props.variant === 'danger' ? '#fee2e2' : 
      props.variant === 'primary' ? '#4338ca' : '#f3f4f6'};
    border-color: ${props => 
      props.variant === 'danger' ? '#fca5a5' : 
      props.variant === 'primary' ? '#4338ca' : '#9ca3af'};
  }
`

const AddIcon = styled(FaPlus)`
  font-size: 1rem;
`

interface SupplierLinkerComponentProps {
  suppliers: ProductSupplierResponse[];
  product: ProductResponse;
  setIsNewLink: (value: boolean) => void;
}

export default function SupplierLinkerComponent(props: SupplierLinkerComponentProps) {
    const isEmpty = props.suppliers.length === 0;

    if (isEmpty) {
        return (
            <Container>
                <Card>
                    <TitleContainer>Linked Suppliers</TitleContainer>
                    <ContentArea>
                        <EmptyContent>
                            <EmptyIcon />
                            <Text>This product is not linked to any suppliers</Text>
                            <SubText>Add suppliers to source this product from multiple vendors</SubText>
                        </EmptyContent>
                    </ContentArea>
                    <AddBtnContainer>
                        <AddBtn onClick={() => props.setIsNewLink(true)}>
                            <AddIcon />
                            Add Supplier Source
                        </AddBtn>
                    </AddBtnContainer>
                </Card>
            </Container>
        )
    }

    return (
        <Container>
            <Card>
                <TitleContainer>Linked Suppliers</TitleContainer>
                <ContentArea>
                    <Content>
                        <SupplierList>
                            {props.suppliers.map((supplier, index) => (
                                <SupplierItem key={index}>
                                    <SupplierInfo>
                                        <SupplierName>{supplier.Name}</SupplierName>
                                        <SupplierDetails>
                                            {supplier.supplier_price && (
                                                <SupplierPrice>Price: ${supplier.supplier_price}</SupplierPrice>
                                            )}
                                            {supplier.email && (
                                                <SupplierContact>Email: {supplier.email}</SupplierContact>
                                            )}
                                            {supplier.phone_number && (
                                                <SupplierContact>Phone: {supplier.phone_number}</SupplierContact>
                                            )}
                                            {supplier.lead_time_days && (
                                                <span>Lead Time: {supplier.lead_time_days} days</span>
                                            )}
                                        </SupplierDetails>
                                    </SupplierInfo>
                                    <SupplierActions>
                                        <ActionButton variant="primary">
                                            Edit
                                        </ActionButton>
                                        <ActionButton variant="danger">
                                            Remove
                                        </ActionButton>
                                    </SupplierActions>
                                </SupplierItem>
                            ))}
                        </SupplierList>
                    </Content>
                </ContentArea>
                <AddBtnContainer>
                    <AddBtn onClick={() => props.setIsNewLink(true)}>
                        <AddIcon />
                        Add Supplier Source
                    </AddBtn>
                </AddBtnContainer>
            </Card>
        </Container>
    )
}