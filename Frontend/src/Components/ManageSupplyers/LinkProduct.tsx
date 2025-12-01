import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { TbChevronDown, TbChevronLeft, TbX, TbCheck, TbLink } from 'react-icons/tb'
import type { SupplierResponse, ProductResponse } from '../../script/objects'
import { fetchProducts, linkSupplierProduct, updateSupplierPricing } from '../../script/network'
import { getToken } from '../../script/utils'
import LoadingCard from '../../Pages/Private/LoadingCard'
import ConfirmModal from '../ConfirmModal'

interface LinkProductProps {
  item: SupplierResponse
  setIsNewLink: (value: boolean) => void
  onLinkProduct: (productId: number, supplierPrice: number, deliverySpeed: number) => void
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f9fafb;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  max-width: 800px;
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
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 2.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
`

const SupplierName = styled.span`
  font-weight: 600;
  color: #4f46e5;
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

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`

const DropdownButton = styled.button<{ hasError?: boolean; isOpen?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.hasError ? '#dc2626' : props.isOpen ? '#4f46e5' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${props => props.hasError ? '#dc2626' : '#9ca3af'};
  }

  ${props => props.isOpen && `
    box-shadow: 0 0 0 3px ${props.hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(79, 70, 229, 0.1)'};
  `}
`

const DropdownPlaceholder = styled.span`
  color: #9ca3af;
`

const DropdownValue = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const DropdownProductName = styled.span`
  color: #111827;
  font-weight: 500;
`

const DropdownProductDetails = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`

const ChevronIcon = styled(TbChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #6b7280;
  flex-shrink: 0;
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};

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

const DropdownItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`

const ProductItemName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`

const ProductItemDetails = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  flex-wrap: wrap;
`

const ProductItemDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const DetailLabel = styled.span`
  font-weight: 500;
  color: #374151;
`

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.hasError ? '#dc2626' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc2626' : '#4f46e5'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(79, 70, 229, 0.1)'};
  }

  &:hover {
    border-color: ${props => props.hasError ? '#dc2626' : '#9ca3af'};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
  margin-top: 1rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`

export default function LinkProduct(props: LinkProductProps) {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
  const [supplierPrice, setSupplierPrice] = useState('')
  const [supplierSku, setSupplierSku] = useState('')
  const [minOrderQuantity, setMinOrderQuantity] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [errors, setErrors] = useState<{
    product?: string
    supplierPrice?: string
    minOrderQuantity?: string
    leadTimeDays?: string
  }>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingLinkData, setPendingLinkData] = useState<any>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const token = await getToken()
        if (token) {
          const result = await fetchProducts(token)
          if (result.success) {
            setProducts(result.products)
          }
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const validateForm = () => {
    const newErrors: any = {}

    if (!selectedProduct) {
      newErrors.product = 'Please select a product'
    }

    if (!supplierPrice || parseFloat(supplierPrice) <= 0) {
      newErrors.supplierPrice = 'Supplier price must be greater than 0'
    }

    if (minOrderQuantity && parseInt(minOrderQuantity) < 1) {
      newErrors.minOrderQuantity = 'Minimum order quantity must be at least 1'
    }

    if (leadTimeDays && parseInt(leadTimeDays) < 0) {
      newErrors.leadTimeDays = 'Lead time cannot be negative'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0 && selectedProduct) {
      const linkData = {
        productId: selectedProduct.ID!,
        supplierPrice: parseFloat(supplierPrice),
        supplierSku: supplierSku || undefined,
        minOrderQuantity: minOrderQuantity ? parseInt(minOrderQuantity) : undefined,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : undefined,
      }

      setPendingLinkData(linkData)
      setIsConfirmModalOpen(true)
    }
  }

  const handleConfirmLink = async () => {
    if (!pendingLinkData || !selectedProduct) return

    try {
      const token = await getToken()
      if (token) {
        // First link the supplier to the product
        await linkSupplierProduct(token, {
          supplierId: props.item.ID,
          productId: pendingLinkData.productId
        })

        // Then update the pricing information
        await updateSupplierPricing(
          token,
          props.item.ID,
          pendingLinkData.productId,
          {
            supplier_price: pendingLinkData.supplierPrice,
            supplier_sku: pendingLinkData.supplierSku,
            min_order_quantity: pendingLinkData.minOrderQuantity,
            lead_time_days: pendingLinkData.leadTimeDays,
            is_active: true
          }
        )

        props.onLinkProduct(
          pendingLinkData.productId,
          pendingLinkData.supplierPrice,
          pendingLinkData.leadTimeDays || 0
        )
      }
    } catch (error) {
      console.error('Error linking product:', error)
    } finally {
      setIsConfirmModalOpen(false)
      setPendingLinkData(null)
    }
  }

  const handleCancelLink = () => {
    setIsConfirmModalOpen(false)
    setPendingLinkData(null)
  }

  const handleProductSelect = (product: ProductResponse) => {
    setSelectedProduct(product)
    setIsDropdownOpen(false)
    if (hasSubmitted && errors.product) {
      setErrors(prev => ({ ...prev, product: undefined }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (isLoading) {
    return <LoadingCard msg="Loading Products..." />
  }

  return (
    <>
      <Container>
        <Header>
          <BackButton onClick={() => props.setIsNewLink(false)} type="button">
            <TbChevronLeft size={16} />
            Back
          </BackButton>
        </Header>

        <Content>
          <Title>Link Product to Supplier</Title>
          <Subtitle>
            Adding product offering for <SupplierName>{props.item.Name}</SupplierName>
          </Subtitle>

          {products.length === 0 ? (
            <EmptyState>
              <p>No products available. Please create products first before linking them to suppliers.</p>
            </EmptyState>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>
                  Select Product <Required>*</Required>
                </Label>
                <DropdownContainer ref={dropdownRef}>
                  <DropdownButton
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    hasError={!!errors.product}
                    isOpen={isDropdownOpen}
                  >
                    {selectedProduct ? (
                      <DropdownValue>
                        <DropdownProductName>{selectedProduct.name}</DropdownProductName>
                        <DropdownProductDetails>
                          ID: {selectedProduct.ID} • {formatPrice(selectedProduct.price)} • {selectedProduct.nation_of_origin || 'Unknown origin'}
                        </DropdownProductDetails>
                      </DropdownValue>
                    ) : (
                      <DropdownPlaceholder>Select a product</DropdownPlaceholder>
                    )}
                    <ChevronIcon $isOpen={isDropdownOpen} size={20} />
                  </DropdownButton>
                  <DropdownMenu isOpen={isDropdownOpen}>
                    {products.map((product) => (
                      <DropdownItem
                        key={product.ID}
                        onClick={() => handleProductSelect(product)}
                      >
                        <ProductItemName>{product.name}</ProductItemName>
                        <ProductItemDetails>
                          <ProductItemDetail>
                            <DetailLabel>ID:</DetailLabel> {product.ID}
                          </ProductItemDetail>
                          <ProductItemDetail>
                            <DetailLabel>Price:</DetailLabel> {formatPrice(product.price)}
                          </ProductItemDetail>
                          <ProductItemDetail>
                            <DetailLabel>Origin:</DetailLabel> {product.nation_of_origin || 'Unknown'}
                          </ProductItemDetail>
                          <ProductItemDetail>
                            <DetailLabel>Barcode:</DetailLabel> {product.product_bar_code}
                          </ProductItemDetail>
                        </ProductItemDetails>
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </DropdownContainer>
                <InputHelpText>
                  Choose the product you want to link to this supplier
                </InputHelpText>
                {hasSubmitted && errors.product && (
                  <ErrorMessage>{errors.product}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  Supplier Price <Required>*</Required>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={supplierPrice}
                  onChange={(e) => {
                    setSupplierPrice(e.target.value)
                    if (hasSubmitted && errors.supplierPrice) {
                      setErrors(prev => ({ ...prev, supplierPrice: undefined }))
                    }
                  }}
                  placeholder="0.00"
                  hasError={!!errors.supplierPrice}
                />
                <InputHelpText>
                  The price at which this supplier offers the product
                </InputHelpText>
                {hasSubmitted && errors.supplierPrice && (
                  <ErrorMessage>{errors.supplierPrice}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Supplier SKU</Label>
                <Input
                  type="text"
                  value={supplierSku}
                  onChange={(e) => setSupplierSku(e.target.value)}
                  placeholder="Enter supplier's SKU (optional)"
                />
                <InputHelpText>
                  The supplier's internal product code or SKU
                </InputHelpText>
              </FormGroup>

              <FormGroup>
                <Label>Minimum Order Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={minOrderQuantity}
                  onChange={(e) => {
                    setMinOrderQuantity(e.target.value)
                    if (hasSubmitted && errors.minOrderQuantity) {
                      setErrors(prev => ({ ...prev, minOrderQuantity: undefined }))
                    }
                  }}
                  placeholder="1"
                  hasError={!!errors.minOrderQuantity}
                />
                <InputHelpText>
                  Minimum quantity required per order (optional)
                </InputHelpText>
                {hasSubmitted && errors.minOrderQuantity && (
                  <ErrorMessage>{errors.minOrderQuantity}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Lead Time (Days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={leadTimeDays}
                  onChange={(e) => {
                    setLeadTimeDays(e.target.value)
                    if (hasSubmitted && errors.leadTimeDays) {
                      setErrors(prev => ({ ...prev, leadTimeDays: undefined }))
                    }
                  }}
                  placeholder="7"
                  hasError={!!errors.leadTimeDays}
                />
                <InputHelpText>
                  Expected delivery time in days (optional)
                </InputHelpText>
                {hasSubmitted && errors.leadTimeDays && (
                  <ErrorMessage>{errors.leadTimeDays}</ErrorMessage>
                )}
              </FormGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => props.setIsNewLink(false)}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={!selectedProduct || !supplierPrice}>
                  <TbLink size={16} />
                  Link Product
                </SubmitButton>
              </ButtonGroup>
            </Form>
          )}
        </Content>
      </Container>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelLink}
        onConfirm={handleConfirmLink}
        onCancel={handleCancelLink}
        title="Link Product to Supplier"
        content={`Are you sure you want to link "${selectedProduct?.name}" to ${props.item.Name} with a supplier price of $${supplierPrice}? This will add the product to the supplier's offerings.`}
        icon={TbLink}
        confirmText="Link Product"
        cancelText="Cancel"
      />
    </>
  )
}