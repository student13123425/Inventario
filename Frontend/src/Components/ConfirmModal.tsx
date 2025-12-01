import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { IconType } from 'react-icons';
import { TbX } from 'react-icons/tb';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  title: string;
  content: string;
  icon: IconType;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  confirmColor?: 'primary' | 'danger' | 'success';
}

const overlayIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to   { opacity: 1; backdrop-filter: blur(4px); }
`;

const overlayOut = keyframes`
  from { opacity: 1; backdrop-filter: blur(4px); }
  to   { opacity: 0; backdrop-filter: blur(0px); }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
`;

const modalOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.8); }
`;

const Overlay = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  font-family: 'Inter', sans-serif;

  ${({ $isOpen, $isClosing }) =>
    $isOpen &&
    css`
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      animation: ${!$isClosing
        ? css`${overlayIn} 0.3s ease-out forwards`
        : css`${overlayOut} 0.2s ease-in forwards`};
    `}
`;

const ModalContainer = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  overflow: hidden;
  opacity: 0;
  transform: scale(0.8);

  ${({ $isOpen, $isClosing }) =>
    $isOpen &&
    css`
      opacity: 1;
      transform: scale(1);
      animation: ${!$isClosing
        ? css`${modalIn} 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards`
        : css`${modalOut} 0.2s ease-in forwards`};
    `}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem 0 2rem;
`;

const IconContainer = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${p => p.color || '#4f46e5'};
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const TextContent = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const Content = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;

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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  padding-top: 1rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 0 2rem 1.5rem 2rem;
`;

const Button = styled.button<{ 
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: ${props => props.isLoading ? 'wait' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  min-width: 100px;

  ${p => p.variant === 'primary' && css`
    background: ${p.isLoading ? '#6d67e4' : '#4f46e5'};
    color: white;
    &:hover:not(:disabled) { 
      background: ${p.isLoading ? '#6d67e4' : '#4338ca'}; 
      transform: ${p.isLoading ? 'none' : 'translateY(-1px)'}; 
    }
    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  `}

  ${p => p.variant === 'secondary' && css`
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover:not(:disabled) { 
      background: #f9fafb; 
      border-color: #9ca3af; 
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}

  ${p => p.variant === 'danger' && css`
    background: ${p.isLoading ? '#e04444' : '#dc2626'};
    color: white;
    &:hover:not(:disabled) { 
      background: ${p.isLoading ? '#e04444' : '#b91c1c'}; 
      transform: ${p.isLoading ? 'none' : 'translateY(-1px)'}; 
    }
    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  `}

  ${p => p.variant === 'success' && css`
    background: ${p.isLoading ? '#059669' : '#059669'};
    color: white;
    &:hover:not(:disabled) { 
      background: ${p.isLoading ? '#059669' : '#047857'}; 
      transform: ${p.isLoading ? 'none' : 'translateY(-1px)'}; 
    }
    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  `}

  &:active:not(:disabled) { transform: translateY(0); }
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
`;

const ButtonText = styled.span<{ $isLoading?: boolean }>`
  opacity: ${props => props.$isLoading ? 0.7 : 1};
`;

export const CloseIcon = () => <TbX size={20} />;

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  content,
  icon: Icon,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmColor = 'primary'
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  const startClosing = () => {
    if (isClosing || isConfirming) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isConfirming) startClosing();
  };

  const handleCancel = () => {
    if (isConfirming) return;
    onCancel?.();
    startClosing();
  };

  const handleConfirm = async () => {
    if (isConfirming) return;
    try {
      await onConfirm();
    } finally {
      // Don't close automatically - let parent component handle closing
    }
  };

  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isVisible]);

  if (!isVisible && !isClosing) return null;

  const getIconColor = () => {
    switch (confirmColor) {
      case 'danger': return '#dc2626';
      case 'success': return '#059669';
      case 'primary':
      default: return '#4f46e5';
    }
  };

  return (
    <Overlay $isOpen={isOpen} $isClosing={isClosing} onClick={handleBackdropClick}>
      <ModalContainer $isOpen={isOpen && !isClosing} $isClosing={isClosing}>
        <ModalHeader>
          <TitleSection>
            <IconContainer color={getIconColor()}>
              <Icon size={24} />
            </IconContainer>
            <TextContent>
              <Title>{title}</Title>
              <Content>{content}</Content>
            </TextContent>
          </TitleSection>
          <CloseButton onClick={startClosing} disabled={isConfirming}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <ModalBody />

        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={handleCancel} 
            disabled={isConfirming}
            isLoading={false}
          >
            <ButtonText $isLoading={false}>{cancelText}</ButtonText>
          </Button>
          <Button 
            variant={confirmColor} 
            onClick={handleConfirm} 
            disabled={isConfirming}
            isLoading={isConfirming}
          >
            {isConfirming ? (
              <>
                <LoadingSpinner />
                <ButtonText $isLoading={true}>{confirmText}</ButtonText>
              </>
            ) : (
              <ButtonText $isLoading={false}>{confirmText}</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}