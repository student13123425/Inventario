import React from 'react'
import styled from 'styled-components'
import type { ProductResponse } from '../../script/objects'

const Container = styled.div`
  width: 100vw;
  height: 100%;
  background-color: #f9fafb;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  gap: 10px;
`

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 2rem;
  flex-shrink: 0;
`

const Side=styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const FormContainer=styled.div`
    display: flex;
    gap: 10px;
`

const Label=styled.div`
    border-bottom: 2px solid #000;
    font-size: 1.5rem;
`

const NrInput=styled.input`
    
`

const Btn=styled.div`
    width: 100%;
`

export default function LinkProduct(props:{products:ProductResponse[]}) {
  return (
    <Container>
        <Title>Link Product</Title>
        <FormContainer>
            <Side>
                <Label>Supplyer Price</Label>
                <NrInput type='number'/>
            </Side>
            <Side>
                <Label>Avg Delivery Speed(Days)</Label>
                <NrInput type='number'/>
            </Side>
        </FormContainer>
        <Btn>Link Product</Btn>
    </Container>
  )
}
