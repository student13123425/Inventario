import React, { useEffect, useState, useRef } from 'react';
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
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;

const modalOut = keyframes`
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.95) translateY(10px); }
`;

const Overlay = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.6); /* Gray-900 with opacity */
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
        ? css`${overlayIn} 0.2s ease-out forwards`
        : css`${overlayOut} 0.15s ease-in forwards`};
    `}
`;

const ModalContainer = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  width: 90%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  opacity: 0;
  transform: scale(0.95);

  ${({ $isOpen, $isClosing }) =>
    $isOpen &&
    css`
      opacity: 1;
      transform: scale(1);
      animation: ${!$isClosing
        ? css`${modalIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`
        : css`${modalOut} 0.15s ease-in forwards`};
    `}
`;

const ModalContentWrapper = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${p => p.$color}15; /* 10-15% opacity version of color */
  color: ${p => p.$color};
  flex-shrink: 0;
  font-size: 1.5rem;
`;

const TextContent = styled.div`
  flex: 1;
  padding-top: 0.25rem;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
`;

const Content = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  padding: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  align-self: flex-start;

  &:hover {
    color: #111827;
    background-color: #f3f4f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button<{ 
  $variant: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
}>`
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'wait' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  min-width: 80px;

  /* Secondary / Cancel Button */
  ${p => p.$variant === 'secondary' && css`
    background: white;
    color: #374151;
    border-color: #d1d5db;
    &:hover:not(:disabled) { 
      background: #f9fafb; 
      border-color: #9ca3af; 
    }
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
    }
  `}

  /* Primary Action */
  ${p => p.$variant === 'primary' && css`
    background: #4f46e5;
    color: white;
    &:hover:not(:disabled) { background: #4338ca; }
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
    }
  `}

  /* Danger Action */
  ${p => p.$variant === 'danger' && css`
    background: #dc2626;
    color: white;
    &:hover:not(:disabled) { background: #b91c1c; }
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.3);
    }
  `}

  /* Success Action */
  ${p => p.$variant === 'success' && css`
    background: #059669;
    color: white;
    &:hover:not(:disabled) { background: #047857; }
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
`;

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
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Manage visibility and animation state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Focus the confirm button when opened for accessibility
      setTimeout(() => confirmButtonRef.current?.focus(), 50);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  // Handle Keyboard Events (Enter to Confirm, Escape to Cancel)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isConfirming) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming, onConfirm, onCancel]); // Dependencies crucial for closure scope

  // Helper to start closing animation
  const startClosing = () => {
    if (isClosing || isConfirming) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 150);
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
    } catch (error) {
      console.error("Confirmation action failed", error);
    }
  };

  // Prevent background scroll when modal is open
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
      <ModalContainer 
        $isOpen={isOpen && !isClosing} 
        $isClosing={isClosing}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <ModalContentWrapper>
          <HeaderSection>
            <IconWrapper $color={getIconColor()}>
              <Icon />
            </IconWrapper>
            
            <TextContent>
              <Title id="modal-title">{title}</Title>
              <Content>{content}</Content>
            </TextContent>

            <CloseButton onClick={startClosing} disabled={isConfirming} aria-label="Close modal">
              <TbX size={20} />
            </CloseButton>
          </HeaderSection>

          <ModalFooter>
            <Button 
              $variant="secondary" 
              onClick={handleCancel} 
              disabled={isConfirming}
            >
              {cancelText}
            </Button>
            <Button 
              ref={confirmButtonRef}
              $variant={confirmColor} 
              onClick={handleConfirm} 
              disabled={isConfirming}
            >
              {isConfirming && <LoadingSpinner />}
              {isConfirming ? 'Processing...' : confirmText}
            </Button>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalContainer>
    </Overlay>
  );
}