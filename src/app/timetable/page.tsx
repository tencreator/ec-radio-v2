import Timetable from "@/components/timetable/Timetable";
import { RefreshButton } from "@/components/utils/RefreshButton";

function days() {
    const today = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        days.push(date.toISOString().split("T")[0])
    }
    return days
}

export default async function Page() {
    return (
        <main className="mt-4 mx-auto lcontainer text-lg">
            <div className="flex flex-row gap-4 items-end">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Timetable</h1>
                    <p className="text-sm text-gray-500">Check out when your favourite presenter has booked a show!</p>
                </div>
                <RefreshButton />
            </div>
            <div className="mt-4 flex flex-col gap-4">
                {days().map((date) => (
                    <Timetable key={date} date={date} />
                ))}
            </div>
        </main>
    )
}