import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { fetchTransactions } from '../../script/network'
import { getToken } from '../../script/utils'
import type { TransactionResponse } from '../../script/objects'
import LoadingComponent from './LoadingCard'

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
async function getTransactions(setTransactions: Function, setError: Function) {
  try {
    const token = await getToken()
    if (token) {
      const out = await fetchTransactions(token)
      if (out.success == true)
        setTransactions(out.transactions)
      else
        setError("Failed getting transactions")
    }
  } catch (e) {
    setError("Failed getting transactions")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function Transactions(props: { setError: Function }) {
  const [Transactions, setTransactions] = useState<TransactionResponse[] | null>(null)
  
  useEffect(() => {
    getTransactions(setTransactions, props.setError)
  }, [props.setError])

  if (Transactions === null)
    return <LoadingComponent msg='Loading Transactions...' />

  return (
    <Container>
      <ContainerInner>
      </ContainerInner>
    </Container>
  )
}