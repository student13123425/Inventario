import React from 'react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #4f46e5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 2rem;
`

const LoadingMessage = styled.div`
  font-size: 1.5rem;
  color: #ffffff;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  font-weight: 600;
  margin-bottom: 1rem;
`

const LoadingSubtitle = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: 0.5s;
`

export default function LoadingComponent(props: { msg: string }) {
  return (
    <FullScreenContainer>
      <Spinner />
      <LoadingMessage>{props.msg}</LoadingMessage>
      <LoadingSubtitle>Loading your inventory data...</LoadingSubtitle>
    </FullScreenContainer>
  )
}