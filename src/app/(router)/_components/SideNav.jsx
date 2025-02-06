"use client"
import { useUser } from '@clerk/nextjs' // Import useUser hook from Clerk
import { Album, BadgeIcon, BadgeXIcon, BookOpen, LayoutGrid, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

function SideNav() {
    const { user } = useUser();  // Get user data from Clerk
    const menu = [
        {
            id: 8,
            name: 'Dashboard',
            icon: Album,
            path: '/dashboard',
            auth: true,
        },
        {
            id: 1,
            name: 'Profile',
            icon: BookOpen,
            path: user ? `/profile/${user.id}` : '/profile',
            auth: true
        },
        {
            id: 2,
            name: 'Learning',
            icon: LayoutGrid,
            path: '/learning',
            auth: true
        },
        {
            id: 3,
            name: 'Inbox',
            icon: Mail,
            path: '/inbox',
            auth: true
        },
        {
            id: 4,
            name: 'Request',
            icon: BadgeXIcon,
            path: '/request',
            auth: true
        },
        {
            id: 5,
            name: 'NewsLetter',
            icon: Mail,
            path: '/newsletter',
            auth: true
        },
    ]

    const path = usePathname();

    useEffect(() => {
        console.log("path", path)
    }, [])

    return (
        <div className='p-5 bg-white shadow-sm border h-screen'>
            <Image src='/profile.png' alt='profile' width={170} height={80} />
            <hr className='mt-5'></hr>
            <div className="mt-6">
                {menu.map((item) =>
                    item.auth && (
                        <Link key={item.id} href={item.path}>
                            <div className={`group flex gap-3 mt-2 p-3 text-[18px] items-center text-gray-500 cursor-pointer hover:bg-slate-300 hover:text-gray-500 rounded-md transition-all ease-in-out duration-200 ${path.includes(item.path) && 'bg-slate-500 text-white'}`}>
                                <item.icon className="group-hover:animate-bounce" />
                                <h2>{item.name}</h2>
                            </div>
                        </Link>
                    )
                )}
            </div>
        </div>
    )
}

export default SideNav
