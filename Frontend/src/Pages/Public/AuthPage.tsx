import React, { useState } from 'react';
import styled from 'styled-components';
import { login, register } from '../../script/network';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
`;

const AuthCard = styled.div`
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  &:hover { text-decoration: underline; }
`;

const Logo = styled.h2`
  color: #4f46e5;
  font-weight: 800;
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.05em;
`;

const SubText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  &:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  &::placeholder { color: #9ca3af; }
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before { content: 'Warning'; }
`;

const SuccessMessage = styled.div`
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #059669;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before { content: 'Checkmark'; }
`;

const ConfirmationBox = styled.div`
  background-color: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const ConfirmationTitle = styled.h3`
  color: #1e40af;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before { content: 'Info'; }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dbeafe;
  &:last-child { border-bottom: none; }
`;

const DetailLabel = styled.span`
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 600;
`;

const SubmitButton = styled.button`
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
  &:hover:not(:disabled) { background-color: #4338ca; }
  &:disabled { background-color: #9ca3af; cursor: not-allowed; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const SecondaryButton = styled.button`
  flex: 1;
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background-color: #e5e7eb; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PrimaryButton = styled(SubmitButton)`
  flex: 1;
  margin-top: 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  &::before, &::after { content: ''; flex: 1; border-top: 1px solid #e5e7eb; }
  span { padding: 0 0.75rem; }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const LinkText = styled.button`
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  &:hover { text-decoration: underline; }
`;

interface AuthPageProps {
  mode: number;
  setMode: (mode: number) => void;
  setLoginToken: (token: string | null) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, setMode, setLoginToken }) => {
  const isLogin = mode === 1;
  const [formData, setFormData] = useState({ shopName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const toggleMode = () => {
    setMode(isLogin ? 2 : 1);
    setFormData({ shopName: '', email: '', password: '' });
    setError(null);
    setSuccess(null);
    setShowConfirmation(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) handleFinalSubmit();
    else setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const token = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register({ shopName: formData.shopName, email: formData.email, password: formData.password });

      setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
      setTimeout(() => setLoginToken(token), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setMode(0);
    setError(null);
    setSuccess(null);
    setShowConfirmation(false);
  };

  const handleEditDetails = () => setShowConfirmation(false);

  return (
    <PageContainer>
      <AuthCard>
        <Header>
          <BackButton onClick={handleBack}>Back</BackButton>
          <Logo>Inventrio.</Logo>
          <SubText>
            {isLogin
              ? 'Welcome back! Please enter your details.'
              : showConfirmation
                ? 'Please confirm your account details.'
                : 'Create your account and start tracking today.'}
          </SubText>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {!showConfirmation ? (
          <Form onSubmit={handleInitialSubmit}>
            {!isLogin && (
              <InputGroup>
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  type="text"
                  id="shopName"
                  name="shopName"
                  placeholder="e.g. Downtown Market"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </InputGroup>
            )}
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </InputGroup>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLogin ? 'Sign In' : 'Continue'}
            </SubmitButton>
          </Form>
        ) : (
          <>
            <ConfirmationBox>
              <ConfirmationTitle>Confirm Your Details</ConfirmationTitle>
              <DetailRow>
                <DetailLabel>Shop Name:</DetailLabel>
                <DetailValue>{formData.shopName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Email:</DetailLabel>
                <DetailValue>{formData.email}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Password:</DetailLabel>
                <DetailValue>{'•'.repeat(formData.password.length)}</DetailValue>
              </DetailRow>
            </ConfirmationBox>
            <ButtonGroup>
              <SecondaryButton onClick={handleEditDetails} disabled={isLoading}>
                Edit Details
              </SecondaryButton>
              <PrimaryButton onClick={handleFinalSubmit} disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Confirm & Create'}
              </PrimaryButton>
            </ButtonGroup>
          </>
        )}

        {!showConfirmation && (
          <>
            <Divider><span>or</span></Divider>
            <Footer>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <LinkText onClick={toggleMode} disabled={isLoading}>
                {isLogin ? 'Sign up' : 'Log in'}
              </LinkText>
            </Footer>
          </>
        )}
      </AuthCard>
    </PageContainer>
  );
};

export default AuthPage;