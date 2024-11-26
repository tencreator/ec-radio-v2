"use client"
import { useRouter } from "next/navigation"

async function bookSlot(time: string, date: string, router: {refresh: () => void}){
    let formattedTime = time.split(":")[0] + ":00"
    const res = await fetch(`/api/staff/presenter/timetable?date=${encodeURIComponent(date)}&time=${encodeURIComponent(formattedTime)}`, {
        method: 'POST',
    })

    if (!res.ok) {
        console.error('Failed to book slot')
        return
    }

    router.refresh()
}

async function unbookSlot(time: string, date: string, router: {refresh: () => void}){
    let formattedTime = time.split(":")[0] + ":00"
    const res = await fetch(`/api/staff/presenter/timetable?date=${encodeURIComponent(date)}&time=${encodeURIComponent(formattedTime)}`, {
        method: 'DELETE',
    })

    if (!res.ok) {
        console.error('Failed to unbook slot')
        return
    }

    router.refresh()
}

function UnbookButton({time, date}: {time: string, date: string}) {
    const router = useRouter()

    return (
        <button className="btn btn-sm btn-error w-full mt-4" onClick={async (e)=>{
            if (e.currentTarget) e.currentTarget.disabled = true
            await unbookSlot(time, date, router)
            if (e.currentTarget) e.currentTarget.disabled = false
        }}>Unbook Slot</button>
    )
}

function BookButton({time, date}: {time: string, date: string}) {
    const router = useRouter()

    return (
        <button className="btn btn-sm btn-primary mt-auto w-full" onClick={async (e)=>{
            if (e.currentTarget) e.currentTarget.disabled = true
            await bookSlot(time, date, router)
            if (e.currentTarget) e.currentTarget.disabled = false
        }}>Book Slot</button>
    )
}

export { BookButton, UnbookButton }