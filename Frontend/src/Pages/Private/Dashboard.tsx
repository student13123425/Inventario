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

const Container = styled.div`
  width: 100vw;
  height: 100%;
`

const ContainerInner = styled.div`
  margin: auto;
  width: 1000px;
  max-width: 100vw;
  display: flex;
  padding: 1rem;
  gap: 1rem;
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


const formatCurrency = (amount: number | null) => {
  if (amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Returns [salesLast24Hours, salesLast7Days] for given transactions.
 * Only counts transactions where TransactionType === 'Sale'.
 */
function salesLast24hAnd7d(transactions: TransactionResponse[]): [number, number] {
  const now = Date.now();
  const ms24h = 24 * 60 * 60 * 1000;
  const ms7d = 7 * ms24h;

  let sum24 = 0;
  let sum7 = 0;

  for (const t of transactions) {
    if (t.TransactionType !== 'Sale') continue;

    const ts = Date.parse(t.TransactionDate);
    if (Number.isNaN(ts)) continue; // skip invalid dates

    const diff = now - ts;
    // only include past transactions
    if (diff >= 0 && diff <= ms24h) {
      sum24 += t.amount;
      sum7 += t.amount; // included in 7-day total
    } else if (diff > ms24h && diff <= ms7d) {
      sum7 += t.amount;
    }
  }

  const round = (v: number) => Number(v.toFixed(2));
  return [round(sum24), round(sum7)];
}

/**
 * Returns [stockValueLast24Hours, stockValueLast30Days]
 * Counts transactions where TransactionType === 'Purchase'.
 * Sums the `amount` field (assumed to represent money spent buying stock).
 */
function stockBoughtLast24hAnd30d(transactions: TransactionResponse[]): [number, number] {
  const now = Date.now();
  const ms24h = 24 * 60 * 60 * 1000;
  const ms30d = 30 * ms24h;

  let sum24 = 0;
  let sum30 = 0;

  for (const t of transactions) {
    if (t.TransactionType !== 'Purchase') continue;

    const ts = Date.parse(t.TransactionDate);
    if (Number.isNaN(ts)) continue; // skip invalid dates

    const diff = now - ts;
    if (diff < 0) continue; // skip future-dated transactions

    if (diff <= ms24h) {
      sum24 += t.amount;
      sum30 += t.amount; // included in 30-day total
    } else if (diff > ms24h && diff <= ms30d) {
      sum30 += t.amount;
    }
  }

  const round = (v: number) => Number(v.toFixed(2));
  return [round(sum24), round(sum30)];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function DashBoard(props: { setError: Function }) {
  const [NrOfProducts, setNrOfProducts] = useState<number | null>(null);
  const [NrOfSuppliers, setNrOfSuppliers] = useState<number | null>(null);

  // Sales metrics
  const [SalesLast24Hours, setSalesLast24Hours] = useState<number | null>(null);
  const [SalesLast7Days, setSalesLast7Days] = useState<number | null>(null);

  // Stock (purchases) metrics
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
        // fetch sale transactions and compute last 24h & last 7d
        const salesResponse = await fetchTransactions(token, 'Sale');
        const salesTxs = salesResponse.transactions || [];
        const [last24Sales, last7Sales] = salesLast24hAnd7d(salesTxs);
        setSalesLast24Hours(last24Sales);
        setSalesLast7Days(last7Sales);
      } catch (error) {
        props.setError('Failed to fetch sales transactions data');
      }

      try {
        // fetch purchase transactions and compute stock bought last 24h & last 30d
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
    <Container>
      <ContainerInner>
        <Side>
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
              <MetricTitle>Last 24 Hours Sales</MetricTitle>
              <MetricValue>
                {formatCurrency(SalesLast24Hours)}
              </MetricValue>
              <MetricSubtitle>Total revenue from the last 24 hours</MetricSubtitle>
            </MetricCard>

            <MetricCard>
              <MetricTitle>Last 7 Days Sales</MetricTitle>
              <MetricValue>
                {formatCurrency(SalesLast7Days)}
              </MetricValue>
              <MetricSubtitle>Total revenue from the last 7 days</MetricSubtitle>
            </MetricCard>

            <MetricCard>
              <MetricTitle>Stock Bought (24h)</MetricTitle>
              <MetricValue>
                {formatCurrency(StockBoughtLast24Hours)}
              </MetricValue>
              <MetricSubtitle>Money spent buying stock in the last 24 hours</MetricSubtitle>
            </MetricCard>

            <MetricCard>
              <MetricTitle>Stock Bought (30 days)</MetricTitle>
              <MetricValue>
                {formatCurrency(StockBoughtLast30Days)}
              </MetricValue>
              <MetricSubtitle>Money spent buying stock in the last 30 days</MetricSubtitle>
            </MetricCard>
          </DashboardGrid>
        </Side>
        <Side>
          <RightCard data={LowStockAlerts} />
        </Side>
      </ContainerInner>
    </Container>
  )
}
