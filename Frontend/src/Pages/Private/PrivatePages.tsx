import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';

const PageContainer=styled.div`
  width: 100vw;
  height: calc(100vh - 3.3rem);
`

export default function PrivatePages({ LoginToken, onLogout }: PrivatePagesProps) {
  return (
      <>
        <Navbar/>
        <PageContainer>
          
        </PageContainer>
      </>
  );
}