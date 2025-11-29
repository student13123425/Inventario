import React from 'react'
import styled from 'styled-components'

const Container=styled.div`
    width: 100vw;
    height: 3.3rem;
    display: flex;
`

const Center=styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
`

const BtnContainer=styled.div`
    width: 3.3rem;
    height: 3.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
`

export default function Navbar() {
  return (
    <Container>
        <BtnContainer>

        </BtnContainer>
        <Center>

        </Center>
        <BtnContainer>
            
        </BtnContainer>
    </Container>
  )
}
