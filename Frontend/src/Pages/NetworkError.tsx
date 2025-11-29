import React from 'react'

export default function NetworkError(props:{err:string}) {
  return (
    <div>{props.err}</div>
  )
}
