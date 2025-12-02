import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { ProductResponse, ProductPayload, ProductSupplierResponse } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft, TbTrash } from 'react-icons/tb'
import ConfirmModal from '../ConfirmModal'
import { fetchProductSuppliers } from '../../script/network'
import { getToken } from '../../script/utils'
import LinkSupplier from './LinkSupplier'
import SupplierLinkerComponent from './SupplierLinkerComponent'

interface EditProductProps {
  item: ProductResponse
  onBack: () => void
  onUpdate: (updatedProduct: Partial<ProductPayload>) => void
  onDelete: () => void
}

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #f9fafb;
  padding: 2rem 5%;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 2rem auto;
`

const BackButton = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #4f46e5;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #eff6ff;
    border-color: #4f46e5;
  }
`

const EditorCard = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const Columns = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
    overflow-y: auto;
  }
`

const LeftPane = styled.div`
  flex: 1;
  padding: 2rem;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  min-width: 350px;

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 500px;
  }
`

const RightPane = styled.div`
  flex: 1.5;
  background-color: #f9fafb;
  overflow-y: auto;
  padding: 2rem;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`

const ActionButtons = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Button = styled.button<{ variant: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  ${p => p.variant === 'primary' ? `
    background: #4f46e5;
    color: white;
    border: none;
    &:hover { background: #4338ca; }
  ` : `
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    &:hover { background: #fee2e2; border-color: #ef4444; }
  `}
`

export default function EditProduct(props: EditProductProps) {
  // Initial date formatting
  const initialDate = props.item.expiration_date 
    ? new Date(props.item.expiration_date).toISOString().split('T')[0] 
    : '';

  const [formData, setFormData] = useState({
    name: props.item.name,
    price: props.item.price.toString(),
    product_bar_code: props.item.product_bar_code,
    nation_of_origin: props.item.nation_of_origin || '',
    expiration_date: initialDate
  });

  const [isNewLink, setIsNewLink] = useState(false);
  const [suppliers, setSuppliers] = useState<ProductSupplierResponse[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const loadSuppliers = async () => {
    const token = await getToken();
    if (token) {
      const res = await fetchProductSuppliers(token, props.item.ID);
      if (res.success) setSuppliers(res.suppliers);
    }
  };

  useEffect(() => { loadSuppliers(); }, [props.item.ID]);

  const handleUpdate = () => {
    const expDate = formData.expiration_date ? new Date(formData.expiration_date).getTime() : undefined;
    
    props.onUpdate({
      name: formData.name,
      price: parseFloat(formData.price),
      product_bar_code: formData.product_bar_code,
      nation_of_origin: formData.nation_of_origin || undefined,
      expiration_date: expDate
    });
    setIsSaveOpen(false);
  };

  if (isNewLink) {
    return (
      <LinkSupplier 
        item={props.item} 
        setIsNewLink={setIsNewLink} 
        onLinkSupplier={() => { 
          loadSuppliers(); 
          setIsNewLink(false); 
        }}
      />
    );
  }

  return (
    <>
      <PageContainer>
        <Header>
          <BackButton onClick={props.onBack}>
            <TbChevronLeft /> Back to Catalogue
          </BackButton>
        </Header>
        
        <EditorCard>
          <CardHeader>
            <Title>Edit Product: {props.item.name}</Title>
          </CardHeader>
          
          <Columns>
            <LeftPane>
              <FormGroup>
                <Label>Product Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Sale Price</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Barcode</Label>
                <Input 
                  value={formData.product_bar_code} 
                  onChange={e => setFormData({...formData, product_bar_code: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Nation of Origin</Label>
                <Input 
                  value={formData.nation_of_origin} 
                  onChange={e => setFormData({...formData, nation_of_origin: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Expiration Date</Label>
                <Input 
                  type="date"
                  value={formData.expiration_date} 
                  onChange={e => setFormData({...formData, expiration_date: e.target.value})} 
                />
              </FormGroup>

              <ActionButtons>
                <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
                  <TbTrash /> Delete
                </Button>
                <Button variant="primary" onClick={() => setIsSaveOpen(true)}>
                  <TbCheck /> Save Changes
                </Button>
              </ActionButtons>
            </LeftPane>

            <RightPane>
              <SupplierLinkerComponent 
                product={props.item}
                suppliers={suppliers}
                setIsNewLink={setIsNewLink}
                ForceReload={loadSuppliers}
              />
            </RightPane>
          </Columns>
        </EditorCard>
      </PageContainer>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={props.onDelete}
        title="Delete Product"
        content="Are you sure? This will remove the product and unlink all suppliers."
        confirmText="Delete"
        confirmColor="danger"
        icon={TbTrash}
      />

      <ConfirmModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onConfirm={handleUpdate}
        title="Save Changes"
        content="Confirm updating product details?"
        icon={TbCheck}
      />
    </>
  )
}