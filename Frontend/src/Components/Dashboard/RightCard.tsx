import React from 'react'
import type { LowStockAlert } from '../../script/objects'
import styled from 'styled-components'
import StockAlertItem from './StockAlertItem'
import { AiOutlineCheckCircle } from 'react-icons/ai'

const Card = styled.div`
   display: flex;
   flex-direction: column;
   background-color: #ffffff;
   height: 100%;
   min-height: 30rem;
   max-height: 45rem; 
   border-radius: 16px;
   overflow: hidden;
   border: 1px solid #e5e7eb;
   box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
   transition: all 0.2s ease;
   font-family: 'Inter', sans-serif;

   &:hover {
     box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
     transform: translateY(-2px);
   }
`

const CardHeader = styled.div`
    padding: 1.5rem 2rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const CardTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
`

const CardContents = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    
    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: #f9fafb;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #d1d5db;
        border-radius: 20px;
    }
`

const EmptyContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    gap: 1rem;
    flex-direction: column;
    padding: 2rem;
`

const EmptyIcon = styled(AiOutlineCheckCircle)`
    color: #059669;
    font-size: 4rem;
`

const EmptyText = styled.p`
    font-size: 1rem;
    color: #6b7280;
    text-align: center;
    max-width: 240px;
    line-height: 1.5;
    margin: 0;
`

const AlertCount = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #dc2626;
    color: #ffffff;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    height: 1.5rem;
    padding: 0 0.75rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`

export default function RightCard(props: { data: LowStockAlert[] | null }) {
    if (props.data === null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Stock Alerts</CardTitle>
                </CardHeader>
                <CardContents>
                    <EmptyContainer>
                        <EmptyText>Loading alerts...</EmptyText>
                    </EmptyContainer>
                </CardContents>
            </Card>
        )
    }

    const is_empty: boolean = props.data.length === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
                {!is_empty && <AlertCount>{props.data.length} Items</AlertCount>}
            </CardHeader>
            <CardContents>
                {is_empty ? (
                    <EmptyContainer>
                        <EmptyIcon />
                        <EmptyText>
                            Inventory levels are healthy. No low stock alerts.
                        </EmptyText>
                    </EmptyContainer>
                ) : (
                    props.data.map((it, i) => <StockAlertItem index={i} item={it} key={i} />)
                )}
            </CardContents>
        </Card>
    )
}