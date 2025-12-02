import React, { useState, useEffect } from 'react' // Added useEffect
import styled from 'styled-components'
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'
import ConfirmModal from '../ConfirmModal'
import type { ProductPayload } from '../../script/objects'
import { isNation } from '../../script/utils'

// --- Styled Components (Unchanged) ---
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

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
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

interface AddProductProps {
  onClose: () => void
  onBack: () => void
  onSubmit: (product: ProductPayload) => void
}

export default function AddProduct({ onClose, onBack, onSubmit }: AddProductProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    nation_of_origin: '',
    product_bar_code: '',
    expiration_date: ''
  })
  
  const [errors, setErrors] = useState<{ 
    name?: string; 
    price?: string; 
    product_bar_code?: string;
    nation_of_origin?: string;
  }>({})
  
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<ProductPayload | null>(null)

  // KEYBOARD HANDLERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfirmModalOpen) {
          handleCancelSubmit();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmModalOpen, onClose]);

  const validateForm = () => {
    const newErrors: { name?: string; price?: string; product_bar_code?: string; nation_of_origin?: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required'
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number'
    }
    
    if (!formData.product_bar_code.trim()) {
      newErrors.product_bar_code = 'Barcode is required'
    }

    if (!formData.nation_of_origin.trim()) {
        newErrors.nation_of_origin = 'Nation of origin is required'
    } else if (!isNation(formData.nation_of_origin)) {
        newErrors.nation_of_origin = 'Invalid nation provided'
    }
    
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    
    const formErrors = validateForm()
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length === 0) {
      const expDate = formData.expiration_date ? new Date(formData.expiration_date).getTime() : undefined;

      const submitData: ProductPayload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        nation_of_origin: formData.nation_of_origin.trim(), 
        product_bar_code: formData.product_bar_code.trim(),
        expiration_date: expDate
      }
      
      setPendingFormData(submitData)
      setIsConfirmModalOpen(true)
    }
  }

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      onSubmit(pendingFormData)
      setIsConfirmModalOpen(false)
      setPendingFormData(null)
    }
  }

  const handleCancelSubmit = () => {
    setIsConfirmModalOpen(false)
    setPendingFormData(null)
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (hasSubmitted && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <Overlay>
        <FormContainer>
          <Header>
            <BackButton onClick={onBack} type="button">
              <BackIcon />
              Back
            </BackButton>
            <Title>Add New Product</Title>
            <CloseButton onClick={onClose} type="button">
              <CloseIcon />
            </CloseButton>
          </Header>
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Product Name <Required>*</Required></Label>
              <Input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Enter product name"
                required
              />
              {hasSubmitted && errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label>Price <Required>*</Required></Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange('price')}
                placeholder="0.00"
                required
              />
              {hasSubmitted && errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label>Barcode <Required>*</Required></Label>
              <Input
                type="text"
                value={formData.product_bar_code}
                onChange={handleChange('product_bar_code')}
                placeholder="Scan or enter barcode"
                required
              />
              {hasSubmitted && errors.product_bar_code && <ErrorMessage>{errors.product_bar_code}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label>Nation of Origin <Required>*</Required></Label>
              <Input
                type="text"
                value={formData.nation_of_origin}
                onChange={handleChange('nation_of_origin')}
                placeholder="e.g. USA, China"
                required
              />
              {hasSubmitted && errors.nation_of_origin && <ErrorMessage>{errors.nation_of_origin}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={handleChange('expiration_date')}
              />
            </InputGroup>

            <ButtonGroup>
              {/* REMOVED disabled prop to allow ENTER key to trigger submit & validation */}
              <SubmitButton type="submit">
                <SaveIcon />
                Save Product
              </SubmitButton>
            </ButtonGroup>
          </Form>
        </FormContainer>
      </Overlay>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        title="Add New Product"
        content="Are you sure you want to add this new product to the catalogue?"
        icon={FaSave}
        confirmText="Add Product"
        cancelText="Cancel"
      />
    </>
  )
}