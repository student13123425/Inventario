import React from 'react'
import type { LowStockAlert } from '../../script/objects'
import styled from 'styled-components'
import StockAlertItem from './StockAlertItem'
import { AiOutlineCheckCircle } from 'react-icons/ai'

const PaddingTop = styled.div`
    height: 3.25rem;
`

const Container = styled.div`
    width: 100%;
`

const Card = styled.div`
   display: flex;
   flex-direction: column;
   background-color: #ffffff;
   height: 30rem;
   border-radius: 16px;
   overflow: hidden;
   border: 1px solid #e5e7eb;
   box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
   transition: all 0.2s ease;

   &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
   }
`

const CardTitle = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    padding: 1.5rem 2rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
`

const CardContents = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
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
    font-size: 5rem;
`

const EmptyText = styled.div`
    font-size: 1rem;
    color: #6b7280;
    text-align: center;
    max-width: 200px;
    line-height: 1.5;
`

const AlertCount = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #dc2626;
    color: #ffffff;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.5rem;
    margin-left: 0.75rem;
`

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export default function RightCard(props: { data: LowStockAlert[] | null }) {
    if (props.data === null) {
        return (
            <Container>
                <PaddingTop />
                <Card>
                    <CardTitle>Stock Alerts</CardTitle>
                    <CardContents>
                        <EmptyContainer>
                            <div style={{ fontSize: '1rem', color: '#6b7280' }}>
                                Loading stock alerts...
                            </div>
                        </EmptyContainer>
                    </CardContents>
                </Card>
            </Container>
        )
    }

    const is_empty: boolean = props.data.length === 0;

    if (is_empty) {
        return (
            <Container>
                <PaddingTop />
                <Card>
                    <CardTitle>
                        <TitleContainer>
                            Stock Alerts
                        </TitleContainer>
                    </CardTitle>
                    <CardContents>
                        <EmptyContainer>
                            <EmptyIcon />
                            <EmptyText>
                                All products are well-stocked. No low stock alerts at this time.
                            </EmptyText>
                        </EmptyContainer>
                    </CardContents>
                </Card>
            </Container>
        )
    }

    return (
        <Container>
            <PaddingTop />
            <Card>
                <CardTitle>
                    <TitleContainer>
                        Stock Alerts
                        <AlertCount>
                            {props.data.length}
                        </AlertCount>
                    </TitleContainer>
                </CardTitle>
                <CardContents>
                    {props.data.map((it, i) => <StockAlertItem index={i} item={it} key={i} />)}
                </CardContents>
            </Card>
        </Container>
    )
}