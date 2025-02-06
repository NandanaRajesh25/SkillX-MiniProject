"use client"
//import { Button } from './src/components/ui/button'
//import { UserButton, useUser } from '@clerk/nextjs'
import { BellDot, Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { SignOutButton } from "@clerk/nextjs";

function Header() {
  //const {user,isLoaded}=useUser();
  return (
    <div className='p-4 bg-white flex justify-between'>
      <div className='flex ga-2 border p-2 rounded-md'>
        <Search className='h-5 w-5' />
        <input type="text" placeholder='Search...' className='outline-none'/>
      </div>
      <SignOutButton>
      <button className="px-4 py-2 bg-slate-500 text-white rounded-md">
        Sign Out
      </button>
    </SignOutButton>
      {/* <div className='flex items-center gap-4'>
        <BellDot className='text-gray-500'/>
        {isLoaded&&user?
        <UserButton afterSignOutUrl='/courses'/>:
        <Link href={'/sign-in'}>
        <Button>Get Started</Button>
        </Link>}
      </div> */}
    </div>
  )
}

export default Header