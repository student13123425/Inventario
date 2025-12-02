import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { LowStockAlert, TransactionResponse } from '../../script/objects';
import {
  fetchProducts,
  fetchSuppliers,
  fetchTransactions,
  fetchLowStockAlerts
} from '../../script/network';
import { getToken } from '../../script/utils';
import RightCard from '../../Components/Dashboard/RightCard';
import LoadingComponent from './LoadingCard';

// --- Styled Components ---

const PageContainer = styled.div`
  width: 100%;
  min-height: 100%;
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
  margin-bottom: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

/** * Main Grid: 
 * Desktop: 2 columns (Metrics on left, Alert Card on right) 
 * Tablet/Mobile: 1 column (Stacked)
 */
const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

/**
 * Metrics Grid:
 * Auto-fits cards based on minimum width.
 * Ensures no overflow and nice wrapping.
 */
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`

const MetricCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`

const MetricTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
`

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #4f46e5; /* Primary Indigo */
  margin-bottom: 0.25rem;
`

const MetricSubtitle = styled.p`
  font-size: 0.875rem;
  color: #9ca3af; /* Tertiary Text */
  margin: 0;
`

// --- Helpers ---

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

function salesLast24hAnd7d(transactions: TransactionResponse[]): [number, number] {
  const now = Date.now();
  const ms24h = 24 * 60 * 60 * 1000;
  const ms7d = 7 * ms24h;
  let sum24 = 0;
  let sum7 = 0;

  for (const t of transactions) {
    if (t.TransactionType !== 'Sale') continue;
    const ts = Date.parse(t.TransactionDate);
    if (Number.isNaN(ts)) continue;
    const diff = now - ts;
    if (diff >= 0 && diff <= ms24h) {
      sum24 += t.amount;
      sum7 += t.amount;
    } else if (diff > ms24h && diff <= ms7d) {
      sum7 += t.amount;
    }
  }
  const round = (v: number) => Number(v.toFixed(2));
  return [round(sum24), round(sum7)];
}

function stockBoughtLast24hAnd30d(transactions: TransactionResponse[]): [number, number] {
  const now = Date.now();
  const ms24h = 24 * 60 * 60 * 1000;
  const ms30d = 30 * ms24h;
  let sum24 = 0;
  let sum30 = 0;

  for (const t of transactions) {
    if (t.TransactionType !== 'Purchase') continue;
    const ts = Date.parse(t.TransactionDate);
    if (Number.isNaN(ts)) continue;
    const diff = now - ts;
    if (diff < 0) continue;
    if (diff <= ms24h) {
      sum24 += t.amount;
      sum30 += t.amount;
    } else if (diff > ms24h && diff <= ms30d) {
      sum30 += t.amount;
    }
  }
  const round = (v: number) => Number(v.toFixed(2));
  return [round(sum24), round(sum30)];
}

// --- Component ---

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function DashBoard(props: { setError: Function }) {
  const [NrOfProducts, setNrOfProducts] = useState<number | null>(null);
  const [NrOfSuppliers, setNrOfSuppliers] = useState<number | null>(null);
  const [SalesLast24Hours, setSalesLast24Hours] = useState<number | null>(null);
  const [SalesLast7Days, setSalesLast7Days] = useState<number | null>(null);
  const [StockBoughtLast24Hours, setStockBoughtLast24Hours] = useState<number | null>(null);
  const [StockBoughtLast30Days, setStockBoughtLast30Days] = useState<number | null>(null);
  const [LowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[] | null>(null);

  useEffect(() => {
    const token = getToken()
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
        const salesResponse = await fetchTransactions(token, 'Sale');
        const salesTxs = salesResponse.transactions || [];
        const [last24Sales, last7Sales] = salesLast24hAnd7d(salesTxs);
        setSalesLast24Hours(last24Sales);
        setSalesLast7Days(last7Sales);
      } catch (error) {
        props.setError('Failed to fetch sales transactions data');
      }

      try {
        const purchasesResponse = await fetchTransactions(token, 'Purchase');
        const purchaseTxs = purchasesResponse.transactions || [];
        const [last24Bought, last30Bought] = stockBoughtLast24hAnd30d(purchaseTxs);
        setStockBoughtLast24Hours(last24Bought);
        setStockBoughtLast30Days(last30Bought);
      } catch (error) {
        props.setError('Failed to fetch purchase transactions data');
      }

      try {
        const lowStockResponse = await fetchLowStockAlerts(token);
        setLowStockAlerts(lowStockResponse.lowStockAlerts);
      } catch (error) {
        props.setError('Failed to fetch low stock alerts');
      }
    };

    fetchDashboardData();
  }, [props]);

  const isDataLoaded =
    NrOfProducts !== null &&
    NrOfSuppliers !== null &&
    SalesLast24Hours !== null &&
    SalesLast7Days !== null &&
    StockBoughtLast24Hours !== null &&
    StockBoughtLast30Days !== null;

  if (!isDataLoaded)
    return <LoadingComponent msg={"Loading dashboard data..."} />

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <SectionTitle>Dashboard Overview</SectionTitle>
          <SectionSubtitle>Real-time insights into your inventory performance.</SectionSubtitle>
        </HeaderSection>

        <DashboardLayout>
          {/* Left Column: Metrics */}
          <LeftColumn>
            <MetricsGrid>
              <MetricCard>
                <MetricTitle>Total Products</MetricTitle>
                <MetricValue>{NrOfProducts}</MetricValue>
                <MetricSubtitle>Active in inventory</MetricSubtitle>
              </MetricCard>

              <MetricCard>
                <MetricTitle>Total Suppliers</MetricTitle>
                <MetricValue>{NrOfSuppliers}</MetricValue>
                <MetricSubtitle>Registered partners</MetricSubtitle>
              </MetricCard>

              <MetricCard>
                <MetricTitle>Sales (24h)</MetricTitle>
                <MetricValue>{formatCurrency(SalesLast24Hours)}</MetricValue>
                <MetricSubtitle>Revenue today</MetricSubtitle>
              </MetricCard>

              <MetricCard>
                <MetricTitle>Sales (7 Days)</MetricTitle>
                <MetricValue>{formatCurrency(SalesLast7Days)}</MetricValue>
                <MetricSubtitle>Revenue this week</MetricSubtitle>
              </MetricCard>

              <MetricCard>
                <MetricTitle>Stock Bought (24h)</MetricTitle>
                <MetricValue>{formatCurrency(StockBoughtLast24Hours)}</MetricValue>
                <MetricSubtitle>Expenditure today</MetricSubtitle>
              </MetricCard>

              <MetricCard>
                <MetricTitle>Stock Bought (30d)</MetricTitle>
                <MetricValue>{formatCurrency(StockBoughtLast30Days)}</MetricValue>
                <MetricSubtitle>Expenditure this month</MetricSubtitle>
              </MetricCard>
            </MetricsGrid>
          </LeftColumn>

          {/* Right Column: Alerts */}
          <RightCard data={LowStockAlerts} />
        </DashboardLayout>
      </ContentWrapper>
    </PageContainer>
  )
}