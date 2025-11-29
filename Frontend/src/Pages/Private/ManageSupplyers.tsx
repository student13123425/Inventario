import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createSupplier, fetchSuppliers } from '../../script/network';
import { getToken } from '../../script/utils';
import type { SupplierResponse } from '../../script/objects';
import LoadingComponent from './LoadingComponent';
import { FaTimesCircle, FaPlus } from 'react-icons/fa';
import SupplyerItem from '../../Components/ManageSupplyers/SupplyerItem';
import AddSupplyer from '../../Components/ManageSupplyers/AddSupplyer';
import EditSupplyer from '../../Components/ManageSupplyers/EditSupplyer';

const Container = styled.div`
  width: 100vw;
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
`

const ContainerInner = styled.div`
  margin: 0 auto;
  width: 1200px;
  max-width: 90vw;
  display: flex;
  padding: 2rem 0;
  gap: 2rem;
  min-height: calc(100vh - 4rem);
  
  @media (max-width: 768px) {
    max-width: 95vw;
    padding: 1rem 0;
    gap: 1rem;
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
  transition: all 0.3s ease;
`

const BtnContainer = styled.div`
  width: 100%;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #f3f4f6;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const TitleContainer = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #0001;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid #f3f4f6;
  user-select: none;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1.25rem;
  }
`

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem 0;
  padding: 10px;
  gap: 10px;
  @media (max-width: 768px) {
    max-height: 500px;
    padding: 0.5rem 0;
  }
`

const Button = styled.button`
  height: 3rem;
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
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(79, 70, 229, 0.05);
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`

const Hide = styled.div`
  display: none;
`

const EmptyList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 3rem 2rem;
  color: #6b7280;
`

const EmptyIcon = styled(FaTimesCircle)`
  color: #dc2626;
  font-size: 4rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`

const Text = styled.div`
  width: 100%;
  max-width: 400px;
  font-size: 1.125rem;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 300px;
  }
`

const SubText = styled.div`
  width: 100%;
  max-width: 400px;
  font-size: 0.875rem;
  text-align: center;
  color: #9ca3af;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 300px;
  }
`

const AddIcon = styled(FaPlus)`
  font-size: 1rem;
`

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
async function getSupplyers(setSuppliers: Function, setError: Function) {
  try {
    const token = await getToken();
    if (token) {
      const out = await fetchSuppliers(token);
      if (out.success == true)
        setSuppliers(out.suppliers);
      else
        setError("Failed getting suppliers")
    }
  } catch (e) {
    setError("Failed getting suppliers")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ManageSupplyers(props: { setError: Function }) {
  const [Supplyers, setSuppliers] = useState<SupplierResponse[] | null>(null);
  const [IsAddingSupplyers,setIsAddingSupplyers]=useState<boolean>(false);
  const [IsEditingSupplyer,setIsEditingSupplyer]=useState<null|SupplierResponse>(null);
  useEffect(() => {
    getSupplyers(setSuppliers, props.setError)
  }, [props.setError])
  console.log(Supplyers);
  
  if (Supplyers === null)
    return <LoadingComponent msg='Loading Suppliers...' />
  if(IsAddingSupplyers)
    return <AddSupplyer onBack={()=>setIsAddingSupplyers(false)} onClose={()=>setIsAddingSupplyers(false)} onSubmit={async (supplyer: { Name: string; phone_number?: string; email?: string })=>{
      const token=await getToken();
      if(token){
        await createSupplier(token,{Name:supplyer.Name,email:supplyer.email,phone_number:supplyer.phone_number})
        await getSupplyers(setSuppliers, props.setError)
      }
      setIsAddingSupplyers(false);
    }}/>
  if(IsEditingSupplyer!==null)
    return <EditSupplyer item={IsEditingSupplyer}/>
  return (
    <Container>
      <ContainerInner>
        <Card>
          <TitleContainer>Suppliers</TitleContainer>
          <Contents>
            {Supplyers.length == 0 ? (
              <EmptyList>
                <EmptyIcon />
                <Text>There are no registered suppliers at the moment</Text>
                <SubText>Get started by adding your first supplier</SubText>
              </EmptyList>
            ) : <Hide />}
            {Supplyers.map((it, i) => <SupplyerItem setEditing={setIsEditingSupplyer} index={i} item={it} key={i} />)}
          </Contents>
          <BtnContainer>
            <Button onClick={()=>setIsAddingSupplyers(true)}>
              <AddIcon />
              Register New Supplier
            </Button>
          </BtnContainer>
        </Card>
      </ContainerInner>
    </Container>
  )
}