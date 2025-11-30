import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 100vw;
  height: 100%;
  background-color: #f9fafb;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 2rem;
  flex-shrink: 0;
`

export default function LinkProduct(props:{}) {
  return (
    <Container>
        <Title>Link Product</Title>
    </Container>
  )
}
