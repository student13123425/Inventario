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

  return (
    <div></div>
  )
}