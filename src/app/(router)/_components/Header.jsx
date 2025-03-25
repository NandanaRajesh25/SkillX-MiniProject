"use client";
import { BellDot, Search } from "lucide-react";
import Link from "next/link";
import React from "react";
import { SignOutButton } from "@clerk/nextjs";

function Header() {
  return (
    <div className="p-4 flex justify-between items-center shadow-md">
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        {/* Placeholder for search or logo */}
      </div>

      {/* Sign Out Button */}
      <SignOutButton>
      <button className="h-[50px] w-[120px] bg-[#1a1d2e] flex justify-center items-center cursor-pointer font-[Consolas] border border-[#2a2f45] text-[16px] text-gray-400 transition duration-300 rounded-[5px] shadow-lg bg-gradient-to-r from-[#171a2b] to-[#10121f] 
        hover:shadow-[0px_0px_15px_#2b3050,0px_0px_25px_#3a3f66] 
        hover:text-gray-200 hover:bg-gradient-to-r hover:from-[#20243a] hover:to-[#16182b] 
        active:shadow-[0px_0px_20px_#32385a,0px_0px_35px_#464d7a] 
        active:text-gray-100">
        Sign Out
      </button>

      </SignOutButton>
    </div>
  );
}

export default Header;
