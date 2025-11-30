import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { IconType } from 'react-icons';
import { TbX } from 'react-icons/tb';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  content: string;
  icon: IconType;
  confirmText?: string;
  cancelText?: string;
}

// Keyframes
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;

  /* Default hidden state */
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

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
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  opacity: 0;
  transform: scale(0.8);

  ${({ $isOpen, $isClosing }) =>
    $isOpen &&
    css`
      opacity: 1;
      transform: scale(1);
      animation: ${!$isClosing
        ? css`${modalIn} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
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
  background-color: ${p => p.color || '#fef2f2'};
  color: ${p => (p.color ? '#ffffff' : '#dc2626')};
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

  ${props =>
    props.variant === 'primary' &&
    css`
      background-color: #4f46e5;
      color: #ffffff;
      &:hover {
        background-color: #4338ca;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1),
          0 2px 4px -1px rgba(79, 70, 229, 0.06);
      }
    `}

  ${props =>
    props.variant === 'secondary' &&
    css`
      background-color: #ffffff;
      color: #374151;
      border: 1px solid #d1d5db;
      &:hover {
        background-color: #f9fafb;
        border-color: #9ca3af;
      }
    `}

  ${props =>
    props.variant === 'danger' &&
    css`
      background-color: #dc2626;
      color: #ffffff;
      &:hover {
        background-color: #b91c1c;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1),
          0 2px 4px -1px rgba(220, 38, 38, 0.06);
      }
    `}

  &:active {
    transform: translateY(0);
  }
`;

export const CloseIcon = () => <TbX size={20} color="currentColor" />;

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
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Open / close handling with animation
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

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
      onCancel();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    onCancel();
    handleClose();
  };

  // Prevent body scroll
  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible && !isClosing) return null;

  return (
    <Overlay
      $isOpen={isOpen}
      $isClosing={isClosing}
      onClick={handleBackdropClick}
    >
      <ModalContainer $isOpen={isOpen && !isClosing} $isClosing={isClosing}>
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

        <ModalBody>{/* Extra content can go here */}</ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={handleCancel} disabled={isClosing}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={isClosing}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}