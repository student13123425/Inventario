import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { SupplierResponse } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft, TbTrash } from 'react-icons/tb'
import ConfirmModal from '../ConfirmModal'

interface EditSupplierProps {
  item: SupplierResponse
  onBack: () => void
  onUpdate: (updatedSupplier: Partial<SupplierResponse>) => void
  onDelete: () => void
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

const Form = styled.form`
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
`

const LeftButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`

const RightButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`

const DeleteButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fee2e2;
    border-color: #fca5a5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`

const SubmitButton = styled.button<{ disabled?: boolean }>`
  padding: 0.75rem 2rem;
  background-color: ${props => props.disabled ? '#9ca3af' : '#4f46e5'};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.disabled ? '#9ca3af' : '#4338ca'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
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

const BackIcon = () => (
  <TbChevronLeft size={16} color="#4f46e5" />
)

const CheckIcon = () => (
  <TbCheck size={16} color="currentColor" />
)

const ErrorIcon = () => (
  <TbAlertCircle size={16} color="currentColor" />
)

const SaveIcon = () => (
  <TbCheck size={16} color="currentColor" />
)

const DeleteIcon = () => (
  <TbTrash size={16} color="currentColor" />
)

export default function EditSupplier(props: EditSupplierProps) {
  const [Name, setName] = useState(props.item.Name)
  const [Email, setEmail] = useState(props.item.email)
  const [Phone, setPhone] = useState(props.item.phone_number)
  const [errors, setErrors] = useState<{ 
    Name?: string; 
    email?: string; 
    phone_number?: string;
  }>({})
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)
  const [showErrorIndicator, setShowErrorIndicator] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [pendingUpdateData, setPendingUpdateData] = useState<Partial<SupplierResponse> | null>(null)

  const validateForm = () => {
    const newErrors: { Name?: string; email?: string; phone_number?: string } = {}
    
    const visibleName = Name.trim()
    if (!visibleName) {
      newErrors.Name = 'Supplier name is required'
    } else if (visibleName.length < 4) {
      newErrors.Name = 'Supplier name must be at least 4 characters long'
    }
    
    const phoneDigits = Phone.replace(/\D/g, '')
    if (!Phone) {
      newErrors.phone_number = 'Phone number is required'
    } else if (phoneDigits.length !== 10) {
      newErrors.phone_number = 'Phone number must be exactly 10 digits'
    }
    
    if (!Email) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    return newErrors
  }

  const hasChanges = () => {
    return (
      Name !== props.item.Name ||
      Email !== props.item.email ||
      Phone !== props.item.phone_number
    )
  }

  const isFormValid = () => {
    const formErrors = validateForm()
    return Object.keys(formErrors).length === 0
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    
    if (hasSubmitted && errors.Name) {
      setErrors(prev => ({ ...prev, Name: undefined }))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    
    if (hasSubmitted && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setPhone(value)
    
    if (hasSubmitted && errors.phone_number) {
      setErrors(prev => ({ ...prev, phone_number: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    
    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      const updateData = {
        Name: Name.trim(),
        email: Email,
        phone_number: Phone
      }
      
      // Show confirmation modal for save
      setPendingUpdateData(updateData)
      setIsSaveModalOpen(true)
    } else {
      setShowErrorIndicator(true)
      setShowSaveIndicator(false)
      const timer = setTimeout(() => {
        setShowErrorIndicator(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }

  const handleSaveConfirm = () => {
    if (pendingUpdateData) {
      props.onUpdate(pendingUpdateData)
      setShowSaveIndicator(true)
      setShowErrorIndicator(false)
      const timer = setTimeout(() => {
        setShowSaveIndicator(false)
      }, 2000)
    }
    setIsSaveModalOpen(false)
    setPendingUpdateData(null)
  }

  const handleSaveCancel = () => {
    setIsSaveModalOpen(false)
    setPendingUpdateData(null)
  }

  const handleCancel = () => {
    // Reset form to original values
    setName(props.item.Name)
    setEmail(props.item.email)
    setPhone(props.item.phone_number)
    setErrors({})
    setHasSubmitted(false)
    setShowSaveIndicator(false)
    setShowErrorIndicator(false)
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    props.onDelete()
    setIsDeleteModalOpen(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <Container>
        <Header>
          <BackButton onClick={props.onBack} type="button">
            <BackIcon />
            Back to Suppliers
          </BackButton>
        </Header>
        
        <Content>
          <Title>Edit Supplier</Title>
          
          <Form onSubmit={handleSubmit}>
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
              {hasSubmitted && errors.Name && (
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
              {hasSubmitted && errors.email && (
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
              {hasSubmitted && errors.phone_number && (
                <ErrorMessage>
                  <ErrorIcon />
                  {errors.phone_number}
                </ErrorMessage>
              )}
            </FormGroup>

            <ButtonGroup>
              <LeftButtonGroup>
                <DeleteButton type="button" onClick={handleDeleteClick}>
                  <DeleteIcon />
                  Delete Supplier
                </DeleteButton>
              </LeftButtonGroup>
              <RightButtonGroup>
                <CancelButton type="button" onClick={handleCancel}>
                  Cancel
                </CancelButton>
                <SubmitButton 
                  type="submit" 
                  disabled={!hasChanges()}
                >
                  <SaveIcon />
                  Save Changes
                </SubmitButton>
              </RightButtonGroup>
            </ButtonGroup>
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
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Supplier"
        content="Are you sure you want to delete this supplier? This action cannot be undone and will permanently remove all associated data."
        icon={TbTrash}
        confirmText="Delete Supplier"
        cancelText="Cancel"
      />
      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={handleSaveCancel}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
        title="Save Changes"
        content="Are you sure you want to save these changes to the supplier? This will update the supplier information in the system."
        icon={TbCheck}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </>
  )
}