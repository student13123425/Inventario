import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { ProductResponse } from '../../script/objects'
import { fetchStockLevel } from '../../script/network'
import { getToken } from '../../script/utils'
import { TbAlertTriangle, TbPackage } from 'react-icons/tb'

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: auto 2fr 1fr 1fr 1fr;
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
  }
`

const IconBox = styled.div`
  width: 3rem;
  height: 3rem;
  background-color: #e0e7ff; /* Indigo-100 */
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0; /* Text truncation fix */
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

const StatColumn = styled.div<{ hiddenOnMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (max-width: 768px) {
    ${props => props.hiddenOnMobile && `display: none;`}
  }
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const StatValue = styled.div<{ isLow?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.isLow ? '#dc2626' : '#111827'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LowStockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #dc2626;
  background-color: #fef2f2;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid #fecaca;
  white-space: nowrap;
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

  const isLowStock = stockLevel !== null && stockLevel < 10;

  return (
    <ItemContainer>
      <IconBox>
        <TbPackage />
      </IconBox>
      
      <MainInfo>
        <ProductName title={props.item.name}>{props.item.name}</ProductName>
        <BarcodeBadge>{props.item.product_bar_code}</BarcodeBadge>
      </MainInfo>

      <StatColumn hiddenOnMobile>
        <StatLabel>Sell Price</StatLabel>
        <StatValue>{formatPrice(props.item.price)}</StatValue>
      </StatColumn>

      <StatColumn>
        <StatLabel>Stock</StatLabel>
        <StatValue isLow={isLowStock}>
          {stockLevel === null ? '-' : stockLevel}
          {isLowStock && (
            <LowStockBadge>
              <TbAlertTriangle size={12} /> Low
            </LowStockBadge>
          )}
        </StatValue>
      </StatColumn>

      <StatColumn hiddenOnMobile>
        <StatLabel>Origin</StatLabel>
        <StatValue>{props.item.nation_of_origin || 'N/A'}</StatValue>
      </StatColumn>
    </ItemContainer>
  )
}