"use client";
import React from "react";

export default function UserInfo({ name, email }) {
    return (
        <div className="border p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold">User Information</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
        </div>
    );
}
