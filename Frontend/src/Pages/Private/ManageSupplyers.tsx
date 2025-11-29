import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchSuppliers } from '../../script/network';
import { getToken } from '../../script/utils';
import type { SupplierResponse } from '../../script/objects';
import LoadingComponent from './LoadingComponent';

const Container = styled.div`
  width: 100vw;
  height: 100%;
`

const ContainerInner = styled.div`
  margin: auto;
  width: 1000px;
  max-width: 100vw;
  display: flex;
  padding: 1rem;
  gap: 1rem;
`
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
async function getSupplyers(setSuppliers:Function,setError:Function){
  try{
     const token=await getToken();
     if(token){
      const out=await fetchSuppliers(token);
      if(out.success==true)
        setSuppliers(out.suppliers);
      else
        setError("Failed geting supplyers")
     }
  }catch(e){
      setError("Failed geting supplyers")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ManageSupplyers(props:{setError:Function}) {
  const [Supplyers,setSuppliers]=useState<SupplierResponse[]|null>(null);
  useEffect(()=>{
       getSupplyers(setSuppliers,props.setError)
  })
  if(Supplyers===null)
    return <LoadingComponent msg='Loading Supplyers...'/>
  return (
    <Container>
      <ContainerInner>
        
      </ContainerInner>
    </Container>
  )
}
