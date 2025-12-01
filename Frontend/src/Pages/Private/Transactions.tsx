import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { TbPlus, TbArrowUpRight, TbArrowDownLeft, TbRotate, TbFilter } from 'react-icons/tb';
import { fetchTransactions, fetchSuppliers } from '../../script/network';
import { getToken } from '../../script/utils';
import type { TransactionResponse, SupplierResponse } from '../../script/objects';
import LoadingCard from '../../Pages/Private/LoadingComponentInline';
import AddTransactionModal from '../../Components/Transactions/AddTransactionModal';

const Container = styled.div`
  width: 100vw;
  height: 100%;
  background-color: #f9fafb;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
`;

const BalanceCard = styled.div`
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BalanceLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const BalanceValue = styled.span<{ $isNegative: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isNegative ? '#dc2626' : '#059669'};
`;

const AddButton = styled.button`
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);

  &:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  font-size: 0.95rem;
  color: #111827;
  transition: background-color 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const TypeBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;

  ${props => {
    switch (props.type) {
      case 'Sale': return `background-color: #ecfdf5; color: #059669;`;
      case 'Deposit': return `background-color: #ecfdf5; color: #059669;`;
      case 'Purchase': return `background-color: #fef2f2; color: #dc2626;`;
      case 'Withdrawal': return `background-color: #fff7ed; color: #c2410c;`;
      default: return `background-color: #f3f4f6; color: #4b5563;`;
    }
  }}
`;

const Amount = styled.span<{ $isPositive: boolean }>`
  font-weight: 600;
  color: ${props => props.$isPositive ? '#059669' : '#dc2626'};
`;

const PaymentStatus = styled.span<{ status: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.status === 'paid' ? '#059669' : '#d97706'};
`;

const CounterButton = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    color: #111827;
    border-color: #d1d5db;
  }
`;

const EmptyState = styled.div`
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  gap: 1rem;
`;

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counterData, setCounterData] = useState<TransactionResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const [transResult, suppResult] = await Promise.all([
        fetchTransactions(token),
        fetchSuppliers(token)
      ]);

      if (transResult.success) {
        // Sort by date desc (newest first)
        const sorted = transResult.transactions.sort((a, b) => 
          new Date(b.TransactionDate).getTime() - new Date(a.TransactionDate).getTime()
        );
        setTransactions(sorted);
      }
      if (suppResult.success) {
        setSuppliers(suppResult.suppliers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setCounterData(null);
    setIsModalOpen(true);
  };

  const handleCounter = (transaction: TransactionResponse) => {
    setCounterData(transaction);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchData();
  };

  // Calculate Balance
  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      // Logic for balance calculation:
      // Sale (Paid) -> +Amount
      // Deposit -> +Amount
      // Purchase (Paid) -> -Amount
      // Withdrawal -> -Amount
      // Owed transactions do not affect cash balance immediately, but affect net worth?
      // "add to you balance a sum ore remove from it" implies cash balance.
      // Assuming 'paid' affects balance.
      
      if (curr.payment_type === 'owed') return acc; // Skip debt for cash balance

      if (curr.TransactionType === 'Sale' || curr.TransactionType === 'Deposit') {
        return acc + curr.amount;
      } else if (curr.TransactionType === 'Purchase' || curr.TransactionType === 'Withdrawal') {
        return acc - curr.amount;
      }
      return acc;
    }, 0);
  }, [transactions]);

  const getSupplierName = (id?: number) => {
    if (!id) return '-';
    const s = suppliers.find(sup => sup.ID === id);
    return s ? s.Name : 'Unknown ID: ' + id;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Container>
        <ContentWrapper>
          <Header>
            <TitleColumn>
              <Title>Transactions</Title>
              <span style={{color: '#6b7280'}}>Manage sales, purchases, and operational funds.</span>
            </TitleColumn>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <BalanceCard>
                <BalanceLabel>Current Balance</BalanceLabel>
                <BalanceValue $isNegative={currentBalance < 0}>
                  ${currentBalance.toFixed(2)}
                </BalanceValue>
              </BalanceCard>
              <AddButton onClick={handleOpenModal}>
                <TbPlus size={20} />
                New Transaction
              </AddButton>
            </div>
          </Header>

          {loading ? (
            <div style={{height: '200px'}}><LoadingCard msg="Loading Transactions..." /></div>
          ) : (
            <TableContainer>
              <TableHeader>
                <span>Date</span>
                <span>Type</span>
                <span>Source / Destination</span>
                <span>Payment</span>
                <span>Amount</span>
                <span>Actions</span>
              </TableHeader>
              {transactions.length === 0 ? (
                <EmptyState>
                  <TbFilter size={48} color="#e5e7eb" />
                  <span>No transactions found. Start by creating one.</span>
                </EmptyState>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.ID}>
                    <span>{formatDate(t.TransactionDate)}</span>
                    <div>
                      <TypeBadge type={t.TransactionType}>
                        {t.TransactionType === 'Sale' && <TbArrowDownLeft />}
                        {t.TransactionType === 'Deposit' && <TbArrowDownLeft />}
                        {t.TransactionType === 'Purchase' && <TbArrowUpRight />}
                        {t.TransactionType === 'Withdrawal' && <TbArrowUpRight />}
                        {t.TransactionType}
                      </TypeBadge>
                    </div>
                    <span style={{fontWeight: 500}}>
                      {t.TransactionType === 'Purchase' 
                        ? (t.SupplierID ? getSupplierName(t.SupplierID) : 'General') 
                        : (t.TransactionType === 'Sale' ? 'Client (Public)' : 'Operations')}
                    </span>
                    <PaymentStatus status={t.payment_type}>{t.payment_type}</PaymentStatus>
                    <Amount $isPositive={['Sale', 'Deposit'].includes(t.TransactionType)}>
                      {['Sale', 'Deposit'].includes(t.TransactionType) ? '+' : '-'}
                      ${Math.abs(t.amount).toFixed(2)}
                    </Amount>
                    <div>
                      <CounterButton onClick={() => handleCounter(t)}>
                        <TbRotate size={14} /> Counter
                      </CounterButton>
                    </div>
                  </TableRow>
                ))
              )}
            </TableContainer>
          )}
        </ContentWrapper>
      </Container>
      
      <AddTransactionModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        initialCounterData={counterData ? {
          TransactionType: counterData.TransactionType,
          payment_type: counterData.payment_type,
          amount: counterData.amount, // Modal will inverse this logic visually
          SupplierID: counterData.SupplierID
        } : undefined}
      />
    </>
  );
}