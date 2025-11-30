import React, { useState } from 'react'
import styled from 'styled-components'
import type { ProductResponse, ProductPayload } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft, TbTrash } from 'react-icons/tb'
import ConfirmModal from '../ConfirmModal'

interface EditProductProps {
  item: ProductResponse
  onBack: () => void
  onUpdate: (updatedProduct: Partial<ProductPayload>) => void
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

const BackIcon = () => <TbChevronLeft size={16} color="#4f46e5" />
const CheckIcon = () => <TbCheck size={16} color="currentColor" />
const ErrorIcon = () => <TbAlertCircle size={16} color="currentColor" />
const SaveIcon = () => <TbCheck size={16} color="currentColor" />
const DeleteIcon = () => <TbTrash size={16} color="currentColor" />

export default function EditProduct(props: EditProductProps) {
  const [name, setName] = useState(props.item.name)
  const [price, setPrice] = useState(props.item.price.toString())
  const [barcode, setBarcode] = useState(props.item.product_bar_code)
  const [origin, setOrigin] = useState(props.item.nation_of_origin || '')
  
  // Convert timestamp to YYYY-MM-DD for input date
  const initialDate = props.item.expiration_date 
    ? new Date(props.item.expiration_date).toISOString().split('T')[0] 
    : '';
  const [expDate, setExpDate] = useState(initialDate)

  const [errors, setErrors] = useState<{ 
    name?: string; 
    price?: string; 
    barcode?: string;
  }>({})
  
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)
  const [showErrorIndicator, setShowErrorIndicator] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [pendingUpdateData, setPendingUpdateData] = useState<Partial<ProductPayload> | null>(null)

  const validateForm = () => {
    const newErrors: { name?: string; price?: string; barcode?: string } = {}
    
    if (!name.trim()) newErrors.name = 'Product name is required'
    
    if (!price) {
      newErrors.price = 'Price is required'
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Price must be a valid positive number'
    }
    
    if (!barcode.trim()) newErrors.barcode = 'Barcode is required'
    
    return newErrors
  }

  const hasChanges = () => {
    const currentTimestamp = expDate ? new Date(expDate).getTime() : undefined;
    return (
      name !== props.item.name ||
      parseFloat(price) !== props.item.price ||
      barcode !== props.item.product_bar_code ||
      origin !== (props.item.nation_of_origin || '') ||
      (currentTimestamp !== props.item.expiration_date && (expDate !== '' || props.item.expiration_date !== undefined))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    
    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      const timestamp = expDate ? new Date(expDate).getTime() : undefined;
      
      const updateData: Partial<ProductPayload> = {
        name: name.trim(),
        price: parseFloat(price),
        product_bar_code: barcode.trim(),
        nation_of_origin: origin.trim() || undefined,
        expiration_date: timestamp
      }
      
      setPendingUpdateData(updateData)
      setIsSaveModalOpen(true)
    } else {
      setShowErrorIndicator(true)
      setShowSaveIndicator(false)
      setTimeout(() => setShowErrorIndicator(false), 3000)
    }
  }

  const handleSaveConfirm = () => {
    if (pendingUpdateData) {
      props.onUpdate(pendingUpdateData)
      setShowSaveIndicator(true)
      setShowErrorIndicator(false)
      setTimeout(() => setShowSaveIndicator(false), 2000)
    }
    setIsSaveModalOpen(false)
    setPendingUpdateData(null)
  }

  const handleSaveCancel = () => {
    setIsSaveModalOpen(false)
    setPendingUpdateData(null)
  }

  const handleCancel = () => {
    setName(props.item.name)
    setPrice(props.item.price.toString())
    setBarcode(props.item.product_bar_code)
    setOrigin(props.item.nation_of_origin || '')
    const resetDate = props.item.expiration_date 
      ? new Date(props.item.expiration_date).toISOString().split('T')[0] 
      : '';
    setExpDate(resetDate)
    
    setErrors({})
    setHasSubmitted(false)
    setShowSaveIndicator(false)
    setShowErrorIndicator(false)
  }

  return (
    <>
      <Container>
        <Header>
          <BackButton onClick={props.onBack} type="button">
            <BackIcon />
            Back to Products
          </BackButton>
        </Header>
        
        <Content>
          <Title>Edit Product</Title>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="product-name">Product Name <Required>*</Required></Label>
              <Input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                hasError={!!errors.name}
              />
              {hasSubmitted && errors.name && <ErrorMessage><ErrorIcon />{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="product-price">Price <Required>*</Required></Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                hasError={!!errors.price}
              />
              {hasSubmitted && errors.price && <ErrorMessage><ErrorIcon />{errors.price}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="product-barcode">Barcode <Required>*</Required></Label>
              <Input
                id="product-barcode"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                hasError={!!errors.barcode}
              />
              {hasSubmitted && errors.barcode && <ErrorMessage><ErrorIcon />{errors.barcode}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="product-origin">Nation of Origin</Label>
              <Input
                id="product-origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. USA"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="product-exp">Expiration Date</Label>
              <Input
                id="product-exp"
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
            </FormGroup>

            <ButtonGroup>
              <LeftButtonGroup>
                <DeleteButton type="button" onClick={() => setIsDeleteModalOpen(true)}>
                  <DeleteIcon />
                  Delete Product
                </DeleteButton>
              </LeftButtonGroup>
              <RightButtonGroup>
                <CancelButton type="button" onClick={handleCancel}>Cancel</CancelButton>
                <SubmitButton type="submit" disabled={!hasChanges()}>
                  <SaveIcon />
                  Save Changes
                </SubmitButton>
              </RightButtonGroup>
            </ButtonGroup>
          </Form>

          <SaveIndicator $isVisible={showSaveIndicator}>
            <CheckIcon /> Changes saved successfully
          </SaveIndicator>

          <ErrorIndicator $isVisible={showErrorIndicator}>
            <ErrorIcon /> Please fix validation errors
          </ErrorIndicator>
        </Content>
      </Container>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          props.onDelete();
          setIsDeleteModalOpen(false);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone."
        icon={TbTrash}
        confirmText="Delete Product"
        cancelText="Cancel"
      />
      
      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={handleSaveCancel}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
        title="Save Changes"
        content="Are you sure you want to save these changes to the product?"
        icon={TbCheck}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </>
  )
}