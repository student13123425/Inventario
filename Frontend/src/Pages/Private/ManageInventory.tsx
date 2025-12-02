import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchProducts } from '../../script/network';
import { getToken } from '../../script/utils';
import type { ProductResponse } from '../../script/objects';
import LoadingComponent from './LoadingCard';
import { TbPlus, TbMinus, TbBox } from 'react-icons/tb';
import SellStock from '../../Components/InventoryManagement/SellStock';
import PurchaseStock from '../../Components/InventoryManagement/PurchaseStock';
import InventoryItem from '../../Components/InventoryManagement/InventoryItem';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  padding: 2rem 5%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
`

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const SubTitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    width: 100%;
    
    button {
      flex: 1;
      justify-content: center;
    }
  }
`

const ActionButton = styled.button<{ variant: 'in' | 'out' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  color: white;
  background-color: ${props => props.variant === 'in' ? '#4f46e5' : '#059669'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.variant === 'in' ? '#4338ca' : '#047857'};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const Card = styled.div`
  width: 100%;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 1.5rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 700;
  color: #111827;
  font-size: 1.25rem;
`

const ListContent = styled.div`
  min-height: 400px;
  background-color: #f9fafb;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  gap: 1.5rem;
  text-align: center;
`

const EmptyText = styled.p`
  font-size: 1rem;
  max-width: 400px;
  line-height: 1.5;
  margin: 0;
`

export default function ManageInventory() {
  const [products, setProducts] = useState<ProductResponse[] | null>(null);
  const [viewState, setViewState] = useState<'list' | 'buy' | 'sell'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadInventory = async () => {
      const token = await getToken();
      if (token) {
        try {
          const res = await fetchProducts(token);
          if (res.success) {
            setProducts(res.products);
          }
        } catch (e) {
          console.error("Failed to load inventory", e);
        }
      }
    };
    loadInventory();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setViewState('list');
    setRefreshTrigger(prev => prev + 1);
  }

  if (viewState === 'buy') {
    return <PurchaseStock onClose={() => setViewState('list')} onSuccess={handleRefresh} />
  }

  if (viewState === 'sell') {
    return <SellStock onClose={() => setViewState('list')} onSuccess={handleRefresh} />
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <div>
            <PageTitle>Inventory Management</PageTitle>
            <SubTitle>Track stock levels, purchase from suppliers, and sell to customers.</SubTitle>
          </div>
          <ActionButtons>
            <ActionButton variant="in" onClick={() => setViewState('buy')}>
              <TbPlus size={18} /> Purchase Stock
            </ActionButton>
            <ActionButton variant="out" onClick={() => setViewState('sell')}>
              <TbMinus size={18} /> Register Sale
            </ActionButton>
          </ActionButtons>
        </HeaderSection>

        <Card>
          <CardHeader>Current Stock Levels</CardHeader>
          <ListContent>
            {products === null ? (
              <LoadingComponent msg="Loading Inventory..." />
            ) : products.length === 0 ? (
              <EmptyState>
                <TbBox size={64} color="#d1d5db" />
                <EmptyText>
                  No products found. Please go to the <strong>Products</strong> page to create your first item before managing stock.
                </EmptyText>
              </EmptyState>
            ) : (
              <div>
                {products.map((item) => (
                  <InventoryItem key={item.ID} item={item} />
                ))}
              </div>
            )}
          </ListContent>
        </Card>
      </ContentWrapper>
    </PageContainer>
  )
}