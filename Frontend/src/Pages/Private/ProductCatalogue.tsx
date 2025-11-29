import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchProducts } from '../../script/network'
import { getToken } from '../../script/utils'
import type { ProductResponse } from '../../script/objects'
import LoadingComponent from './LoadingComponent'

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
async function getProducts(setProducts: Function, setError: Function) {
  try {
    const token = await getToken()
    if (token) {
      const out = await fetchProducts(token)
      if (out.success == true)
        setProducts(out.products)
      else
        setError("Failed getting products")
    }
  } catch (e) {
    setError("Failed getting products")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function ProductCatalogue(props: { setError: Function }) {
  const [Products, setProducts] = useState<ProductResponse[] | null>(null)
  
  useEffect(() => {
    getProducts(setProducts, props.setError)
  }, [props.setError])

  if (Products === null)
    return <LoadingComponent msg='Loading Products...' />

  return (
    <Container>
      <ContainerInner>
      </ContainerInner>
    </Container>
  )
}