import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { ProductResponse, ProductPayload, ProductSupplierResponse } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft, TbTrash, TbUnlink } from 'react-icons/tb'
import ConfirmModal from '../ConfirmModal'
import { fetchProductSuppliers } from '../../script/network'
import { getToken } from '../../script/utils'
import LoadingCard from '../../Pages/Private/LoadingComponentInline'
import LinkSupplier from './LinkSupplier'
import SupplierLinkerComponent from './SupplierLinkerComponent'
import { unlinkSupplierProduct } from '../../script/network'

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
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem - 2.5rem - 2.5rem); /* Account for padding and margins */
  max-height: 800px;
`

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 2rem;
  flex-shrink: 0;
`

const ColumnsContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex: 1;
  overflow: hidden;
  margin-bottom: 2rem;
`

const LeftColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid #e5e7eb;
  padding-left: 2rem;
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 100%;
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
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
  width: 100%;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  color: #6b7280;
  font-size: 1rem;
  height: 100%;
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const loadProductSuppliers = async (setIsLoading:Function, setSuppliersError:Function, setSuppliers:Function, productId: number) => {
  try {
    setIsLoading(true)
    setSuppliersError(null)
    const token = await getToken()
    if (token) {
      const result = await fetchProductSuppliers(token, productId)
      if (result.success) {
        setSuppliers(result.suppliers)
      } else {
        setSuppliersError('Failed to load product suppliers')
      }
    } else {
      setSuppliersError('Authentication required')
    }
  } catch (error) {
    console.error('Error fetching product suppliers:', error)
    setSuppliersError('Failed to load product suppliers')
  } finally {
    setIsLoading(false)
  }
}

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

  const [IsNewLink, setIsNewLink] = useState<boolean>(false)
  const [suppliers, setSuppliers] = useState<ProductSupplierResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [suppliersError, setSuppliersError] = useState<string | null>(null)
  
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
  
  // State for unlink modal
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false)
  const [supplierToUnlink, setSupplierToUnlink] = useState<ProductSupplierResponse | null>(null)
  const [isUnlinking, setIsUnlinking] = useState(false)

  useEffect(() => {
    loadProductSuppliers(setIsLoading, setSuppliersError, setSuppliers, props.item.ID)
  }, [props.item.ID])

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

  const handleLinkSupplier = async (supplierId: number, supplierPrice: number, deliverySpeed: number) => {
    console.log('Linking supplier:', { supplierId, supplierPrice, deliverySpeed })
    
    try {
      // Refresh the suppliers list after successful linking
      setIsLoading(true);
      const token = await getToken();
      if (token) {
        const result = await fetchProductSuppliers(token, props.item.ID);
        if (result.success) {
          setSuppliers(result.suppliers);
        } else {
          setSuppliersError('Failed to load updated suppliers');
        }
      }
    } catch (error) {
      console.error('Error refreshing suppliers after linking:', error);
      setSuppliersError('Failed to refresh suppliers');
    } finally {
      setIsLoading(false);
      setIsNewLink(false); // Close the link form
    }
  }

  // Handle unlink request from SupplierLinkerComponent
  const handleUnlinkRequest = (supplier: ProductSupplierResponse) => {
    setSupplierToUnlink(supplier)
    setIsUnlinkModalOpen(true)
  }

  // Handle unlink confirmation
  const handleUnlinkConfirm = async () => {
    if (!supplierToUnlink) return
    
    try {
      setIsUnlinking(true)
      const token = await getToken()
      if (token) {
        await unlinkSupplierProduct(token, supplierToUnlink.ID, props.item.ID)
        // Refresh the suppliers list
        await loadProductSuppliers(setIsLoading, setSuppliersError, setSuppliers, props.item.ID)
        setIsUnlinkModalOpen(false)
        setSupplierToUnlink(null)
      }
    } catch (error) {
      console.error('Error unlinking supplier:', error)
      // You might want to show an error message here
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleUnlinkCancel = () => {
    setIsUnlinkModalOpen(false)
    setSupplierToUnlink(null)
  }

  if (IsNewLink) 
    return <LinkSupplier item={props.item} setIsNewLink={setIsNewLink} onLinkSupplier={handleLinkSupplier}/>

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
          
          <ColumnsContainer>
            {/* Left Column - Form Inputs */}
            <LeftColumn>
              <FormContainer>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label htmlFor="product-name">
                      Product Name <Required>*</Required>
                    </Label>
                    <Input
                      id="product-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                      hasError={!!errors.name}
                    />
                    <InputHelpText>
                      Name of the product
                    </InputHelpText>
                    {hasSubmitted && errors.name && (
                      <ErrorMessage>
                        <ErrorIcon />
                        {errors.name}
                      </ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="product-price">
                      Price <Required>*</Required>
                    </Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      hasError={!!errors.price}
                    />
                    <InputHelpText>
                      Sale price of the product
                    </InputHelpText>
                    {hasSubmitted && errors.price && (
                      <ErrorMessage>
                        <ErrorIcon />
                        {errors.price}
                      </ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="product-barcode">
                      Barcode <Required>*</Required>
                    </Label>
                    <Input
                      id="product-barcode"
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Product barcode"
                      hasError={!!errors.barcode}
                    />
                    <InputHelpText>
                      Unique product identifier
                    </InputHelpText>
                    {hasSubmitted && errors.barcode && (
                      <ErrorMessage>
                        <ErrorIcon />
                        {errors.barcode}
                      </ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="product-origin">
                      Nation of Origin
                    </Label>
                    <Input
                      id="product-origin"
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. USA"
                    />
                    <InputHelpText>
                      Country where the product is manufactured
                    </InputHelpText>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="product-exp">
                      Expiration Date
                    </Label>
                    <Input
                      id="product-exp"
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                    />
                    <InputHelpText>
                      Optional expiration date for the product
                    </InputHelpText>
                  </FormGroup>
                </Form>
              </FormContainer>
            </LeftColumn>

            {/* Right Column - Supplier Linker Component */}
            <RightColumn>
              {isLoading ? (
                <LoadingContainer>
                  <LoadingCard msg='Loading Suppliers'/>
                </LoadingContainer>
              ) : suppliersError ? (
                <LoadingContainer>Error: {suppliersError}</LoadingContainer>
              ) : (
                <SupplierLinkerComponent
                  ForceReload={() => {
                    loadProductSuppliers(setIsLoading, setSuppliersError, setSuppliers, props.item.ID)
                  }}
                  onUnlinkRequest={handleUnlinkRequest}
                  product={props.item}
                  suppliers={suppliers}
                  setIsNewLink={setIsNewLink}
                />
              )}
            </RightColumn>
          </ColumnsContainer>

          {/* Buttons positioned under both columns */}
          <ButtonGroup>
            <LeftButtonGroup>
              <DeleteButton type="button" onClick={handleDeleteClick}>
                <DeleteIcon />
                Delete Product
              </DeleteButton>
            </LeftButtonGroup>
            <RightButtonGroup>
              <CancelButton type="button" onClick={handleCancel}>
                Cancel
              </CancelButton>
              <SubmitButton 
                type="submit" 
                disabled={!hasChanges()}
                onClick={handleSubmit}
              >
                <SaveIcon />
                Save Changes
              </SubmitButton>
            </RightButtonGroup>
          </ButtonGroup>

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
      
      {/* Delete Product Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone and will permanently remove all associated data."
        icon={TbTrash}
        confirmText="Delete Product"
        cancelText="Cancel"
        confirmColor="danger"
      />
      
      {/* Save Changes Modal */}
      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={handleSaveCancel}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
        title="Save Changes"
        content="Are you sure you want to save these changes to the product? This will update the product information in the system."
        icon={TbCheck}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
      
      {/* Unlink Supplier Modal */}
      <ConfirmModal
        isOpen={isUnlinkModalOpen}
        onClose={handleUnlinkCancel}
        onConfirm={handleUnlinkConfirm}
        onCancel={handleUnlinkCancel}
        title="Unlink Supplier"
        content={`Are you sure you want to unlink "${supplierToUnlink?.Name}" from this product? This supplier will no longer provide this product.`}
        icon={TbUnlink}
        confirmText="Unlink Supplier"
        cancelText="Cancel"
        isConfirming={isUnlinking}
        confirmColor="danger"
      />
    </>
  )
}