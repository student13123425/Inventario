import React from 'react'
import type { LowStockAlert } from '../../script/objects'
import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    background-color: #ffffff;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #f9fafb;
    }
    
    &:last-child {
        border-bottom: none;
    }
`

const ID = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #4f46e5;
    color: #ffffff;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
`

const Content = styled.div`
    flex: 1;
    margin: 0 1.5rem;
    font-size: 1rem;
    color: #111827;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Quantity = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fef2f2;
    color: #dc2626;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid #fecaca;
    min-width: 3.125rem;
`

export default function StockAlertItem(props:{item:LowStockAlert, index:number}) {
    const name:string = props.item.name
    const total_quantity:number = props.item.total_quantity
    const nr = props.index + 1;
    
    return (
        <Container>
            <ID>{nr}</ID>
            <Content>{name}</Content>
            <Quantity>{total_quantity}</Quantity>
        </Container>
    )
}