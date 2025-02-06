"use client";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
//import { ApolloProvider } from "@apollo/client";
//import ApolloWrapper from "../components/ApolloWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    //<ApolloProvider>
    <ClerkProvider>
      {/* <ApolloWrapper> */}
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            {children}
          </body>
        </html>
      {/* </ApolloWrapper> */}
    </ClerkProvider>
    //</ApolloProvider>
  );
}
