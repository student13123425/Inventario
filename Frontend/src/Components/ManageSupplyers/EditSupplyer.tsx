import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { SupplierResponse } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft } from 'react-icons/tb'

interface EditSupplierProps {
  item: SupplierResponse
  onBack: () => void
  onUpdate: (updatedSupplier: Partial<SupplierResponse>) => void
}

const Container = styled.div`
  width: 100vw;
  height: 100%;
  background-color: #f9fafb;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`

const BackButton = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #4f46e5;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #f3f4f6;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 2.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 2rem;
`

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  color: #111827;
  font-weight: 500;
  font-size: 0.875rem;
`

const Required = styled.span`
  color: #dc2626;
`

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#dc2626' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  max-width: 400px;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc2626' : '#4f46e5'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(79, 70, 229, 0.1)'};
  }

  &:hover {
    border-color: ${props => props.hasError ? '#dc2626' : '#9ca3af'};
  }
`

const InputHelpText = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SaveIndicator = styled.div<{ $isVisible: boolean }>`
  background-color: #059669;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;
  max-width: fit-content;
  margin-top: 1rem;
`

const ErrorIndicator = styled.div<{ $isVisible: boolean }>`
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;
  max-width: fit-content;
  margin-top: 1rem;
  border: 1px solid #fecaca;
`

export const BackIcon = () => (
  <TbChevronLeft size={16} color="#4f46e5" />
);

export const CheckIcon = () => (
  <TbCheck size={16} color="currentColor" />
);

export const ErrorIcon = () => (
  <TbAlertCircle size={16} color="currentColor" />
);

export default function EditSupplier(props: EditSupplierProps) {
  const [Name, setName] = useState(props.item.Name);
  const [Email, setEmail] = useState(props.item.email);
  const [Phone, setPhone] = useState(props.item.phone_number);
  const [errors, setErrors] = useState<{ 
    Name?: string; 
    email?: string; 
    phone_number?: string;
  }>({});
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [showErrorIndicator, setShowErrorIndicator] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const validateForm = () => {
    const newErrors: { Name?: string; email?: string; phone_number?: string } = {};
    
    const visibleName = Name.trim();
    if (!visibleName) {
      newErrors.Name = 'Supplier name is required';
    } else if (visibleName.length < 4) {
      newErrors.Name = 'Supplier name must be at least 4 characters long';
    }
    
    const phoneDigits = Phone.replace(/\D/g, '');
    if (!Phone) {
      newErrors.phone_number = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      newErrors.phone_number = 'Phone number must be exactly 10 digits';
    }
    
    if (!Email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasChanged(true);
    
    if (errors.Name) {
      setErrors(prev => ({ ...prev, Name: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setHasChanged(true);
    
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
    setHasChanged(true);
    
    if (errors.phone_number) {
      setErrors(prev => ({ ...prev, phone_number: undefined }));
    }
  };

  useEffect(() => {
    if (hasChanged) {
      const formErrors = validateForm();
      setErrors(formErrors);

      if (Object.keys(formErrors).length === 0) {
        const updateData = {
          Name: Name.trim(),
          email: Email,
          phone_number: Phone
        };

        props.onUpdate(updateData);

        setShowSaveIndicator(true);
        setShowErrorIndicator(false);
        const timer = setTimeout(() => {
          setShowSaveIndicator(false);
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        setShowErrorIndicator(true);
        setShowSaveIndicator(false);
        const timer = setTimeout(() => {
          setShowErrorIndicator(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [Name, Email, Phone, hasChanged]);

  return (
    <Container>
      <Header>
        <BackButton onClick={props.onBack}>
          <BackIcon />
          Back to Suppliers
        </BackButton>
      </Header>
      
      <Content>
        <Title>Edit Supplier</Title>
        
        <Form>
          <FormGroup>
            <Label htmlFor="supplier-name">
              Supplier Name <Required>*</Required>
            </Label>
            <Input
              id="supplier-name"
              type="text"
              value={Name}
              onChange={handleNameChange}
              placeholder="Enter supplier name (minimum 4 characters)"
              hasError={!!errors.Name}
            />
            <InputHelpText>
              Must be at least 4 characters long
            </InputHelpText>
            {errors.Name && (
              <ErrorMessage>
                <ErrorIcon />
                {errors.Name}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="supplier-email">
              Email Address <Required>*</Required>
            </Label>
            <Input
              id="supplier-email"
              type="email"
              value={Email}
              onChange={handleEmailChange}
              placeholder="supplier@example.com"
              hasError={!!errors.email}
            />
            <InputHelpText>
              Must be a valid email format
            </InputHelpText>
            {errors.email && (
              <ErrorMessage>
                <ErrorIcon />
                {errors.email}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="supplier-phone">
              Phone Number <Required>*</Required>
            </Label>
            <Input
              id="supplier-phone"
              type="tel"
              value={Phone}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              hasError={!!errors.phone_number}
            />
            <InputHelpText>
              Must be exactly 10 digits
            </InputHelpText>
            {errors.phone_number && (
              <ErrorMessage>
                <ErrorIcon />
                {errors.phone_number}
              </ErrorMessage>
            )}
          </FormGroup>
        </Form>

        <SaveIndicator $isVisible={showSaveIndicator}>
          <CheckIcon />
          Changes saved successfully
        </SaveIndicator>

        <ErrorIndicator $isVisible={showErrorIndicator}>
          <ErrorIcon />
          Please fix validation errors to save changes
        </ErrorIndicator>
      </Content>
    </Container>
  )
}