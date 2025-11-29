import React, { useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
`

const FormContainer = styled.div`
  width: 90%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
  text-align: end;
`

const BackButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
    background-color: #f9fafb;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: #dc2626;
    background-color: #fef2f2;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 2rem;
  gap: 1.5rem;
  overflow-y: auto;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
`

const Required = styled.span`
  color: #dc2626;
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  &:hover {
    border-color: #9ca3af;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
`

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
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
    background-color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
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

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`

const FieldRequirements = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const BackIcon = styled(FaArrowLeft)`
  font-size: 1rem;
`

const SaveIcon = styled(FaSave)`
  font-size: 1rem;
`

const CloseIcon = styled(FaTimes)`
  font-size: 1rem;
`

interface AddSupplyerProps {
  onClose: () => void
  onBack: () => void
  onSubmit: (supplier: { Name: string; phone_number: string; email: string }) => void
}

export default function AddSupplyer({ onClose, onBack, onSubmit }: AddSupplyerProps) {
  const [formData, setFormData] = useState({
    Name: '',
    phone_number: '',
    email: ''
  })
  const [errors, setErrors] = useState<{ 
    Name?: string; 
    phone_number?: string; 
    email?: string;
  }>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: { Name?: string; phone_number?: string; email?: string } = {}
    
    // Supplier Name validation: at least 4 visible characters/symbols
    const visibleName = formData.Name.trim()
    if (!visibleName) {
      newErrors.Name = 'Supplier name is required'
    } else if (visibleName.length < 4) {
      newErrors.Name = 'Supplier name must be at least 4 characters long'
    }
    
    // Phone number validation: exactly 10 digits
    const phoneDigits = formData.phone_number.replace(/\D/g, '')
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required'
    } else if (phoneDigits.length !== 10) {
      newErrors.phone_number = 'Phone number must be exactly 10 digits'
    }
    
    // Email validation: must be valid format
    if (!formData.email) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    
    const formErrors = validateForm()
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length === 0) {
      onSubmit({
        Name: formData.Name.trim(),
        phone_number: formData.phone_number,
        email: formData.email
      })
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Phone number formatting: only allow digits and auto-format
    if (field === 'phone_number') {
      value = value.replace(/\D/g, '') // Remove non-digits
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors when user starts typing (only if we've already submitted)
    if (hasSubmitted && errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const isFormValid = () => {
    const visibleName = formData.Name.trim()
    const phoneDigits = formData.phone_number.replace(/\D/g, '')
    
    return (
      visibleName.length >= 4 &&
      phoneDigits.length === 10 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
  }

  return (
    <Overlay>
      <FormContainer>
        <Header>
          <BackButton onClick={onBack} type="button">
            <BackIcon />
            Back
          </BackButton>
          <Title>Add New Supplier</Title>
        </Header>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>
              Supplier Name <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={formData.Name}
              onChange={handleChange('Name')}
              placeholder="Enter supplier name (minimum 4 characters)"
              required
            />
            <FieldRequirements>Must be at least 4 characters long</FieldRequirements>
            {hasSubmitted && errors.Name && <ErrorMessage>{errors.Name}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>
              Phone Number <Required>*</Required>
            </Label>
            <Input
              type="tel"
              value={formData.phone_number}
              onChange={handleChange('phone_number')}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              required
            />
            <FieldRequirements>Must be exactly 10 digits</FieldRequirements>
            {hasSubmitted && errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>
              Email Address <Required>*</Required>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter valid email address"
              required
            />
            <FieldRequirements>Must be a valid email format</FieldRequirements>
            {hasSubmitted && errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>
          <ButtonGroup>
            <SubmitButton type="submit" disabled={false}>
              <SaveIcon />
              Save Supplier
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Overlay>
  )
}