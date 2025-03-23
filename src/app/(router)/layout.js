import React from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";

function Layout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden sm:block sm:w-24 fixed">
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 sm:ml-24">
        <Header />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
