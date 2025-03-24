"use client"
import { useUser } from "@clerk/nextjs"; // Import useUser hook from Clerk
import { 
    Home, 
    User, 
    GraduationCap, 
    Mail, 
    Send, 
    BookOpen 
} from "lucide-react"; // Import appropriate icons
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function SideNav() {
    const { user } = useUser(); // Get user data from Clerk
    const path = usePathname(); // Get current path

    // State to track hovered item
    const [hoveredItem, setHoveredItem] = useState(null);

    const menu = [
        {
            id: 8,
            name: "Dashboard",
            icon: Home,
            path: "/dashboard",
            auth: true,
        },
        {
            id: 1,
            name: "Profile",
            icon: User,
            path: user ? `/profile/${user.id}` : "/profile",
            auth: true,
        },
        {
            id: 2,
            name: "Learnings",
            icon: GraduationCap,
            path: "/learnings",
            auth: true,
        },
        {
            id: 3,
            name: "Inbox",
            icon: Mail,
            path: "/inbox",
            auth: true,
        },
        {
            id: 4,
            name: "Requests",
            icon: Send,
            path: "/requests",
            auth: true,
        },
    ];

    useEffect(() => {
        console.log("path", path);
    }, []);

    return (
        <div className="p-5 bg-white shadow-sm border h-screen relative">
            <hr className="mt-5"></hr>
            <div className="mt-6">
                {menu.map((item) => 
                    item.auth && (
                        <Link 
                            key={item.id} 
                            href={item.path}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div 
                                className={`group flex gap-3 mt-2 p-3 text-[18px] items-center text-gray-500 cursor-pointer hover:bg-slate-300 hover:text-gray-700 rounded-md transition-all ease-in-out duration-200 
                                ${path.includes(item.path) && "bg-slate-500 text-white"}`}
                            >
                                <item.icon className="group-hover:animate-bounce" />

                                {/* Mini pop-up tooltip */}
                                {hoveredItem === item.id && (
                                    <div className="absolute left-16 bg-gray-800 text-white text-sm px-2 py-1 rounded-md shadow-md">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}

export default SideNav;
