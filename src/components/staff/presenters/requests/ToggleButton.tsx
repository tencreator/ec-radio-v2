'use client'

import { useState, useEffect } from 'react'

export default function ToggleRequestsButton() {
    const [disabled, setDisabled] = useState(false)
    const [acceptingRequests, setAcceptingRequests] = useState(false)

    async function getRequestStatus() {
        const res = await fetch('/api/requests/status')
        const data = await res.json()
        setAcceptingRequests(data.acceptingRequests)
        console.log(data)
    }

    async function toggleRequests() {
        setDisabled(true)
        const res = await fetch('/api/requests/status', {
            method: 'POST',
        })
        const data = await res.json()

        setAcceptingRequests(data.acceptingRequests)
        setDisabled(false)
    }

    useEffect(() => {
        getRequestStatus()
    }, [])


    return (
        <button onClick={toggleRequests} disabled={disabled} className="btn btn-primary w-fit">
            {acceptingRequests ? 'Disable' : 'Enable'}
        </button>
    )
}