import React from 'react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const CardContainer = styled.div`
  width: 100%; /* fills the parent's width */
  background-color: #4f46e5;
  padding: 1.25rem;
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(255, 255, 255, 0.25);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const LoadingMessage = styled.div`
  font-size: 1.125rem;
  color: #ffffff;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  font-weight: 600;
`

const LoadingSubtitle = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: 0.5s;
`

export type LoadingCardProps = {
  msg: string
  subtitle?: string
  /** Optional inline style overrides (e.g. { borderRadius: '20px' }) */
  style?: React.CSSProperties
  className?: string
}

export default function LoadingCard({ msg, subtitle = 'Loading your inventory data...', style, className }: LoadingCardProps) {
  return (
    <CardContainer role="status" aria-live="polite" style={style} className={className}>
      <Spinner />
      <LoadingMessage>{msg}</LoadingMessage>
      <LoadingSubtitle>{subtitle}</LoadingSubtitle>
    </CardContainer>
  )
}
