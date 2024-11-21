"use client"

import { APIResponse } from "@/app/api/stats/route"
import { useEffect, useState } from "react"

export default function Stats() {
    const [data, setData] = useState<APIResponse | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchStats() {
        const res = await fetch('/api/stats', { method: 'GET' })

        if (res.status === 200) {
            const json = await res.json()
            setData(json)
            setLoading(false)
        } else {
            console.error('Failed to fetch stats:', res)
        }
    }

    useEffect(() => {
        fetchStats()
        setInterval(()=>{
            fetchStats()
        }, 2500)
    }, [])

    return (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="card bg-base-200 shadow-xl grow">
                <div className="card-body">
                    <h2 className="card-title">Staff page</h2>
                    <p>Welcome to the staff page, here you can view the statistics of the radio and info about the currently playing song and what AutoDJ has planned next!</p>
                </div>
            </div>

            <div className="card bg-base-200 shadow-xl grow">
                <div className="card-body">
                    <h2 className="card-title">Listeners</h2>
                    <div className="flex flex-row items-center">
                        <p>{loading ? 'Loading...' : data?.listeners}</p>
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 shadow-xl grow">
                <div className="card-body">
                    <h2 className="card-title">Current DJ</h2>
                    <div className="flex flex-row items-center">
                        <img src={loading ? '/img/loading.gif' : data?.streamer.art} width={24} className="mr-2 rounded-full" alt="DJ Art" />
                        <p>{loading ? 'Loading...' : data?.streamer.name}</p>
                    </div>
                </div>
            </div>

            <SongCard song={loading ? {} : data?.current_song} title="Current Song" skip={true} isLive={data?.is_live || false} />
            { !data?.is_live && (
                <SongCard song={loading ? {} : data?.next_song || {}} title="Next Song" isLive={data?.is_live || false} />
            )}
        </div>
    )
}

interface Song {
    title?: string
    artist?: string
    album?: string
    url?: string
    explicit?: boolean
    duration?: number
}

function SongCard({ song, title, skip = false, isLive }: { song: Song | undefined, title: string, skip?: boolean, isLive: boolean }) {
    const [skipDisabled, setSkipDisabled] = useState(false)

    async function skipSong() {
        setSkipDisabled(true)
        const res = await fetch('/api/staff/controls/skip', { method: 'GET' })
        setSkipDisabled(false)
    }

    if (!song) return (
        <div className="card bg-base-200 shadow-xl grow">
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>Loading...</p>
            </div>
        </div>
    )

    return (
        <div className="card bg-base-200 shadow-xl grow">
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <div>
                    <p>{song.title || 'Song title'} - {song.artist || 'Song Artits'}</p>
                    <p>{song.explicit ? "Explicit" : "Not explicit"}</p>
                    <p>{song.duration && formatTime(song.duration)}</p>
                </div>
                <div className="card-actions justify-end">
                    {song.url && (
                        <a href={song.url} target="_blank" className="btn bg-spotify border border-solid border-spotify flex items-center">
                            <i className="fa-brands fa-spotify"></i>
                            <p>Spotify</p>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    let time = ''

    if (hours > 0) time += `${hours}:`.padStart(2, '0')
    time += `${minutes}:`.padStart(3, '0')
    time += `${secs}`.padStart(2, '0')

    return time
}