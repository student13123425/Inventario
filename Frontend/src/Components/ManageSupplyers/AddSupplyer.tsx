import React, { useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'
import ConfirmModal from '../ConfirmModal'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
`

const ModalCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`

const FormContent = styled.form`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  background-color: #f9fafb;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`

const Required = styled.span`
  color: #dc2626;
  margin-left: 2px;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.75rem;
`

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background-color: ${props => props.primary ? '#4f46e5' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  
  &:hover {
    background-color: ${props => props.primary ? '#4338ca' : '#f9fafb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

interface AddSupplyerProps {
  onClose: () => void;
  onBack: () => void;
  onSubmit: (supplier: { Name: string; phone_number: string; email: string }) => void;
}

export default function AddSupplyer({ onClose, onSubmit }: AddSupplyerProps) {
  const [formData, setFormData] = useState({ Name: '', phone_number: '', email: '' });
  const [errors, setErrors] = useState<{ Name?: string; phone_number?: string; email?: string }>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (formData.Name.length < 4) newErrors.Name = "Name must be at least 4 chars";
    if (formData.phone_number.length !== 10) newErrors.phone_number = "Phone must be 10 digits";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    onSubmit(formData);
    setIsConfirmOpen(false);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'phone_number') val = val.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <>
      <Overlay>
        <ModalCard>
          <Header>
            <Title>Add New Supplier</Title>
            <CloseButton onClick={onClose}><FaTimes size={20} /></CloseButton>
          </Header>
          <FormContent onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Supplier Name <Required>*</Required></Label>
              <Input 
                value={formData.Name} 
                onChange={handleChange('Name')} 
                placeholder="Business Name"
              />
              {errors.Name && <ErrorMessage>{errors.Name}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label>Phone Number <Required>*</Required></Label>
              <Input 
                value={formData.phone_number} 
                onChange={handleChange('phone_number')} 
                placeholder="10-digit number"
              />
              {errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Email Address <Required>*</Required></Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={handleChange('email')} 
                placeholder="contact@supplier.com"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
          </FormContent>
          <Footer>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary onClick={handleSubmit}>
              <FaSave /> Save Supplier
            </Button>
          </Footer>
        </ModalCard>
      </Overlay>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Supplier"
        content={`Add "${formData.Name}" to your supplier list?`}
        icon={FaSave}
        confirmText="Add Supplier"
      />
    </>
  )
}