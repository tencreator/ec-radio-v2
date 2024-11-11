"use client"

import { APIResponse } from "@/app/api/stats/route"
import { useEffect, useState } from "react"
import { Permissions, hasPermissionSync } from "@/utils/permissions"

export default function Stats({ perms }: { perms: string[] }) {
    const [data, setData] = useState<APIResponse | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchStats() {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
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

            <SongCard song={loading ? {} : data?.current_song} title="Current Song" skip={true} perms={perms} isLive={data?.is_live || false} />
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

function SongCard({ song, title, skip = false, perms = [], isLive }: { song: Song | undefined, title: string, skip?: boolean, perms?: string[], isLive: boolean }) {
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
                    <p>{song.album || 'Album'}</p>
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

                    {skip && hasPermissionSync({ user: { perms } }, Permissions.CONTROLS_BACKEND_SKIP) && !isLive && (
                        <button className="btn bg-red-500 border border-solid border-red-500 flex items-center" onClick={()=>{
                            fetch('/api/staff/controls/skip', { method: 'GET' })
                        }}>
                            <i className="fa-solid fa-forward"></i>
                            <p>Skip</p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function formatTime(seconds: number) {
    let suffix = ''
    let str = ''

    let hours = Math.floor(seconds / 3600)
    let minutes = Math.floor(seconds % 3600 / 60)
    let sec = Math.floor(seconds % 3600 % 60)

    if (hours > 0) {
        str += hours + ':'
        if (suffix == '') suffix = 'Hours'
    }
    
    if (minutes > 0) {
        str += minutes + ':'
        if (suffix == '') suffix = 'Minutes'
    }

    if (sec > 0) {
        str += sec
        if (suffix == '') suffix = 'Seconds'
    }
    
    if (str.length === 2) str = '0:0' + str
    if (str.length === 3) str = '0:' + str
    if (str.length === 4) str = '0' + str

    return str + ' ' + suffix
}