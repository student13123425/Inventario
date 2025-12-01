import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchProducts } from '../../script/network';
import { getToken } from '../../script/utils';
import type { ProductResponse } from '../../script/objects';
import LoadingComponent from './LoadingCard'; // Assuming you have this based on your ManageSupplyers
import { TbPlus, TbMinus, TbBox } from 'react-icons/tb';
import SellStock from '../../Components/InventoryManagement/SellStock';
import PurchaseStock from '../../Components/InventoryManagement/PurchaseStock';
import InventoryItem from '../../Components/InventoryManagement/InventoryItem';

const Container = styled.div`
  width: 100vw;
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
`

const ContainerInner = styled.div`
  margin: 0 auto;
  width: 1200px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
  gap: 2rem;
  
  @media (max-width: 768px) {
    max-width: 95vw;
    padding: 1rem 0;
  }
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
`

const SubTitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`

const ActionButton = styled.button<{ variant: 'in' | 'out' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  color: white;
  background-color: ${props => props.variant === 'in' ? '#4f46e5' : '#059669'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.variant === 'in' ? '#4338ca' : '#047857'};
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
  padding: 1.25rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 700;
  color: #111827;
  font-size: 1.25rem;
`

const ListContent = styled.div`
  padding: 1rem;
  min-height: 400px;
  background-color: #f9fafb;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
  gap: 1rem;
`

const LoadingContinaer=styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
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
          // Fetch products (InventoryItem handles fetching individual stock counts)
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
    <Container>
      <ContainerInner>
        <HeaderSection>
          <div>
            <PageTitle>Inventory Management</PageTitle>
            <SubTitle>Track stock levels, purchase from suppliers, and sell to customers.</SubTitle>
          </div>
          <ActionButtons>
            <ActionButton variant="in" onClick={() => setViewState('buy')}>
              <TbPlus /> Purchase Stock
            </ActionButton>
            <ActionButton variant="out" onClick={() => setViewState('sell')}>
              <TbMinus /> Register Sale
            </ActionButton>
          </ActionButtons>
        </HeaderSection>

        <Card>
          <CardHeader>Current Stock Levels</CardHeader>
          <ListContent>
            {products === null ? (
              <LoadingContinaer>
                <LoadingComponent msg="Loading Inventory..." />
              </LoadingContinaer>
            ) : products.length === 0 ? (
              <EmptyState>
                <TbBox size={48} />
                <div>No products found. Please create products in the Products page first.</div>
              </EmptyState>
            ) : (
              products.map((item) => (
                <InventoryItem key={item.ID} item={item} />
              ))
            )}
          </ListContent>
        </Card>
      </ContainerInner>
    </Container>
  )
}