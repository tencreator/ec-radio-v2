import { headers } from "next/headers"
import { TimetableData } from "@/utils/types"
import { getFormattedDate } from "@/utils/functions";

import Cell from "./TimetableCell"

const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function Timetable({date}: {date: string}) {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    async function checkDate() {
        const formattedDate = await getFormattedDate(date);
        return new Date().toISOString().split("T")[0] === formattedDate
    }

    function getDayFromDate(date: string) {
        const day = new Date(date).getDay();
        return dayList[day];
    }

    const res = await fetch(`${url}/api/staff/presenter/timetable?date=${date}`)
    const data: TimetableData = await res.json()

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
                        console.log('Booking for ', time, booking)
                        return (
                            <Cell key={time} time={time} booked={!!booking} currentDay={await checkDate()} user={booking?.user} />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}