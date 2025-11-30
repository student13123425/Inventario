import React from 'react'
import styled from 'styled-components'
import type { IconType } from 'react-icons'
import { TbX } from "react-icons/tb";

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  title: string
  content: string
  icon: IconType
  confirmText?: string
  cancelText?: string
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
`

const ModalContainer = styled.div`
  width: 90%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem 0 2rem;
`

const IconContainer = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.color || '#fef2f2'};
  color: ${props => props.color ? '#ffffff' : '#dc2626'};
  margin-right: 1rem;
  flex-shrink: 0;
`

const TitleSection = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`

const TextContent = styled.div`
  flex: 1;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`

const Content = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 1rem;
  flex-shrink: 0;
  
  &:hover {
    color: #374151;
    background-color: #f3f4f6;
  }
`

const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  padding-top: 1rem;
`

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 0 2rem 1.5rem 2rem;
`

const Button = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #4f46e5;
          color: #ffffff;
          &:hover {
            background-color: #4338ca;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
          }
        `
      case 'secondary':
        return `
          background-color: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background-color: #f9fafb;
            border-color: #9ca3af;
          }
        `
      case 'danger':
        return `
          background-color: #dc2626;
          color: #ffffff;
          &:hover {
            background-color: #b91c1c;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06);
          }
        `
      default:
        return ''
    }
  }}

  &:active {
    transform: translateY(0);
  }
`



export const CloseIcon = () => (
  <TbX size={20} color="currentColor" />
);


export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  content,
  icon: Icon,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmModalProps) {

  const handleClose = () => {
    onClose()
    onCancel()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <Overlay 
      $isOpen={isOpen} 
      onClick={handleBackdropClick}
    >
      <ModalContainer>
        <ModalHeader>
          <TitleSection>
            <IconContainer>
              <Icon size={24} />
            </IconContainer>
            <TextContent>
              <Title>{title}</Title>
              <Content>{content}</Content>
            </TextContent>
          </TitleSection>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {/* Additional content can go here if needed */}
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  )
}