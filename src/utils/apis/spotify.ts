import Caching from "../cache"

interface searchResponse {
    title: string
    artist: string
    art: string
    url: string | false
}

interface searchExtensiveResponse extends searchResponse {
    album: string
    explicit: boolean
    duration: number
}

class Spotify {
    private accessToken: string | false = false
    private clientId: string
    private clientSecret: string
    private timeout: any
    private cache: Caching = new Caching()

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId
        this.clientSecret = clientSecret
    }

    private async getAccessToken(): Promise<void> {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }

        try {
            const response = await fetch(`https://accounts.spotify.com/api/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: 'grant_type=client_credentials'
            })

            const data = await response.json()

            this.accessToken = data.access_token

            this.timeout = setTimeout(() => {
                this.getAccessToken()
            }, data.expires_in * 1000)

            this.accessToken = data.access_token
        } catch (e) {
            console.log('Failed to get access token', e)
            console.log('Retrying in 5 seconds')

            this.timeout = setTimeout(() => {
                this.getAccessToken()
            }, 5000)
        }
    }

    public async search(title: string, artist: string): Promise<searchResponse | false> {
        if (this.cache.has(`${title} - ${artist}`)) {
            return this.cache.get(`${title} - ${artist}`)
        }

        if (!this.accessToken) {
            await this.getAccessToken()
        }

        if (!this.accessToken) {
            return false
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${title} - ${artist}`)}&type=track&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })

            const data = await response.json()

            if (data.tracks.items.length === 0) {
                return false
            }

            const track = data.tracks.items[0]

            let res: searchResponse = {
                title: track.name,
                artist: track.artists[0].name,
                art: track.album.images[0].url,
                url: track.external_urls.spotify
            }

            this.cache.set(`${title} - ${artist}`, res, 60)

            return res
        } catch (e) {
            console.log('Failed to search\n', e)
            return false
        }
    }

    public async searchExtensive(title: string, artist: string): Promise<searchExtensiveResponse | false> {
        if (this.cache.has(`${title} - ${artist} - extensive`)) {
            return this.cache.get(`${title} - ${artist} - extensive`)
        }

        if (!this.accessToken) {
            await this.getAccessToken()
        }

        if (!this.accessToken) {
            return false
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${title} - ${artist}`)}&type=track&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })

            const data = await response.json()

            if (data.tracks.items.length === 0) {
                return false
            }

            const track = data.tracks.items[0]

            let res: searchExtensiveResponse = {
                title: track.name,
                artist: track.artists[0].name,
                art: track.album.images[0].url,
                url: track.external_urls.spotify,
                album: track.album.name,
                explicit: track.explicit,
                duration: track.duration_ms / 1000
            }

            this.cache.set(`${title} - ${artist} - extensive`, res, 60)

            return res
        } catch (e) {
            console.log('Failed to search', e)
            return false
        }
    }
}

export default Spotify
export { Spotify }