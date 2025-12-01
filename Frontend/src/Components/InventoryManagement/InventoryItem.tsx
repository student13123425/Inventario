import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { ProductResponse } from '../../script/objects'
import { fetchStockLevel } from '../../script/network'
import { getToken } from '../../script/utils'
import { TbAlertTriangle, TbPackage } from 'react-icons/tb'

const Container = styled.div`
  height: 4.5rem;
  display: flex;
  width: 100%;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  overflow: hidden;

  &:hover {
    border-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`

const IconContainer = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  border-right: 1px solid #f3f4f6;
  color: #4f46e5;
  font-size: 1.5rem;
  flex-shrink: 0;
`

const InfoContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.5rem;
  border-right: 1px solid #f3f4f6;
`

const ProductName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`

const Barcode = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
`

const StatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.5rem;
  border-right: 1px solid #f3f4f6;

  &:last-child {
    border-right: none;
  }
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const StatValue = styled.div<{ isLow?: boolean }>`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.isLow ? '#dc2626' : '#111827'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LowStockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #dc2626;
  background-color: #fef2f2;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #fecaca;
`

export default function InventoryItem(props: { item: ProductResponse }) {
  const [stockLevel, setStockLevel] = useState<number | null>(null);

  useEffect(() => {
    const getStock = async () => {
      const token = await getToken();
      if (token && props.item.ID) {
        try {
          const res = await fetchStockLevel(token, props.item.ID);
          setStockLevel(res.stockLevel);
        } catch (e) {
          console.error(e);
        }
      }
    };
    getStock();
  }, [props.item.ID]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Container>
      <IconContainer>
        <TbPackage />
      </IconContainer>
      
      <InfoContainer>
        <ProductName>{props.item.name}</ProductName>
        <Barcode>{props.item.product_bar_code}</Barcode>
      </InfoContainer>

      <StatContainer>
        <StatLabel>Selling Price</StatLabel>
        <StatValue>{formatPrice(props.item.price)}</StatValue>
      </StatContainer>

      <StatContainer>
        <StatLabel>Current Stock</StatLabel>
        <StatValue isLow={stockLevel !== null && stockLevel < 10}>
          {stockLevel === null ? '-' : stockLevel}
          {stockLevel !== null && stockLevel < 10 && (
            <LowStockBadge>
              <TbAlertTriangle /> Low
            </LowStockBadge>
          )}
        </StatValue>
      </StatContainer>

      <StatContainer>
        <StatLabel>Origin</StatLabel>
        <StatValue>{props.item.nation_of_origin || 'N/A'}</StatValue>
      </StatContainer>
    </Container>
  )
}