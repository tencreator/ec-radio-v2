import { Song } from "../types"

interface NowPlaying {
    title: string
    artist: string
    art: string
}

interface streamer {
    name: string
    art: string
}

interface Mounts {
    [key: number]: Mount
}

interface Mount {
    url: string
    bitrate: number
    format: string
}

interface StationStats {
    listeners: number
    is_live: boolean
    streamer: {
        name: string
        art: string
    }
    current_song: {
        title: string
        artist: string
    }
    next_song?: {
        title: string
        artist: string
    }
}

class Azuracast {
    private baseURl: string = process.env.AZURACAST_URL as string
    private apikey: string = process.env.AZURACAST_API_KEY as string
    private stationID: number = parseInt(process.env.AZURACAST_STATION_ID as string)

    public static async getNowPlaying(): Promise<NowPlaying> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            return {
                artist: data.now_playing.song.artist,
                title: data.now_playing.song.title,
                art: data.now_playing.song.art,
            }
        } catch {
            return {
                artist: "Unknown",
                title: "Unknown",
                art: "",
            }
        }
    }

    public static async getStreamer(): Promise<streamer> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            if (data.live.is_live) {
                return {
                    name: data.live.streamer_name,
                    art: data.live.art,
                }
            } else {
                return {
                    name: process.env.AUTODJ_NAME as string,
                    art: process.env.AUTODJ_IMG as string,
                }
            }

        } catch {
            return {
                name: "Unknown",
                art: "",
            }
        }
    }

    public static async getListeners(): Promise<number> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            return data.listeners.unique
        } catch {
            return 0
        }
    }

    public static async getHls(): Promise<string | false> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            if (data.station.hls_enabled) {
                return data.station.hls_url
            } else {
                return false
            }
        } catch {
            return false
        }
    }

    public static async getMounts(): Promise<Mounts> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            let mounts: Mounts = {}

            for (const mount of data.station.mounts) {
                mounts[mount.id] = {
                    url: mount.url,
                    bitrate: mount.bitrate,
                    format: convertFileToHtmlType(mount.format),
                }
            }

            return mounts
        } catch {
            return {}
        }
    }

    public static async getStationStats(): Promise<StationStats> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            
            let current_song = {
                title: data.now_playing.song.title,
                artist: data.now_playing.song.artist,
            }

            let next_song = undefined

            if (data.playing_next?.song?.title && data.playing_next?.song?.artist) {
                next_song = {
                    title: data.playing_next.song.title,
                    artist: data.playing_next.song.artist,
                }
            }

            return {
                listeners: data.listeners.unique,
                is_live: data.live.is_live,
                streamer: {
                    name: data.live.streamer_name,
                    art: data.live.art,
                },
                current_song: current_song,
                next_song: next_song,
            }
        } catch {
            return {
                listeners: 0,
                is_live: false,
                streamer: {
                    name: "Unknown",
                    art: "",
                },
                current_song: {
                    title: "Unknown",
                    artist: "Unknown",
                },
                next_song: undefined,
            }
        }
    }
}

function convertFileToHtmlType(fileExt: string): string {
    switch (fileExt) {
        case "mp3":
            return "audio/mpeg"
        case "ogg":
            return "audio/ogg"
        case "flac":
            return "audio/flac"
        case "wav":
            return "audio/wav"
        case "m4a":
            return "audio/mp4"
        case "aac":
            return "audio/aac"
        case "webm":
            return "audio/webm"
        case "opus":
            return "audio/opus"
        default:
            return "audio/mpeg"
    }
}

export default Azuracast
export { Azuracast }
export type { NowPlaying, streamer, Mounts, Mount }