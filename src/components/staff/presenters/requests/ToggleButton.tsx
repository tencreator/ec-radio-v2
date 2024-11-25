'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ToggleRequestsButton({acceptingRequests}: {acceptingRequests: boolean}) {
    const router = useRouter()
    const [disabled, setDisabled] = useState(false)

    async function toggleRequests() {
        setDisabled(true)
        const res = await fetch('/api/requests/status', {
            method: 'POST',
        })

        if (!res.ok) return setDisabled(false)
        router.refresh()
        setDisabled(false)
    }


    return (
        <button onClick={toggleRequests} disabled={disabled} className="btn btn-primary w-fit">
            {acceptingRequests ? 'Disable' : 'Enable'}
        </button>
    )
}