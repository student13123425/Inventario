  import React, { useState } from 'react'
  import type { SupplierProductResponse, SupplierResponse } from '../../script/objects';
  import styled from 'styled-components';
  import { FaPlus } from 'react-icons/fa';
  import { TbUnlink, TbCubeOff } from 'react-icons/tb';
  import { MdEdit } from 'react-icons/md';
  import { unlinkSupplierProduct } from '../../script/network';
  import { getToken } from '../../script/utils';
  import ConfirmModal from '../ConfirmModal';

  const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1.5rem;
  `

  const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `

  const SectionTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  `

  const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #eff6ff;
    color: #4f46e5;
    border: 1px solid #dbeafe;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #dbeafe;
      border-color: #bfdbfe;
    }
  `

  const ProductList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `

  const ProductCard = styled.div`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &:hover {
      border-color: #4f46e5;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  `

  const ProductInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  `

  const Name = styled.span`
    font-weight: 600;
    color: #111827;
    font-size: 0.95rem;
  `

  const Meta = styled.div`
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #6b7280;
  `

  const Price = styled.span`
    color: #059669;
    font-weight: 500;
  `

  const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
  `

  const IconButton = styled.button`
    width: 2.25rem;
    height: 2.25rem;  
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  `

  const EditBtn = styled(IconButton)`
    color: #4f46e5;
    &:hover {
      background-color: #e0e7ff;
      border-color: #4f46e5;
    }
  `

  const UnlinkBtn = styled(IconButton)`
    color: #dc2626;
    &:hover {
      background-color: #fee2e2;
      border-color: #dc2626;
    }
  `

  const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #9ca3af;
    background: white;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    gap: 1rem;
  `

  interface Props {
    products: SupplierProductResponse[];
    supplier: SupplierResponse;
    setIsNewLink: (v: boolean) => void;
    ForceReload: () => Promise<void>;
    // setEdit: (ids: [number, number]) => void;
  }

  export default function ProductLinkerComponent(props: Props) {
    const [productToUnlink, setProductToUnlink] = useState<SupplierProductResponse | null>(null);
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

    const initiateUnlink = (product: SupplierProductResponse) => {
      setProductToUnlink(product);
      setIsUnlinkModalOpen(true);
    };

    const confirmUnlink = async () => {
      if (!productToUnlink) return;
      
      const token = await getToken();
      if (token) {
        await unlinkSupplierProduct(token, props.supplier.ID, productToUnlink.ID);
        await props.ForceReload();
      }
      setIsUnlinkModalOpen(false);
      setProductToUnlink(null);
    };

    return (
      <>
        <Container>
          <Header>
            <SectionTitle>Product Offerings</SectionTitle>
            <AddButton onClick={() => props.setIsNewLink(true)}>
              <FaPlus size={12} /> Add Product
            </AddButton>
          </Header>

          {props.products.length === 0 ? (
            <EmptyState>
              <TbCubeOff size={40} />
              <span>No products linked to this supplier yet.</span>
            </EmptyState>
          ) : (
            <ProductList>
              {props.products.map(p => (
                <ProductCard key={p.ID}>
                  <ProductInfo>
                    <Name>{p.name}</Name>
                    <Meta>
                      <Price>${p.supplier_price}</Price>
                      {p.supplier_sku && <span>SKU: {p.supplier_sku}</span>}
                      {p.lead_time_days && <span>Lead: {p.lead_time_days} days</span>}
                    </Meta>
                  </ProductInfo>
                  <ActionButtons>
                    {/* Pass [ProductID, SupplierID] */}
                    {/* <EditBtn onClick={() => props.setEdit([p.ID, props.supplier.ID])} title="Edit Link Details">
                      <MdEdit size={18} />
                    </EditBtn> */}
                    <UnlinkBtn onClick={() => initiateUnlink(p)} title="Unlink Product">
                      <TbUnlink size={18} />
                    </UnlinkBtn>
                  </ActionButtons>
                </ProductCard>
              ))}
            </ProductList>
          )}
        </Container>

        <ConfirmModal
          isOpen={isUnlinkModalOpen}
          onClose={() => setIsUnlinkModalOpen(false)}
          onConfirm={confirmUnlink}
          title="Unlink Product"
          content={`Are you sure you want to unlink "${productToUnlink?.name}" from this supplier?`}
          icon={TbUnlink}
          confirmText="Unlink"
          confirmColor="danger"
        />
      </>
    )
  }