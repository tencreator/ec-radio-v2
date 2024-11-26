import ReactMarkdown from 'react-markdown'
import { notFound } from "next/navigation"

export default async function ViewPolicy({policy}: {policy: {id: number, name: string, text: string}}) {
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

export async function Skeleton() {
    return (
        <div className="mt-4 lg:w-11/12">
            <div className="markdown flex flex-row gap-2">
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
            </div>
        </div>
    )
}