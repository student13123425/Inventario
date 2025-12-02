import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../../script/network';
import { getToken } from '../../script/utils';
import type { ProductResponse, ProductPayload } from '../../script/objects';
import LoadingComponent from './LoadingCard';
import { FaTimesCircle, FaPlus } from 'react-icons/fa';
import { TbPackage } from 'react-icons/tb';
import AddProduct from '../../Components/ProductCatalogue/AddProduct';
import EditProduct from '../../Components/ProductCatalogue/EditProduct';
import ProductItem from '../../Components/ProductCatalogue/ProductItem';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  padding: 2rem 5%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
`

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const SubTitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  color: white;
  background-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);

  &:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`

const Card = styled.div`
  width: 100%;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 1.5rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 700;
  color: #111827;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const ListContent = styled.div`
  background-color: #f9fafb;
  min-height: 400px;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  gap: 1.5rem;
  text-align: center;
`

const EmptyText = styled.p`
  font-size: 1rem;
  max-width: 400px;
  line-height: 1.5;
  margin: 0;
`

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
async function getProducts(setProducts: Function, setError: Function) {
  try {
    const token = await getToken();
    if (token) {
      const out = await fetchProducts(token);
      if (out.success == true)
        setProducts(out.products);
      else
        setError("Failed getting products")
    }
  } catch (e) {
    setError("Failed getting products")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ManageProducts(props: { setError: Function }) {
  const [Products, setProducts] = useState<ProductResponse[] | null>(null);
  const [IsAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [IsEditingProduct, setIsEditingProduct] = useState<null | ProductResponse>(null);

  useEffect(() => {
    getProducts(setProducts, props.setError)
  }, [props.setError])
  
  if (Products === null)
    return <LoadingComponent msg='Loading Products...' />

  if (IsAddingProduct)
    return <AddProduct
      onBack={() => setIsAddingProduct(false)} 
      onClose={() => setIsAddingProduct(false)} 
      onSubmit={async (product: ProductPayload) => {
        const token = await getToken();
        if (token) {
          await createProduct(token, product)
          await getProducts(setProducts, props.setError)
        }
        setIsAddingProduct(false);
      }}
    />

  if (IsEditingProduct !== null)
    return <EditProduct
      item={IsEditingProduct}
      onBack={() => setIsEditingProduct(null)}
      onDelete={async () => {
        const token = await getToken();
        if (token !== null && IsEditingProduct.ID) {
          await deleteProduct(token, IsEditingProduct.ID)
          setIsEditingProduct(null)
          await getProducts(setProducts, props.setError)
        }
      }} 
      onUpdate={async (data: Partial<ProductPayload> | null) => {
        if (data === null) return;
        const token = await getToken()
        if (token && IsEditingProduct.ID) {
          updateProduct(token, IsEditingProduct.ID, data);
          setIsEditingProduct(null)
          await getProducts(setProducts, props.setError)
        }
      }} 
    />

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <div>
            <PageTitle>Product Catalogue</PageTitle>
            <SubTitle>Manage your inventory items, pricing, and details.</SubTitle>
          </div>
          <AddButton onClick={() => setIsAddingProduct(true)}>
            <FaPlus /> Add New Product
          </AddButton>
        </HeaderSection>

        <Card>
          <CardHeader>
            <TbPackage size={24} color="#4f46e5" />
            Product List
          </CardHeader>
          <ListContent>
            {Products.length === 0 ? (
              <EmptyState>
                <FaTimesCircle size={48} color="#d1d5db" />
                <EmptyText>There are no products in the catalogue at the moment. Add your first product to get started.</EmptyText>
              </EmptyState>
            ) : (
              <div>
                {Products.map((it, i) => (
                  <ProductItem
                    setEditing={setIsEditingProduct} 
                    index={i} 
                    item={it} 
                    key={i} 
                  />
                ))}
              </div>
            )}
          </ListContent>
        </Card>
      </ContentWrapper>
    </PageContainer>
  )
}