import { NextRequest, NextResponse } from "next/server";
import { Azuracast } from "@/utils/apis/azuracast";
import { Spotify } from "@/utils/apis/spotify";

const spotify = new Spotify(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string)

export interface APIResponse {
  mounts: {
    [key: number]: {
      url: string
      bitrate: number
    }
  }
  hls: boolean
  streamer: {
    name: string
    art: string
  }
  song: Song
}

interface Song {
  title: string
  artist: string
  art: string
  spotify: string | false
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const mounts = await Azuracast.getMounts()
  const hls = await Azuracast.getHls()
  const streamer = await Azuracast.getStreamer()
  const song = await Azuracast.getNowPlaying()

  const search = await spotify.search(song.title, song.artist)

  let songInfo: Song = {
    title: song.title,
    artist: song.artist,
    art: song.art,
    spotify: search ? search.url : false
  }

  if (search) {
    songInfo = {
      title: search.title,
      artist: search.artist,
      art: search.art,
      spotify: search.url
    }
  }

  return NextResponse.json({ 
    mounts,
    hls,
    streamer,
    song: songInfo
  })
}