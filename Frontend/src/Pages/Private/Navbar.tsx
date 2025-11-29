import React, { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
    width: 100vw;
    height: 3.3rem;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
`

const Center = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`

const BtnContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 2rem;
    min-width: 120px;
`

const LogOutBtn = styled.button`
  background-color: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -2px rgba(220, 38, 38, 0.3);
  }
`

const Button = styled.button`
  background-color: transparent;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: #4f46e5;
    background-color: #f9fafb;
    transform: translateY(-1px);
  }
`

const ButtonSelected = styled.button`
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px -2px rgba(79, 70, 229, 0.4);
  }
`

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #4f46e5;
`

const formatButtonName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function Navbar(props:{Logout:Function}) {
  const BTN_NAMES = ["Dashboard", "ManageSupplyers", "ProductCatalogue"]
  const [Selected, setSelected] = useState<string>(BTN_NAMES[0])

  return (
    <Container>
      <BtnContainer>
        <Logo>Inventrio</Logo>
      </BtnContainer>
      <Center>
        {BTN_NAMES.map((it, i) => 
          Selected !== it ? 
            <Button onClick={() => { setSelected(it) }} key={i}>
              {formatButtonName(it)}
            </Button> : 
            <ButtonSelected key={i}>
              {formatButtonName(it)}
            </ButtonSelected>
        )}
      </Center>
      <BtnContainer>
        <LogOutBtn onClick={()=>props.Logout()}>Logout</LogOutBtn>
      </BtnContainer>
    </Container>
  )
}