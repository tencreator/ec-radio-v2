import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import Discord from "@/utils/apis/discord"
import Spotify from "@/utils/apis/spotify"
import { auth } from "@/utils/auth"
import exp from "constants"

const prisma = new PrismaClient()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)
const spotify = new Spotify(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string)

const actions: { [key: string]: (req: NextRequest) => Promise<NextResponse> } = {
    songChange,
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const path = request.nextUrl.pathname.split('/').pop()
    if (!isAuthed(request)) return new NextResponse('Unauthorized', { status: 401 })

    if (!path || !actions[path]) return new NextResponse('Not Found', { status: 404 })
    return actions[path](request)
}

async function songChange(req: NextRequest): Promise<NextResponse> {
    const body = await req.json()
    const rawSongData = {
        title: body.now_playing.song.title,
        artist: body.now_playing.song.artist,
        art: body.now_playing.song.art
    }

    const song = await spotify.searchExtensive(rawSongData.title, rawSongData.artist)
    const songData = song ? {
        title: song.title,
        artist: song.artist,
        art: song.art,
        spotify: song.url,
        explicit: song.explicit,
        album: song.album
    } : rawSongData

    const channelId = await prisma.webhookChannels.findFirst({
        select: {
            songchanged: true
        }
    })

    if (channelId) {
        discord.sendToChannel(channelId?.songchanged, {
            embeds: [
                {
                    title: 'Now Playing',
                    author: {
                        name: `🎵 ${songData.title} - ${songData.artist}`,
                        icon_url: songData.art
                    },
                    fields: [
                        {
                            name: 'Title',
                            value: songData.title,
                            inline: true
                        },
                        {
                            name: 'Artist',
                            value: songData.artist,
                            inline: true
                        },
                        {
                            name: 'Album',
                            value: 'album' in songData ? songData.album : 'Not available',
                            inline: true
                        },
                        {
                            name: 'Explicit',
                            value: 'explicit' in songData ? songData.explicit ? 'Yes' : 'No' : 'Not available',
                            inline: true
                        },
                        {
                            name: 'Streamer',
                            value: body.live.is_live ? body.live.streamer_name : process.env.AUTODJ_NAME as string,
                            inline: true
                        },
                        {
                            name: 'Listeners',
                            value: body.listeners.unique,
                            inline: true
                        }  
                    ],
                    footer: {
                        text: 'spotify' in songData && songData.spotify ?  'Listen on Spotify' : 'Not available on Spotify'
                    },
                    url: 'spotify' in songData && songData.spotify ? songData.spotify : undefined
                }
            ]
        })
    }

    await prisma.songLogs.create({
        data: {
            title: songData.title,
            artist: songData.artist,
            art: songData.art,
            streamer: body.live.is_live ? body.live.streamer_name : process.env.AUTODJ_NAME as string,
            listeners: body.listeners.unique,
            explicit: 'explicit' in songData ? songData.explicit : false,
            album: 'album' in songData ? songData.album : 'N/A',
            date: new Date()
        }
    })

    return new NextResponse('OK')
}

function isAuthed(req: NextRequest): boolean {
    const authDetails = req.headers.get('Authorization')
    if (authDetails && authDetails.startsWith('Basic ')) {
        const base64Credentials = authDetails.split(' ')[1]
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
        const [username, password] = credentials.split(':')
        const [WEBHOOK_USER, WEBHOOK_PASS] = (process.env.WEBHOOK_AUTH as string).split(':')
        return username === WEBHOOK_USER && password === WEBHOOK_PASS
    }

    return false
}