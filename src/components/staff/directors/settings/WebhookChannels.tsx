"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function WebhookChannels({
    data,
    edit
}: {
    data: {
        id: string,
        songchanged: string,
        listenerStats: string,
        djConnected: string,
        djDisconnected: string,
        stationDown: string,
        stationUp: string
    },
    edit: boolean
}) {
    const router = useRouter()
    const [songChanged, setSongChanged] = useState(data.songchanged)
    const [listenerStats, setListenerStats] = useState(data.listenerStats)
    const [djConnected, setDjConnected] = useState(data.djConnected)
    const [djDisconnected, setDjDisconnected] = useState(data.djDisconnected)
    const [stationDown, setStationDown] = useState(data.stationDown)
    const [stationUp, setStationUp] = useState(data.stationUp)
    const [status, setStatus] = useState({status: false, display: false, message: 'Test'})

    async function saveChanges() {
        const res = await fetch(`/api/staff/director/settings/webhookChannels`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                songchanged: songChanged,
                listenerStats,
                djConnected,
                djDisconnected,
                stationDown,
                stationUp
            })
        })

        if (!res.ok) {
            setStatus({
                status: true,
                display: true,
                message: 'Changes saved successfully'
            })
        } else {
            setStatus({
                status: false,
                display: true,
                message: 'Failed to save changes'
            })
        }
        
        router.refresh()
    }

    useEffect(()=>{
        const timer = setTimeout(() => {
            setStatus({
                ...status,
                display: false
            })
        }, 5000)

        return () => clearTimeout(timer)
    })

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl">Webhook Channels</h2>
            { status.display && <div className={`alert ${status.status ? 'alert-success' : 'alert-error'}`}>
                {status.status ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )} {status.message}
            </div> }
            {edit && <button className="btn btn-primary btn-sm w-fit" onClick={saveChanges}>Edit</button>}

            <div className="flex flex-col">
                <label htmlFor="songChanged">Song Changed</label>
                <input className="input input-sm bg-base-200" type="text" id="songChanged" value={songChanged} disabled={!edit} onChange={e => setSongChanged(e.target.value)} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="listenerStats">Listener Stats</label>
                <input className="input input-sm bg-base-200" type="text" id="listenerStats" value={listenerStats} disabled={!edit} onChange={e => setListenerStats(e.target.value)} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="djConnected">DJ Connected</label>
                <input className="input input-sm bg-base-200" type="text" id="djConnected" value={djConnected} disabled={!edit} onChange={e => setDjConnected(e.target.value)} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="djDisconnected">DJ Disconnected</label>
                <input className="input input-sm bg-base-200" type="text" id="djDisconnected" value={djDisconnected} disabled={!edit} onChange={e => setDjDisconnected(e.target.value)} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="stationDown">Station Down</label>
                <input className="input input-sm bg-base-200" type="text" id="stationDown" value={stationDown} disabled={!edit} onChange={e => setStationDown(e.target.value)} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="stationUp">Station Up</label>
                <input className="input input-sm bg-base-200" type="text" id="stationUp" value={stationUp} disabled={!edit} onChange={e => setStationUp(e.target.value)} />
            </div>
        </div>
    )
}