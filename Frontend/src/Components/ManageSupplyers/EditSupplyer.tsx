import React, { useState } from 'react'
import type { SupplierResponse } from '../../script/objects'

export default function EditSupplyer(props:{item: SupplierResponse}) {
  const [Name,setName]=useState(props.item.Name);
  const [Email,setEmail]=useState(props.item.email);
  const [Phone,setPhone]=useState(props.item.phone_number);
  return (
    <div></div>
  )
}