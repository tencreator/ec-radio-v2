export interface Song {
    title: string
    artist: string
    album: string
    url: string
    explicit: boolean
    duration: number    
}

export interface TimetableData {
    bookings: {
        id: number
        date: string
        time: string
        user: {
            id: number
            name: string
            avatar: string
        }
    }[]
}