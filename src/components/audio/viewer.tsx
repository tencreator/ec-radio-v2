"use client"
import { useEffect, useState } from "react";
import { APIResponse as Info } from "@/app/api/route";
import { Mount } from "@/utils/apis/azuracast";
import Player from './player'
import RequestModal from "./RequestModal";

function truncate(str: string, n: number): string {
    return str.length > n ? str.substring(0, n - 1) + "..." : str
}

function updateMediaSession(info: Info | null, playing: boolean, setPlaying: (playing: boolean)=> void): void {
    if (!info) return

    navigator.mediaSession.metadata = new MediaMetadata({
        title: info.song.title,
        artist: info.song.artist,
        album: 'EC Radio',
        artwork: [
            {src: info.song.art, sizes: '96x96', type: 'image/png'},
            {src: info.song.art, sizes: '128x128', type: 'image/png'},
            {src: info.song.art, sizes: '192x192', type: 'image/png'},
            {src: info.song.art, sizes: '256x256', type: 'image/png'},
            {src: info.song.art, sizes: '384x384', type: 'image/png'},
            {src: info.song.art, sizes: '512x512', type: 'image/png'}
        ]
    })

    navigator.mediaSession.setActionHandler('play', ()=>{
        setPlaying(true)
    })

    navigator.mediaSession.setActionHandler('pause', ()=>{
        setPlaying(false)
    })

    navigator.mediaSession.setActionHandler('stop', ()=>{
        setPlaying(false)
    })
}

export default function Viewer(): JSX.Element {
    const [info, setInfo] = useState<Info | null>(null)
    const [Mounts, setMounts] = useState<Mount[] | null>(null)

    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(100)

    async function fetchData() {
        const response = await fetch("/api")
        const data = await response.json()
        setInfo(data)
        const mounts: Mount[] = []

        if (data.mounts) {
            for (const mount in data.mounts) {
                mounts.push({
                    url: data.mounts[mount].url,
                    bitrate: data.mounts[mount].bitrate,
                    format: data.mounts[mount].format
                })
            }

            if (data.hls) {
                mounts.push({url: data.hls, bitrate: 0, format: 'application/x-mpegURL'})
            }

            setMounts(mounts)
        }
    }

    useEffect(() => {
        fetchData()

        setInterval(() => {
            fetchData()
        }, 2500)
    }, [])

    useEffect(()=>{
        const vol = localStorage.getItem('volume')
        if (vol) {
            console.log('Setting volume to', vol)
            setVolume(parseInt(vol))
        }
    }, [])

    useEffect(()=>{
        updateMediaSession(info, playing, setPlaying)
    }, [info])

    useEffect(()=>{
        localStorage.setItem('volume', volume.toString())
    }, [volume])
    
    return (
        <>
            <section className="w-full flex justify-center fixed bottom-0 mb-2 z-50">
                <div className="flex flex-col md:flex-row items-center w-11/12 md:w-9/12 lg:w-8/12 xl:w-6/12 overflow-hidden py-1 rounded-md border-solid border-2 bg-zinc-700 border-zinc-500">
                    <div className="mx-auto flex flex-row">
                        <button onClick={()=>{
                            setPlaying(!playing)
                        }} className="btn btn-ghost flex justify-center items-center">
                            <i className={(playing ? 'fa-pause' : 'fa-play' )+' fa-solid'}></i>
                        </button>
                        <RequestModal />
                        <a href="https://discord.gg/ecrp" className="btn btn-ghost" target="_blank">
                            <i className="fa-brands fa-discord"></i>
                        </a>
                        {info?.song.spotify && (
                            <a className="btn btn-ghost" href={info?.song.spotify} target="_blank">
                                <i className="fa-brands fa-spotify"></i>
                            </a>
                        )}
                    </div>
                    <div className="mx-auto">
                        <div className="song-card flex flex-row justify-center items-center">
                            <div className="card-img flex justify-center items-center">
                                <img
                                    src={info?.song.art || 'https://radio.emeraldcoastrp.com/static/uploads/browser_icon/48.1728930901.png'}
                                    alt="Song art"
                                    width={46}
                                    height={46}
                                />
                            </div>

                            <div className="ml-2">
                                <h2 className="text-">{truncate(info?.song.title || 'Loading...', 30)} - {truncate(info?.song.artist || 'Loading...', 20)}</h2>
                                <div className="flex flex-row">
                                    <img
                                        src={info?.streamer.art || 'https://radio.emeraldcoastrp.com/static/uploads/browser_icon/16.1728930901.png'}
                                        className="rounded-full mr-1"
                                        alt="Streamer Art"
                                        height={16}
                                        width={24}
                                    />
                                    <span>{info?.streamer.name || 'Loading...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto items-center hidden lg:flex">
                        <input type="range" value={volume} onChange={(event)=>{
                            setVolume(parseInt(event.target.value))
                        }} className="slider volume" />
                    </div>
                </div>
            </section>

            <Player audio={Mounts || []} playing={playing} setPlaying={setPlaying} volume={volume} setVolume={setVolume} />
        </>
    )
}