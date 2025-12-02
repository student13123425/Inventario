import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { TbPlus, TbArrowUpRight, TbArrowDownLeft, TbRotate, TbBox } from 'react-icons/tb';
import { fetchTransactions, fetchSuppliers } from '../../script/network';
import { getToken } from '../../script/utils';
import type { TransactionResponse, SupplierResponse } from '../../script/objects';
import LoadingComponent from './LoadingCard';
import AddTransactionModal from '../../Components/Transactions/AddTransactionModal';

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
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const SubTitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 640px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const BalanceCard = styled.div`
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-width: 140px;
`;

const BalanceLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BalanceValue = styled.span<{ $isNegative: boolean }>`
  font-size: 1.25rem;
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
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 2fr 1fr 1fr 100px;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  
  span {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    span:nth-child(2), span:nth-child(6) { display: none; } /* Hide Type and Actions on smaller screens */
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr 1fr;
    span:nth-child(4) { display: none; } /* Hide Payment on mobile */
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 2fr 1fr 1fr 100px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  font-size: 0.875rem;
  color: #111827;
  transition: background-color 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    div:nth-child(2), div:nth-child(6) { display: none; }
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr 1fr;
    span:nth-child(4) { display: none; }
  }
`;

const TypeBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;

  ${props => {
    switch (props.type) {
      case 'Sale': return `background-color: #ecfdf5; color: #059669; border: 1px solid #d1fae5;`;
      case 'Deposit': return `background-color: #ecfdf5; color: #059669; border: 1px solid #d1fae5;`;
      case 'Purchase': return `background-color: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;`;
      case 'Withdrawal': return `background-color: #fff7ed; color: #ea580c; border: 1px solid #ffedd5;`;
      default: return `background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;`;
    }
  }}
`;

const Amount = styled.span<{ $isPositive: boolean }>`
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: ${props => props.$isPositive ? '#059669' : '#dc2626'};
`;

const PaymentStatus = styled.span<{ status: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.status === 'paid' ? '#ecfdf5' : '#fffbeb'};
  color: ${props => props.status === 'paid' ? '#059669' : '#d97706'};
`;

const CounterButton = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
    color: #111827;
    border-color: #d1d5db;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  gap: 1.5rem;
  text-align: center;
`;

// Wrapper for the loading component
const LoadingWrapper = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.payment_type === 'owed') return acc;
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
    return s ? s.Name : 'Unknown ID';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show full-page loading state if data is fetching
  if (loading) {
    return (
      <PageContainer>
        <LoadingWrapper>
          <LoadingComponent msg="Loading Financial Data..." />
        </LoadingWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <TitleColumn>
            <PageTitle>Transactions</PageTitle>
            <SubTitle>Monitor financial flow and operational expenses.</SubTitle>
          </TitleColumn>
          <ActionsRow>
            <BalanceCard>
              <BalanceLabel>Cash Balance</BalanceLabel>
              <BalanceValue $isNegative={currentBalance < 0}>
                ${currentBalance.toFixed(2)}
              </BalanceValue>
            </BalanceCard>
            <AddButton onClick={handleOpenModal}>
              <TbPlus size={18} />
              New Transaction
            </AddButton>
          </ActionsRow>
        </HeaderSection>

        <TableCard>
          <TableHeader>
            <span>Date</span>
            <span>Type</span>
            <span>Details (Source/Dest)</span>
            <span>Status</span>
            <span>Amount</span>
            <span>Action</span>
          </TableHeader>
          {transactions.length === 0 ? (
            <EmptyState>
              <TbBox size={64} color="#d1d5db" />
              <p>No transactions found. Create your first transaction to start tracking finances.</p>
            </EmptyState>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.ID}>
                <span>{formatDate(t.TransactionDate)}</span>
                <div>
                  <TypeBadge type={t.TransactionType}>
                    {t.TransactionType === 'Sale' && <TbArrowDownLeft size={14} />}
                    {t.TransactionType === 'Deposit' && <TbArrowDownLeft size={14} />}
                    {t.TransactionType === 'Purchase' && <TbArrowUpRight size={14} />}
                    {t.TransactionType === 'Withdrawal' && <TbArrowUpRight size={14} />}
                    {t.TransactionType}
                  </TypeBadge>
                </div>
                <span style={{fontWeight: 500}}>
                  {t.TransactionType === 'Purchase' 
                    ? (t.SupplierID ? getSupplierName(t.SupplierID) : 'General Expense') 
                    : (t.TransactionType === 'Sale' ? 'Public Sale' : 'Operations Adjustment')}
                </span>
                <span><PaymentStatus status={t.payment_type}>{t.payment_type}</PaymentStatus></span>
                <Amount $isPositive={['Sale', 'Deposit'].includes(t.TransactionType)}>
                  {['Sale', 'Deposit'].includes(t.TransactionType) ? '+' : '-'}
                  ${Math.abs(t.amount).toFixed(2)}
                </Amount>
                <div>
                  <CounterButton onClick={() => handleCounter(t)} title="Create inverse transaction">
                    <TbRotate size={14} /> Counter
                  </CounterButton>
                </div>
              </TableRow>
            ))
          )}
        </TableCard>
      </ContentWrapper>
      
      <AddTransactionModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        initialCounterData={counterData ? {
          TransactionType: counterData.TransactionType,
          payment_type: counterData.payment_type,
          amount: counterData.amount,
          SupplierID: counterData.SupplierID
        } : undefined}
      />
    </PageContainer>
  );
}