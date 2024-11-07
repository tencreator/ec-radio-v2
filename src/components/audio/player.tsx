"use client"
import { useEffect, useRef } from 'react'

function AudioPlayer({audio, playing, volume, setPlaying}: {
    audio: {
        url: string,
        format: string
        bitrate: number
    }[],
    playing: boolean,
    volume: number,
    setPlaying: (playing: boolean) => void,
    setVolume: (volume: number) => void
}): JSX.Element {
    const audioRef = useRef<HTMLAudioElement>(null)
    
    async function reloadAudio(audioRef: React.MutableRefObject<HTMLAudioElement | null>, playing: boolean): Promise<void> {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.load()
    
            audioRef.current.oncanplay = () => {
                if (!audioRef.current) return
                if (playing) {
                    audioRef.current.play()
                } else {
                    audioRef.current.pause()
                }
            }
        }
    }

    useEffect(() => {
        if (!audioRef.current) return

        reloadAudio(audioRef, playing)

        addEventListener('keypress', (e)=> {
            if (e.code === 'Space') {
                e.preventDefault()
                setPlaying(!playing)
            }
        })

        return () => {
            removeEventListener('keypress', (e) => {
                if (e.code === 'Space') {
                    e.preventDefault()
                    setPlaying(!playing)
                }
            })
        }
    }, [playing])

    useEffect(() => {
        if (!audioRef.current) return

        audioRef.current.volume = volume / 100
    }, [volume])

    return (
        <audio hidden ref={audioRef} id="audioPlayer">
            {audio.map((source, index) => (
                <source key={index} src={source.url} type={source.format} />
            ))}
        </audio>
    )
}

export default AudioPlayer
export { AudioPlayer }