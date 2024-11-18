import { useEffect, useState } from "react"
import TimetableCell from "./TimetableCell"

interface Props {
    date: string
}

interface TimetableData {
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

export default function Timetable({date}: Props) {
    const [data, setData] = useState(null)
}