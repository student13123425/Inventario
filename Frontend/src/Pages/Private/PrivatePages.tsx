import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import DashBoard from './DashBoard';
import ManageSupplyers from './ManageSupplyers';
import ProductCatalogue from './ProductCatalogue';
import InventoryManagement from './InventoryManagement';
import Transactions from './Transactions';

const PageContainer=styled.div`
  width: 100vw;
  height: calc(100vh - 3.3rem);
`

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function PrivatePages(props:{setError:Function,LoginToken:string, onLogout:Function}) {
  const [CurrentPage,setCurrentPage]=useState<number>(0)
  const Elements=[DashBoard,ManageSupplyers,ProductCatalogue,InventoryManagement,Transactions]
  const Element=Elements[CurrentPage]
  return (
      <>
        <Navbar setCurrentPage={setCurrentPage} Logout={props.onLogout}/>
        <PageContainer>
          <Element setError={props.setError}/>
        </PageContainer>
      </>
  );
}