import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { TbLogout } from 'react-icons/tb'
import ConfirmModal from '../../Components/ConfirmModal'

// --- Design System Tokens ---
const COLORS = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryLight: '#eef2ff',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  error: '#dc2626',
  errorHover: '#b91c1c',
  bgWhite: 'rgba(255, 255, 255, 0.9)',
  border: '#e5e7eb',
}

const SHADOWS = {
  subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  active: '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)'
}

// --- Animations ---
const menuSlideDown = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
`

// --- Styled Components ---

const NavbarContainer = styled.nav`
    width: 100%;
    height: 4.5rem;
    display: flex;
    justify-content: center;
    background-color: ${COLORS.bgWhite};
    backdrop-filter: blur(8px);
    border-bottom: 1px solid ${COLORS.border};
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: 'Inter', sans-serif;
`

const ContentWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    padding: 0 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        padding: 0 1rem;
    }
`

const Logo = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${COLORS.primary};
    letter-spacing: -0.025em;
    cursor: pointer;
    flex-shrink: 0;
`

// --- Sliding Navigation Bar ---
const DesktopNav = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    background-color: #f3f4f6;
    padding: 0.35rem;
    border-radius: 12px;
    border: 1px solid ${COLORS.border};

    @media (max-width: 1024px) {
        display: none;
    }
`

const ActivePill = styled.div<{ $left: number, $width: number }>`
    position: absolute;
    top: 0.35rem;
    bottom: 0.35rem;
    left: ${props => props.$left}px;
    width: ${props => props.$width}px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: ${SHADOWS.subtle};
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    z-index: 1;
`

const NavBtn = styled.button<{ $isActive?: boolean }>`
    position: relative;
    z-index: 2;
    background-color: transparent;
    color: ${props => props.$isActive ? COLORS.primary : COLORS.textSecondary};
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    font-weight: ${props => props.$isActive ? '600' : '500'};
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s ease;

    &:hover {
        color: ${COLORS.primary};
    }
`

const DesktopAction = styled.div`
    display: flex;
    align-items: center;
    min-width: 100px;
    justify-content: flex-end;

    @media (max-width: 1024px) {
        display: none;
    }
`

// Updated to be Red Background with White Text
const LogoutBtn = styled.button`
    background-color: ${COLORS.error};
    color: #ffffff;
    border: 1px solid ${COLORS.error};
    border-radius: 8px;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    &:hover {
        background-color: ${COLORS.errorHover};
        border-color: ${COLORS.errorHover};
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.25);
    }

    &:active {
        transform: translateY(0);
    }
`

const HamburgerBtn = styled.button`
    display: none;
    background: transparent;
    border: none;
    color: ${COLORS.textPrimary};
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f3f4f6;
        color: ${COLORS.primary};
    }

    @media (max-width: 1024px) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`

const MobileMenu = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid ${COLORS.border};
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: ${SHADOWS.active};
    animation: ${menuSlideDown} 0.2s ease-out;
    z-index: 999;

    @media (min-width: 1025px) {
        display: none;
    }
`

const MobileNavBtn = styled.button<{ $isActive?: boolean }>`
    width: 100%;
    text-align: left;
    background-color: ${props => props.$isActive ? COLORS.primaryLight : 'transparent'};
    color: ${props => props.$isActive ? COLORS.primary : COLORS.textSecondary};
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: ${props => props.$isActive ? '600' : '500'};
    cursor: pointer;
    
    &:hover {
        background-color: ${COLORS.primaryLight};
        color: ${COLORS.primary};
    }
`

const ScreenOverlay = styled.div`
    position: fixed;
    top: 4.5rem;
    left: 0;
    width: 100vw;
    height: calc(100vh - 4.5rem);
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 998;
    animation: ${fadeIn} 0.25s ease-out forwards;
    cursor: pointer;

    @media (min-width: 1025px) {
        display: none;
    }
`

const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
)

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
)

const formatButtonName = (name: string) => {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function Navbar(props: { Logout: Function, setCurrentPage: Function }) {
    const BTN_NAMES = ["Dashboard", "Manage Supplyers", "Product Catalogue", "Inventory Management", "Transactions"]
    const [selected, setSelected] = useState<string>(BTN_NAMES[0])
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

    // Refs for sliding animation
    const navRefs = useRef<(HTMLButtonElement | null)[]>([])
    const [pillStyles, setPillStyles] = useState({ left: 0, width: 0, opacity: 0 })

    // Effect to update pill position when selection changes
    useEffect(() => {
        const selectedIndex = BTN_NAMES.indexOf(selected)
        const element = navRefs.current[selectedIndex]

        if (element) {
            setPillStyles({
                left: element.offsetLeft,
                width: element.offsetWidth,
                opacity: 1
            })
        }
    }, [selected])

    // Handle window resize to adjust pill
    useEffect(() => {
        const handleResize = () => {
            const selectedIndex = BTN_NAMES.indexOf(selected)
            const element = navRefs.current[selectedIndex]
            if (element) {
                setPillStyles({
                    left: element.offsetLeft,
                    width: element.offsetWidth,
                    opacity: 1
                })
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [selected])

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isMobileOpen]);

    const handleNavigation = (buttonName: string) => {
        const index = BTN_NAMES.indexOf(buttonName)
        if (index !== -1) {
            props.setCurrentPage(index)
        }
        setSelected(buttonName)
        setIsMobileOpen(false)
    }

    const toggleMenu = () => setIsMobileOpen(!isMobileOpen);
    const closeMenu = () => setIsMobileOpen(false);

    // Confirm Logout Logic
    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
        setIsMobileOpen(false); // Close mobile menu if open
    }

    const confirmLogout = () => {
        props.Logout();
        setIsLogoutModalOpen(false);
    }

    return (
        <>
            <NavbarContainer>
                <ContentWrapper>
                    <Logo onClick={() => handleNavigation(BTN_NAMES[0])}>Inventrio</Logo>

                    <DesktopNav>
                        <ActivePill 
                            $left={pillStyles.left} 
                            $width={pillStyles.width} 
                            style={{ opacity: pillStyles.opacity }}
                        />
                        {BTN_NAMES.map((name, index) => (
                            <NavBtn
                                key={name}
                                ref={el => { navRefs.current[index] = el }}
                                $isActive={selected === name}
                                onClick={() => handleNavigation(name)}
                            >
                                {formatButtonName(name)}
                            </NavBtn>
                        ))}
                    </DesktopNav>

                    <DesktopAction>
                        <LogoutBtn onClick={handleLogoutClick}>
                            Sign out
                        </LogoutBtn>
                    </DesktopAction>

                    <HamburgerBtn 
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
                    </HamburgerBtn>
                </ContentWrapper>

                {isMobileOpen && (
                    <>
                        <MobileMenu>
                            {BTN_NAMES.map((name) => (
                                <MobileNavBtn
                                    key={name}
                                    $isActive={selected === name}
                                    onClick={() => handleNavigation(name)}
                                >
                                    {formatButtonName(name)}
                                </MobileNavBtn>
                            ))}
                            <div style={{ height: '1px', background: COLORS.border, margin: '0.5rem 0' }} />
                            <MobileNavBtn 
                                onClick={handleLogoutClick}
                                style={{ color: COLORS.error, fontWeight: 600 }}
                            >
                                Sign out
                            </MobileNavBtn>
                        </MobileMenu>
                        <ScreenOverlay onClick={closeMenu} />
                    </>
                )}
            </NavbarContainer>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Sign Out"
                content="Are you sure you want to sign out of your account?"
                icon={TbLogout}
                confirmText="Sign Out"
                cancelText="Stay Logged In"
                confirmColor="danger"
            />
        </>
    )
}