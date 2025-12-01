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
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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

const Form = styled.form`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

/* Custom Dropdown Styles */
const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownHeader = styled.div<{ $isOpen: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.$isOpen ? '#4f46e5' : '#d1d5db'};
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  background-color: ${props => props.$isSelected ? '#f3f4f6' : 'transparent'};
  color: ${props => props.$isSelected ? '#4f46e5' : '#111827'};

  &:hover {
    background-color: #f9fafb;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: #4f46e5;
  border: none;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #4338ca;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

export default function AddTransactionModal({ isOpen, onClose, onSuccess, initialCounterData }: AddTransactionModalProps) {
  const [type, setType] = useState<'Purchase' | 'Sale' | 'Deposit' | 'Withdrawal'>('Sale');
  const [paymentType, setPaymentType] = useState<'paid' | 'owed'>('paid');
  const [amount, setAmount] = useState<string>('');
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  
  // Custom Dropdown State
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset or Initialize form
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
        // Pre-fill for countering logic
        setType(initialCounterData.TransactionType || 'Sale');
        setPaymentType(initialCounterData.payment_type || 'paid');
        // Counter amount: if original was 500, pre-fill -500
        setAmount(initialCounterData.amount ? (initialCounterData.amount * -1).toString() : '');
        setSupplierId(initialCounterData.SupplierID || null);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      } else {
        // Default new transaction
        setType('Sale');
        setPaymentType('paid');
        setAmount('');
        setSupplierId(null);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialCounterData]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSupplierDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      const payload: TransactionPayload = {
        TransactionType: type,
        payment_type: paymentType,
        amount: parseFloat(amount),
        TransactionDate: transactionDate,
        SupplierID: (type === 'Purchase' && supplierId) ? supplierId : undefined,
        // CustomerID is handled as generic public source for Sales
      };

      const result = await createTransaction(token, payload);
      // Assuming result returns the batch response or success
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
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Transaction Type</Label>
            <Select 
              value={type} 
              onChange={e => setType(e.target.value as any)}
              disabled={!!initialCounterData} // Lock type if countering
            >
              <option value="Sale">Receive Money (Sale)</option>
              <option value="Purchase">Pay/Owe Supplier (Purchase)</option>
              <option value="Deposit">Add to Balance (Deposit)</option>
              <option value="Withdrawal">Remove from Balance (Withdrawal)</option>
            </Select>
          </FormGroup>

          {type === 'Purchase' && (
            <>
              <FormGroup>
                <Label>Supplier</Label>
                <DropdownWrapper ref={dropdownRef}>
                  <DropdownHeader 
                    $isOpen={isSupplierDropdownOpen} 
                    onClick={() => !initialCounterData && setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                    style={{ cursor: initialCounterData ? 'not-allowed' : 'pointer', opacity: initialCounterData ? 0.7 : 1 }}
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
                <Select 
                  value={paymentType} 
                  onChange={e => setPaymentType(e.target.value as any)}
                  disabled={!!initialCounterData}
                >
                  <option value="paid">Paid (Immediate Payment)</option>
                  <option value="owed">Owed (Credit/Debt)</option>
                </Select>
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Label>Amount ($)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder={initialCounterData ? "e.g. -500" : "e.g. 500.00"}
              required 
            />
            {initialCounterData && <span style={{fontSize: '0.75rem', color: '#6b7280'}}>Enter a negative value to reverse, or positive to adjust.</span>}
          </FormGroup>

          <FormGroup>
            <Label>Date</Label>
            <Input 
              type="date" 
              value={transactionDate} 
              onChange={e => setTransactionDate(e.target.value)}
              required 
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
            <SubmitButton type="submit">
              {initialCounterData ? 'Post Counter Transaction' : 'Create Transaction'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </Overlay>
  );
}