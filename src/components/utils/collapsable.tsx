"use client"
import { useState, useEffect } from "react"

export default function Collapsable({ title, children }: { title: string, children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="collapse shadow-md border-2 border-solid border-base-300 bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title flex flex-row items-center">
                {title}
            </div>

            <div className="collapse-content">
                {children}
            </div>
        </div>
    )
}