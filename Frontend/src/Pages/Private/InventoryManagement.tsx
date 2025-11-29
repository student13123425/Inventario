import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchProducts, fetchStockLevel } from '../../script/network'
import { getToken } from '../../script/utils'
import type { ProductResponse, StockLevelResponse } from '../../script/objects'
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
async function getInventoryData(setInventory: Function, setError: Function) {
  try {
    const token = await getToken()
    if (token) {
      // First fetch all products
      const productsOut = await fetchProducts(token)
      if (productsOut.success == true) {
        // Then fetch stock levels for each product
        const inventoryWithStock = await Promise.all(
          productsOut.products.map(async (product: ProductResponse) => {
            try {
              const stockOut = await fetchStockLevel(token, product.id)
              return {
                product,
                stockLevel: stockOut
              }
            } catch (e) {
              return {
                product,
                stockLevel: { success: false, productId: product.id, quantity: 0 }
              }
            }
          })
        )
        setInventory(inventoryWithStock)
      } else {
        setError("Failed getting products")
      }
    }
  } catch (e) {
    setError("Failed getting inventory data")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function InventoryManagement(props: { setError: Function }) {
  const [Inventory, setInventory] = useState<Array<{
    product: ProductResponse
    stockLevel: StockLevelResponse
  }> | null>(null)
  
  useEffect(() => {
    getInventoryData(setInventory, props.setError)
  }, [props.setError])

  if (Inventory === null)
    return <LoadingComponent msg='Loading Inventory...' />

  return (
    <Container>
      <ContainerInner>
      </ContainerInner>
    </Container>
  )
}