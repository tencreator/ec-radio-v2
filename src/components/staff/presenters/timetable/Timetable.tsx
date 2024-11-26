import { getFormattedDate } from "@/utils/functions"
import TimetableCell from "./TimetableCell"
import { makeRequest } from "@/utils/request";

const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

const defaultEvent = {
    id: 0,
    name: 'Pixel Buddy',
    avatar: "https://radio.emeraldcoastrp.com/static/uploads/browser_icon/48.1728930901.png"
}

export default async function Timetable({date}: Props) {
    async function checkDate() {
        const formattedDate = await getFormattedDate(date)
        return new Date().toISOString().split("T")[0] === formattedDate        
    }

    async function fetchData() {
        const res = await makeRequest(`/api/staff/presenter/timetable?date=${date}`, {})
        const data: TimetableData = await res.json()

        return data
    }

    async function getDayFromDate(date: string) {
        const day = new Date(date).getDay()
        return dayList[day]
    }

    const data = await fetchData()

    return (
        <div className={"collapse bg-base-200 shadow-md border-2 border-solid " + (await checkDate() ? 'border-green-500 shadow-green-500' : 'border-base-300')}>
            <input type="checkbox" />
            <div className="collapse-title flex flex-row items-center">
                <h2 className="text-xl font-medium">
                    {getDayFromDate(date)}
                </h2>
                {await checkDate() && (
                    <div className="justify-end ml-auto card-actions">
                        <div className="badge badge-outline badge-success">Active</div>
                    </div>
                )}
            </div>
            <div className="collapse-content">
                <hr />
                <div className="mt-4 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {Array.from({length: 24}, async (_, i) => {
                        const time = `${i.toString().padStart(2, '0')}:00`
                        const booking = data.bookings.find(booking => booking.time === `${time}:00`)
                        return (
                            <TimetableCell key={time} time={time} booked={!!booking} currentDay={await checkDate()} user={booking?.user || defaultEvent} me="Pixel Buddy" date={date} />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export async function Skeleton() {
    return (
        <div className="collapse bg-base-200 shadow-md border-2 border-solid border-base-300">
            <div className="collapse-title flex flex-row items-center">
                <div className="skeleton w-full h-[2ch]"></div>
            </div>
        </div>
    )
}