import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { TbX, TbChevronDown, TbCheck } from 'react-icons/tb';
import type { SupplierResponse, TransactionPayload } from '../../script/objects';
import { createTransaction, fetchSuppliers } from '../../script/network';
import { getToken } from '../../script/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCounterData?: Partial<TransactionPayload>; // For "Countering" a transaction
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(17, 24, 39, 0.6); /* Darker overlay */
  backdrop-filter: blur(4px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

const ScrollableContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: #f9fafb;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

/* Custom Dropdown Styles */
const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownHeader = styled.div<{ $isOpen: boolean; $disabled?: boolean }>`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${props => props.$isOpen ? '#4f46e5' : '#d1d5db'};
  border-radius: 8px;
  background-color: ${props => props.$disabled ? '#f3f4f6' : '#ffffff'};
  color: ${props => props.$disabled ? '#9ca3af' : '#111827'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    border-color: ${props => props.$disabled ? '#d1d5db' : '#9ca3af'};
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
`;

const DropdownItem = styled.div<{ $isSelected: boolean }>`
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  background-color: ${props => props.$isSelected ? '#f3f4f6' : 'transparent'};
  color: ${props => props.$isSelected ? '#4f46e5' : '#111827'};
  font-weight: ${props => props.$isSelected ? 500 : 400};

  &:hover {
    background-color: #f9fafb;
  }
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: #ffffff;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  
  background-color: ${props => props.primary ? '#4f46e5' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: ${props => props.primary ? '1px solid transparent' : '1px solid #d1d5db'};
  box-shadow: ${props => props.primary ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    background-color: ${props => props.primary ? '#4338ca' : '#f9fafb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function AddTransactionModal({ isOpen, onClose, onSuccess, initialCounterData }: AddTransactionModalProps) {
  const [type, setType] = useState<'Purchase' | 'Sale' | 'Deposit' | 'Withdrawal'>('Sale');
  const [paymentType, setPaymentType] = useState<'paid' | 'owed'>('paid');
  const [amount, setAmount] = useState<string>('');
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const loadSuppliers = async () => {
        try {
          const token = getToken();
          if (token) {
            const result = await fetchSuppliers(token);
            if (result.success) {
              setSuppliers(result.suppliers);
            }
          }
        } catch (error) {
          console.error('Failed to load suppliers', error);
        }
      };
      
      loadSuppliers();

      if (initialCounterData) {
        setType(initialCounterData.TransactionType || 'Sale');
        setPaymentType(initialCounterData.payment_type || 'paid');
        setAmount(initialCounterData.amount ? (initialCounterData.amount * -1).toString() : '');
        setSupplierId(initialCounterData.SupplierID || null);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      } else {
        setType('Sale');
        setPaymentType('paid');
        setAmount('');
        setSupplierId(null);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialCounterData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSupplierDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const payload: TransactionPayload = {
        TransactionType: type,
        payment_type: paymentType,
        amount: parseFloat(amount),
        TransactionDate: transactionDate,
        SupplierID: (type === 'Purchase' && supplierId) ? supplierId : undefined,
      };

      await createTransaction(token, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Failed to create transaction');
    }
  };

  const getSupplierName = (id: number | null) => {
    if (!id) return 'Select Supplier...';
    const s = suppliers.find(s => s.ID === id);
    return s ? s.Name : 'Unknown Supplier';
  };

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{initialCounterData ? 'Counter Transaction' : 'New Transaction'}</Title>
          <CloseButton onClick={onClose}><TbX size={20} /></CloseButton>
        </Header>
        <ScrollableContent>
          <FormGroup>
            <Label>Transaction Type</Label>
            <StyledSelect 
              value={type} 
              onChange={e => setType(e.target.value as any)}
              disabled={!!initialCounterData} 
            >
              <option value="Sale">Receive Money (Sale)</option>
              <option value="Purchase">Pay/Owe Supplier (Purchase)</option>
              <option value="Deposit">Add to Balance (Deposit)</option>
              <option value="Withdrawal">Remove from Balance (Withdrawal)</option>
            </StyledSelect>
          </FormGroup>

          {type === 'Purchase' && (
            <>
              <FormGroup>
                <Label>Supplier</Label>
                <DropdownWrapper ref={dropdownRef}>
                  <DropdownHeader 
                    $isOpen={isSupplierDropdownOpen} 
                    $disabled={!!initialCounterData}
                    onClick={() => !initialCounterData && setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                  >
                    <span>{getSupplierName(supplierId)}</span>
                    {!initialCounterData && <TbChevronDown />}
                  </DropdownHeader>
                  {isSupplierDropdownOpen && (
                    <DropdownList>
                      {suppliers.map(s => (
                        <DropdownItem 
                          key={s.ID} 
                          $isSelected={s.ID === supplierId}
                          onClick={() => {
                            setSupplierId(s.ID);
                            setIsSupplierDropdownOpen(false);
                          }}
                        >
                          {s.Name}
                          {s.ID === supplierId && <TbCheck size={16} />}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  )}
                </DropdownWrapper>
              </FormGroup>

              <FormGroup>
                <Label>Payment Status</Label>
                <StyledSelect 
                  value={paymentType} 
                  onChange={e => setPaymentType(e.target.value as any)}
                  disabled={!!initialCounterData}
                >
                  <option value="paid">Paid (Immediate Payment)</option>
                  <option value="owed">Owed (Credit/Debt)</option>
                </StyledSelect>
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Label>Amount ($)</Label>
            <StyledInput 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder={initialCounterData ? "e.g. -500" : "e.g. 500.00"}
              required 
            />
            {initialCounterData && <span style={{fontSize: '0.75rem', color: '#6b7280'}}>Enter a negative value to reverse transaction.</span>}
          </FormGroup>

          <FormGroup>
            <Label>Date</Label>
            <StyledInput 
              type="date" 
              value={transactionDate} 
              onChange={e => setTransactionDate(e.target.value)}
              required 
            />
          </FormGroup>
        </ScrollableContent>
        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary onClick={handleSubmit} disabled={!amount}>
            {initialCounterData ? 'Post Counter' : 'Create'}
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}