import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { LowStockAlert } from '../../script/objects';
import { 
  fetchProducts, 
  fetchSuppliers, 
  fetchTransactions, 
  fetchLowStockAlerts, 
  fetchDailySales 
} from '../../script/network';
import { getToken } from '../../script/utils';
import RightCard from '../../Components/Dashboard/RightCard';

const Container = styled.div`
  width: 100vw;
  height: 100%;
`

const ContainerInner = styled.div`
  margin: auto;
  width: 1300px;
  max-width: 100vw;
  display: flex;
  padding: 1rem;
`

const Side = styled.div`
  flex: 1;
  width: 100vh;
  display: flex;
  flex-direction: column;
`

const MetricCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`

const MetricTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`

const MetricValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  color: #4f46e5;
  margin: 0;
`

const MetricSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 2rem 0;
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const LoadingComponent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #6b7280;
  font-size: 1rem;
`

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function DashBoard(props:{setError:Function}) {
  const [NrOfProducts, setNrOfProducts] = useState<number|null>(null);
  const [NrOfSuppliers, setNrOfSuppliers] = useState<number|null>(null);
  const [SalesLastMonth, setSalesLastMonth] = useState<number|null>(null);
  const [LowStockAlerts, setLowStockAlerts] = useState<null|LowStockAlert[]>(null);
  const [SalesYesterday, setSalesYesterday] = useState<null|number>(null);
  
  useEffect(() => {
    const token = getToken()
    console.log(token);
    
    if (!token) {
      props.setError('No authentication token found');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const productsResponse = await fetchProducts(token);
        setNrOfProducts(productsResponse.products.length);
      } catch (error) {
        props.setError('Failed to fetch products data');
      }

      try {
        const suppliersResponse = await fetchSuppliers(token);
        setNrOfSuppliers(suppliersResponse.suppliers.length);
      } catch (error) {
        props.setError('Failed to fetch suppliers data');
      }

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const salesResponse = await fetchDailySales(token, yesterdayString);
        setSalesYesterday(salesResponse.dailySales);
      } catch (error) {
        props.setError('Failed to fetch yesterday sales data');
      }

      try {
        const lowStockResponse = await fetchLowStockAlerts(token);
        setLowStockAlerts(lowStockResponse.lowStockAlerts);
      } catch (error) {
        props.setError('Failed to fetch low stock alerts');
      }

      try {
        const transactionsResponse = await fetchTransactions(token, 'Sale');
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const lastMonthSales = transactionsResponse.transactions
          .filter(transaction => {
            const transactionDate = new Date(transaction.TransactionDate);
            return transactionDate >= oneMonthAgo && transaction.TransactionType === 'Sale';
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
        
        setSalesLastMonth(lastMonthSales);
      } catch (error) {
        props.setError('Failed to fetch transactions data');
      }
    };

    fetchDashboardData();
  }, [props]);

  const isDataLoaded = NrOfProducts !== null && NrOfSuppliers !== null && SalesYesterday !== null && SalesLastMonth !== null;

  return (
    <Container>
      <ContainerInner>
        <Side>
          {!isDataLoaded ? (
            <LoadingComponent>Loading dashboard data...</LoadingComponent>
          ) : (
            <>
              <SectionTitle>Dashboard Overview</SectionTitle>
              
              <DashboardGrid>
                <MetricCard>
                  <MetricTitle>Total Products</MetricTitle>
                  <MetricValue>
                    {NrOfProducts}
                  </MetricValue>
                  <MetricSubtitle>Active products in inventory</MetricSubtitle>
                </MetricCard>

                <MetricCard>
                  <MetricTitle>Total Suppliers</MetricTitle>
                  <MetricValue>
                    {NrOfSuppliers}
                  </MetricValue>
                  <MetricSubtitle>Registered suppliers</MetricSubtitle>
                </MetricCard>

                <MetricCard>
                  <MetricTitle>Yesterday's Sales</MetricTitle>
                  <MetricValue>
                    {formatCurrency(SalesYesterday)}
                  </MetricValue>
                  <MetricSubtitle>Total revenue from yesterday</MetricSubtitle>
                </MetricCard>

                <MetricCard>
                  <MetricTitle>Last Month Sales</MetricTitle>
                  <MetricValue>
                    {formatCurrency(SalesLastMonth)}
                  </MetricValue>
                  <MetricSubtitle>Total revenue from last 30 days</MetricSubtitle>
                </MetricCard>
              </DashboardGrid>
            </>
          )}
        </Side>
        <Side>
          <RightCard data={LowStockAlerts}/>
        </Side>
      </ContainerInner>
    </Container>
  )
} 