import React from 'react'
import styled from 'styled-components'

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


export default function Transactions() {
  return (
    <Container>
      <ContainerInner>
        
      </ContainerInner>
    </Container>
  )
}
