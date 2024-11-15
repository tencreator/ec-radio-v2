import { NextRequest, NextResponse } from "next/server";
import { Azuracast } from "@/utils/apis/azuracast";
import { Spotify } from "@/utils/apis/spotify";
import { Song } from "@/utils/types";
import { auth } from "@/utils/auth";
import { Permissions, hasPermissionSync } from "@/utils/permissions";

const spotify = new Spotify(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string)

export interface APIResponse {
    listeners: number
    is_live: boolean
    streamer: {
        name: string,
        art: string
    }
    current_song: Song
    next_song?: Song
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!hasPermissionSync(session, Permissions.VIEW_STATS)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        let stats = await Azuracast.getStationStats()
    
        if (!stats.is_live) {
            stats.streamer = {
                name: process.env.AUTODJ_NAME as string,
                art: process.env.AUTODJ_IMG as string
            }
        }
    
        let current_song = await spotify.searchExtensive(stats.current_song.title, stats.current_song.artist)
        let next_song = stats.next_song ? await spotify.searchExtensive(stats.next_song.title, stats.next_song.artist) : undefined
    
        let response: APIResponse = {
            listeners: stats.listeners,
            is_live: stats.is_live,
            streamer: stats.streamer,
            current_song: current_song as Song,
            next_song: next_song as Song | undefined
        }
    
        return NextResponse.json(response)
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}