"use client"
import { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import { notFound } from "next/navigation"
import { GetStaticProps } from "next"

export default function ViewPolicy({policy}: {policy: {id: number, name: string, text: string}}) {
    if (!policy) {
        return notFound()
    }

    return (
        <div className="mt-4 lg:w-11/12">
            {policy && (
                <div className="markdown">
                    <ReactMarkdown>{policy.text}</ReactMarkdown>
                </div>
            )}
        </div>
    )
}