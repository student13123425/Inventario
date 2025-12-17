import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createSupplier, deleteSupplier, fetchSuppliers, updateSupplier, fetchSupplierProducts } from '../../script/network';
import { getToken } from '../../script/utils';
import type { SupplierResponse, SupplierProductResponse } from '../../script/objects';
import LoadingComponent from './LoadingCard';
import { FaTimesCircle, FaPlus } from 'react-icons/fa';
import { TbBuildingStore } from 'react-icons/tb';
import AddSupplyer from '../../Components/ManageSupplyers/AddSupplyer';
import EditSupplyer from '../../Components/ManageSupplyers/EditSupplyer';
import SupplyerItem from '../../Components/ManageSupplyers/SupplyerItem';

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

interface SupplierWithProducts extends SupplierResponse {
  products: SupplierProductResponse[];
}

async function getSuppliers(setSuppliers: (s: SupplierWithProducts[]) => void, setError: (msg: string) => void) {
  try {
    const token = await getToken();
    if (token) {
      const out = await fetchSuppliers(token);
      if (out.success) {
        const suppliersWithProducts = await Promise.all(
          out.suppliers.map(async (supplier: SupplierResponse) => {
            try {
              const productsOut = await fetchSupplierProducts(token, supplier.ID);
              return {
                ...supplier,
                products: productsOut.success ? productsOut.products : []
              };
            } catch (e) {
              console.error(`Failed to fetch products for supplier ${supplier.ID}`, e);
              return { ...supplier, products: [] };
            }
          })
        );
        setSuppliers(suppliersWithProducts);
      } else {
        setError("Failed getting suppliers");
      }
    }
  } catch (e) {
    setError("Failed getting suppliers");
  }
}

export default function ManageSupplyers(props: { setError: Function }) {
  const [suppliers, setSuppliers] = useState<SupplierWithProducts[] | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierWithProducts | null>(null);

  useEffect(() => {
    getSuppliers(setSuppliers, props.setError as any);
  }, [props.setError]);

  const handleDelete = async (id: number) => {
    const token = await getToken();
    if (token) {
      await deleteSupplier(token, id);
      await getSuppliers(setSuppliers, props.setError as any);
    }
  };

  if (suppliers === null) return <LoadingComponent msg='Loading Suppliers...' />;

  if (isAddingSupplier) {
    return (
      <AddSupplyer 
        onBack={() => setIsAddingSupplier(false)} 
        onClose={() => setIsAddingSupplier(false)} 
        onSubmit={async (supplierData) => {
          const token = await getToken();
          if (token) {
            await createSupplier(token, supplierData);
            await getSuppliers(setSuppliers, props.setError as any);
          }
          setIsAddingSupplier(false);
        }}
      />
    );
  }

  if (editingSupplier) {
    return (
      <EditSupplyer 
        item={editingSupplier}
        onBack={() => setEditingSupplier(null)}
        onDelete={async () => {
          await handleDelete(editingSupplier.ID);
          setEditingSupplier(null);
        }}
        onUpdate={async (data) => {
          if (!data) return;
          const token = await getToken();
          if (token) {
            await updateSupplier(token, editingSupplier.ID, data);
            setEditingSupplier(null);
            await getSuppliers(setSuppliers, props.setError as any);
          }
        }}
      />
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <div>
            <PageTitle>Suppliers</PageTitle>
            <SubTitle>Manage your supply chain partners and their product offerings.</SubTitle>
          </div>
          <AddButton onClick={() => setIsAddingSupplier(true)}>
            <FaPlus /> Register New Supplier
          </AddButton>
        </HeaderSection>

        <Card>
          <CardHeader>
            <TbBuildingStore size={24} color="#4f46e5" />
            Registered Suppliers
          </CardHeader>
          <ListContent>
            {suppliers.length === 0 ? (
              <EmptyState>
                <FaTimesCircle size={48} color="#d1d5db" />
                <EmptyText>No suppliers found. Add your first supplier to start linking products.</EmptyText>
              </EmptyState>
            ) : (
              <div>
                {suppliers.map((item, index) => (
                  <SupplyerItem 
                    key={item.ID} 
                    index={index} 
                    item={item} 
                    setEditing={setEditingSupplier} 
                    products={item.products} 
                    onDelete={() => handleDelete(item.ID)}
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