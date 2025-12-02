import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { SupplierResponse, SupplierProductResponse } from '../../script/objects'
import { TbAlertCircle, TbCheck, TbChevronLeft, TbTrash } from 'react-icons/tb'
import ConfirmModal from '../ConfirmModal'
import ProductLinkerCompoent from "./ProductLinkerCompoent"
import LinkProduct from './LinkProduct'
import { fetchSupplierProducts } from '../../script/network'
import { getToken } from '../../script/utils'

interface EditSupplierProps {
  item: SupplierResponse
  onBack: () => void
  onUpdate: (updatedSupplier: Partial<SupplierResponse>) => void
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

export default function EditSupplier(props: EditSupplierProps) {
  const [formData, setFormData] = useState({
    Name: props.item.Name,
    email: props.item.email,
    phone_number: props.item.phone_number
  });
  
  const [isNewLink, setIsNewLink] = useState(false);
  const [products, setProducts] = useState<SupplierProductResponse[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const loadProducts = async () => {
    const token = await getToken();
    if (token) {
      const res = await fetchSupplierProducts(token, props.item.ID);
      if (res.success) setProducts(res.products);
    }
  };

  useEffect(() => { loadProducts(); }, [props.item.ID]);

  const handleUpdate = () => {
    props.onUpdate(formData);
    setIsSaveOpen(false);
  };

  if (isNewLink) {
    return (
      <LinkProduct 
        item={props.item} 
        setIsNewLink={setIsNewLink} 
        onLinkProduct={() => { 
          loadProducts(); 
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
            <TbChevronLeft /> Back to Suppliers
          </BackButton>
        </Header>
        
        <EditorCard>
          <CardHeader>
            <Title>Edit Supplier: {props.item.Name}</Title>
          </CardHeader>
          
          <Columns>
            <LeftPane>
              <FormGroup>
                <Label>Supplier Name</Label>
                <Input 
                  value={formData.Name} 
                  onChange={e => setFormData({...formData, Name: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Email Address</Label>
                <Input 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Phone Number</Label>
                <Input 
                  value={formData.phone_number} 
                  onChange={e => setFormData({...formData, phone_number: e.target.value})} 
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
              <ProductLinkerCompoent 
                supplier={props.item}
                products={products}
                setIsNewLink={setIsNewLink}
                ForceReload={loadProducts}
              />
            </RightPane>
          </Columns>
        </EditorCard>
      </PageContainer>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={props.onDelete}
        title="Delete Supplier"
        content="Are you sure? This will remove the supplier and unlink all products."
        confirmText="Delete"
        confirmColor="danger"
        icon={TbTrash}
      />

      <ConfirmModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onConfirm={handleUpdate}
        title="Save Changes"
        content="Confirm updating supplier details?"
        icon={TbCheck}
      />
    </>
  )
}