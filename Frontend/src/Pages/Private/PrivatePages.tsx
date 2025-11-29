import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import DashBoard from './DashBoard';

const PageContainer=styled.div`
  width: 100vw;
  height: calc(100vh - 3.3rem);
`

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function PrivatePages(props:{setError:Function,LoginToken:string, onLogout:Function}) {
  return (
      <>
        <Navbar/>
        <PageContainer>
          <DashBoard setError={props.setError}/>
        </PageContainer>
      </>
  );
}