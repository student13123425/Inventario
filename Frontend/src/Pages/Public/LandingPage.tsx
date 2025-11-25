import React from 'react';
import styled from 'styled-components';
import { Check, Star } from 'lucide-react';

// --- Styled Components ---

const Container = styled.div`
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    background-color: #ffffff;
    color: #1f2937;
`;
const Navbar = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 5%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #f3f4f6;
`;
const Logo = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: #4f46e5;
    letter-spacing: -0.05em;
    cursor: pointer;
`;
const NavLinks = styled.div`
    display: flex;
    gap: 2rem;
    @media (max-width: 768px) { display: none; }
`;
const NavLink = styled.a`
    text-decoration: none;
    color: #4b5563;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.2s;
    cursor: pointer;
    &:hover { color: #4f46e5; }
`;
const Button = styled.button<{ $secondary?: boolean }>`
    background-color: ${props => props.$secondary ? 'transparent' : '#4f46e5'};
    color: ${props => props.$secondary ? '#4f46e5' : 'white'};
    border: ${props => props.$secondary ? '1px solid #e5e7eb' : 'none'};
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${props => props.$secondary ? 'none' : '0 4px 6px -1px rgba(79, 70, 229, 0.2)'};
    &:hover {
        background-color: ${props => props.$secondary ? '#f9fafb' : '#4338ca'};
        transform: translateY(-1px);
    }
`;
const HeroSection = styled.header`
    text-align: center;
    padding: 6rem 1rem 4rem;
    max-width: 1200px;
    margin: 0 auto;
`;
const Title = styled.h1`
    font-size: 3.5rem;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, #111827, #4b5563);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    @media (max-width: 768px) { font-size: 2.5rem; }
`;
const Subtitle = styled.p`
    font-size: 1.25rem;
    color: #6b7280;
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
`;
const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 4rem;
`;
const SectionHeader = styled.div`
    text-align: center;
    max-width: 800px;
    margin: 0 auto 3rem;
    padding: 0 1rem;
`;
const SectionTitle = styled.h2`
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 1rem;
`;
const SectionSubtitle = styled.p`
    font-size: 1.125rem;
    color: #6b7280;
`;
const FeatureGrid = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    padding: 4rem 5%;
    background-color: #f9fafb;
    margin: auto;
`;
const FeatureCard = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #f3f4f6;
    transition: all 0.3s ease;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
`;
const IconWrapper = styled.div`
    width: 48px;
    height: 48px;
    background-color: #e0e7ff;
    color: #4f46e5;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
`;
const TestimonialsSection = styled.section`
    padding: 6rem 5%;
    background-color: #ffffff;
`;
const TestimonialGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
`;
const TestimonialCard = styled.div`
    background: #f9fafb;
    padding: 2rem;
    border-radius: 16px;
    position: relative;
`;
const Stars = styled.div`
    display: flex;
    gap: 4px;
    margin-bottom: 1rem;
    color: #f59e0b; 
`;
const TestimonialText = styled.p`
    color: #374151;
    font-style: italic;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
`;
const Author = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;
const Avatar = styled.div`
    width: 48px;
    height: 48px;
    background: #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #6b7280;
`;
const AuthorInfo = styled.div`
    h4 { font-weight: 700; color: #111827; margin: 0; }
    span { font-size: 0.875rem; color: #6b7280; }
`;
const PricingSection = styled.section`
    padding: 6rem 5%;
    background-color: #111827;
    color: white;
`;
const PricingGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    margin-top: 3rem;
`;
const PricingCard = styled.div<{ $highlight?: boolean }>`
    background: ${props => props.$highlight ? '#4f46e5' : '#1f2937'};
    border: 1px solid ${props => props.$highlight ? '#6366f1' : '#374151'};
    border-radius: 20px;
    padding: 2.5rem;
    flex: 1;
    min-width: 300px;
    max-width: 450px;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: ${props => props.$highlight ? '0 25px 50px -12px rgba(79, 70, 229, 0.5)' : 'none'};
    transform: ${props => props.$highlight ? 'scale(1.05)' : 'scale(1)'};
    z-index: ${props => props.$highlight ? '10' : '1'};
    @media (max-width: 768px) { transform: scale(1); }
`;
const PlanDescription = styled.p<{ $highlight?: boolean }>`
    color: ${props => props.$highlight ? '#e0e7ff' : '#9ca3af'};
    margin-bottom: 2rem;
    font-size: 0.95rem;
    min-height: 44px;
`;
const Price = styled.div<{ $highlight?: boolean }>`
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 2rem;
    display: flex;
    align-items: baseline;
    span {
        font-size: 1rem;
        font-weight: 500;
        margin-left: 0.5rem;
        color: ${props => props.$highlight ? '#e0e7ff' : '#9ca3af'};
    }
`;
const FeaturesList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    flex-grow: 1;
`;
const FeatureItem = styled.li<{ $highlight?: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: ${props => props.$highlight ? '#e0e7ff' : '#d1d5db'};
    svg {
        width: 20px;
        height: 20px;
        color: ${props => props.$highlight ? '#ffffff' : '#4f46e5'};
    }
`;
const PricingButton = styled.button<{ $highlight?: boolean }>`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    background-color: ${props => props.$highlight ? 'white' : '#4f46e5'};
    color: ${props => props.$highlight ? '#4f46e5' : 'white'};
    transition: all 0.2s;
    &:hover {
        transform: translateY(-2px);
        opacity: 0.95;
    }
`;
const Footer = styled.footer`
    background-color: #0f172a;
    color: #9ca3af;
    padding: 4rem 5%;
    border-top: 1px solid #1f2937;
    text-align: center;
`;

// --- Component ---

export default function LandingPage({ setMode }: { setMode: (mode: number) => void }) {
    // Mode 1: Login, Mode 2: Register (Get Started)
    return (
        <Container>
            <Navbar>
                <Logo onClick={() => setMode(0)}>Inventrio.</Logo>
                <NavLinks>
                    <NavLink href="#features">Features</NavLink>
                    <NavLink href="#testimonials">Testimonials</NavLink>
                    <NavLink href="#pricing">Pricing</NavLink>
                </NavLinks>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button $secondary onClick={() => setMode(1)}>Log in</Button>
                    <Button onClick={() => setMode(2)}>Get Started</Button>
                </div>
            </Navbar>

            <HeroSection>
                <Title>
                    Inventory management <br />
                    <span style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>reimagined for retail.</span>
                </Title>
                <Subtitle>
                    Stop using spreadsheets. Turn your smartphone into a powerful barcode scanner and track your shop's stock in real-time.
                </Subtitle>
                <ButtonGroup>
                    <Button onClick={() => setMode(2)} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Start Your Free Trial
                    </Button>
                    <Button $secondary onClick={() => setMode(1)} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Log in
                    </Button>
                </ButtonGroup>
            </HeroSection>

            <FeatureGrid id="features">
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '1rem' }}>
                    <SectionTitle>Everything you need to grow</SectionTitle>
                    <SectionSubtitle>Powerful features to help you take control of your inventory.</SectionSubtitle>
                </div>
                <FeatureCard>
                    <IconWrapper>📱</IconWrapper>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem'}}>Mobile-First Scanning</h3>
                    <p style={{color: '#6b7280'}}>No expensive hardware required. Use your existing smartphone camera to scan barcodes instantly for sales and restocking.</p>
                </FeatureCard>
                <FeatureCard>
                    <IconWrapper>⚡</IconWrapper>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem'}}>Real-Time Sync</h3>
                    <p style={{color: '#6b7280'}}>Changes made on one device reflect everywhere instantly. Keep your front desk and warehouse in perfect harmony.</p>
                </FeatureCard>
                <FeatureCard>
                    <IconWrapper>📊</IconWrapper>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem'}}>Smart Analytics</h3>
                    <p style={{color: '#6b7280'}}>Visualize your best sellers, track profit margins, and get automated alerts when stock levels run low.</p>
                </FeatureCard>
            </FeatureGrid>

            <TestimonialsSection id="testimonials">
                <SectionHeader>
                    <SectionTitle>Loved by Romanian Retailers</SectionTitle>
                    <SectionSubtitle>See what shop owners are saying about Inventrio.</SectionSubtitle>
                </SectionHeader>
                
                <TestimonialGrid>
                    <TestimonialCard>
                        <Stars>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
                        </Stars>
                        <TestimonialText>
                            "I used to spend every Sunday counting stock manually. Since switching to Inventrio, I finish in 30 minutes. The free plan is a lifesaver for small shops like mine."
                        </TestimonialText>
                        <Author>
                            <Avatar>MP</Avatar>
                            <AuthorInfo>
                                <h4>Maria Popescu</h4>
                                <span>Owner, Boutique Bucharest</span>
                            </AuthorInfo>
                        </Author>
                    </TestimonialCard>

                    <TestimonialCard>
                        <Stars>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
                        </Stars>
                        <TestimonialText>
                            "Finally, an app that understands Romanian business needs. The interface is clean, fast, and the scanner works perfectly even on my old Android phone."
                        </TestimonialText>
                        <Author>
                            <Avatar>AI</Avatar>
                            <AuthorInfo>
                                <h4>Alexandru Ionescu</h4>
                                <span>Manager, TechCorner Cluj</span>
                            </AuthorInfo>
                        </Author>
                    </TestimonialCard>

                    <TestimonialCard>
                        <Stars>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
                        </Stars>
                        <TestimonialText>
                            "We grew past 50k sales quickly and the upgrade process was seamless. The advanced analytics helped us identify our best selling items instantly."
                        </TestimonialText>
                        <Author>
                            <Avatar>ED</Avatar>
                            <AuthorInfo>
                                <h4>Elena Dumitru</h4>
                                <span>Founder, Organic Market</span>
                            </AuthorInfo>
                        </Author>
                    </TestimonialCard>
                </TestimonialGrid>
            </TestimonialsSection>

            <PricingSection id="pricing">
                <SectionHeader>
                    <h2 style={{fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '1rem'}}>Simple, Transparent Pricing</h2>
                    <p style={{fontSize: '1.125rem', color: '#9ca3af'}}>Pay only when you grow. No hidden fees.</p>
                </SectionHeader>

                <PricingGrid>
                    {/* Free Plan */}
                    <PricingCard>
                        <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white'}}>Starter</h3>
                        <PlanDescription>For small businesses just getting started.</PlanDescription>
                        <Price>0 Lei <span>/ month</span></Price>
                        
                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '0.5rem', 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#d1d5db'
                        }}>
                            ⚠️ Strict limit: Revenue under 50k Lei/mo
                        </div>

                        <FeaturesList>
                            <FeatureItem><Check size={16} style={{color: '#4f46e5'}} /> Up to 500 SKUs</FeatureItem>
                            <FeatureItem><Check size={16} style={{color: '#4f46e5'}} /> 1 User Account</FeatureItem>
                            <FeatureItem><Check size={16} style={{color: '#4f46e5'}} /> Mobile Scanning App</FeatureItem>
                            <FeatureItem><Check size={16} style={{color: '#4f46e5'}} /> Basic Sales Reports</FeatureItem>
                            <FeatureItem style={{opacity: 0.5, textDecoration: 'line-through'}}><Check size={16} style={{color: '#374151'}} /> Low Stock Alerts</FeatureItem>
                            <FeatureItem style={{opacity: 0.5, textDecoration: 'line-through'}}><Check size={16} style={{color: '#374151'}} /> API Access</FeatureItem>
                        </FeaturesList>
                        <PricingButton onClick={() => setMode(2)}>Start for Free</PricingButton>
                    </PricingCard>

                    {/* Pro Plan */}
                    <PricingCard $highlight>
                        <div style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '20px',
                            background: '#fbbf24',
                            color: '#92400e',
                            padding: '4px 12px',
                            borderRadius: '99px',
                            fontWeight: '700',
                            fontSize: '0.8rem'
                        }}>MOST POPULAR</div>
                        
                        <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white'}}>Growth</h3>
                        <PlanDescription $highlight>For established businesses scaling operations.</PlanDescription>
                        <Price $highlight>1000 Lei <span>/ month</span></Price>

                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '0.5rem', 
                            background: 'rgba(255,255,255,0.2)', 
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#fff'
                        }}>
                            ✅ Required if revenue over 50k Lei/mo
                        </div>

                        <FeaturesList>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> Unlimited SKUs</FeatureItem>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> Unlimited User Accounts</FeatureItem>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> Advanced Analytics</FeatureItem>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> Priority Support</FeatureItem>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> Low Stock Alerts via SMS</FeatureItem>
                            <FeatureItem $highlight><Check size={16} style={{color: '#ffffff'}} /> API & Integrations</FeatureItem>
                        </FeaturesList>
                        <PricingButton $highlight onClick={() => setMode(2)}>Upgrade Now</PricingButton>
                    </PricingCard>
                </PricingGrid>
            </PricingSection>

            <Footer>
                <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'white', fontSize: '1.5rem' }}>Inventrio.</div>
                <p>&copy; 2024 Inventrio Systems. Designed for modern commerce.</p>
            </Footer>
        </Container>
    );
}