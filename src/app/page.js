"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function Home() {
    const router=useRouter();
    useEffect(()=>{
        router.push('/sign-in')
      },[])
  return (
    <div></div>
  )
}

export default Home