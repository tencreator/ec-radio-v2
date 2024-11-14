'use client'

import { useEffect, useState } from 'react'

interface ActionButtonProps {
    action: string
    requestId: string
    filter: string
    updateRequests: (arg0: string) => Promise<void>
}

export default function RequestBtn({ action, requestId, filter, updateRequests }: ActionButtonProps) {
    const [disabled, setDisabled] = useState<boolean>(false)

    async function handleRequest(action: string, id: string): Promise<void> {
        await fetch(`/api/requests/manage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id, 
                action: action
            })
        })
    }

    async function handleClick(e: any) {
        setDisabled(true)
        await handleRequest(action, requestId)
        await updateRequests(filter)
    }

    return (
        <button className={`btn btn-sm btn-${action === 'accept' ? 'primary' : 'danger'}`} disabled={disabled} onClick={handleClick}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
        </button>
    )
}