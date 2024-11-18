import { useEffect, useState } from "react"

interface Props {
    date: string
    time: string
    booked: boolean
    currentDay: boolean
    user?: {
        id: number
        name: string
        avatar: string
    }
    me: string
    fetchData: () => Promise<void>
}

export default function Cell({date, time, booked, currentDay, user, me, fetchData}: Props) {
    const [isLive, setIsLive] = useState(false)

    function isCurrent() {
        const hour = new Date().getHours()
        const eventHour = parseInt(time.split(":")[0])

        if (currentDay && hour === eventHour) {
            return true
        } else {
            return false
        }
    }

    async function bookSlot(){
        let formattedTime = time.split(":")[0] + ":00"
        const res = await fetch(`/api/staff/presenter/timetable?date=${encodeURIComponent(date)}&time=${encodeURIComponent(formattedTime)}`, {
            method: 'POST',
        })

        if (!res.ok) {
            console.error('Failed to book slot')
            return
        }

        await fetchData()
    }

    async function unbookSlot(){
        let formattedTime = time.split(":")[0] + ":00"
        const res = await fetch(`/api/staff/presenter/timetable?date=${encodeURIComponent(date)}&time=${encodeURIComponent(formattedTime)}`, {
            method: 'DELETE',
        })

        if (!res.ok) {
            console.error('Failed to unbook slot')
            return
        }

        await fetchData()
    }

    useEffect(() => {
        setIsLive(isCurrent())

        const timeout = setTimeout(() => {
            setIsLive(isCurrent())
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [isLive, currentDay])
    
    return (
        <div className={"card bg-base-300 shadow-md border-solid border-2 " + (isLive ? 'border-red-600 shadow-red-600' : 'border-base-100')}>
            <div className="card-body">
                <div className="card-title flex flex-row">
                    <h2>{time}</h2>
                    {isLive && (
                        <div className="ml-auto card-actions justify-end">
                            <h2 className="badge badge-outline badge-error">Now</h2>
                        </div>
                    )}
                </div>
                <hr />
                <div>
                    {booked ? (
                        user ? (
                            <div className="flex flex-row items-center">
                                <img src={user.avatar} height={32} width={32} className="rounded-full mr-2" />
                                <p>{user.name}</p>
                                {me === user.id.toString() && (
                                    <button className="btn btn-sm btn-error ml-auto" onClick={async (e)=>{
                                        e.currentTarget.disabled = true
                                        unbookSlot()
                                        e.currentTarget.disabled = false
                                    }}>X</button>
                                )}
                            </div>
                        ) : (
                            <p>We had an oopsie!</p>
                        )
                    ) : (
                        <button className="btn btn-sm btn-primary" onClick={async (e)=>{
                            e.currentTarget.disabled = true
                            bookSlot()
                            e.currentTarget.disabled = false
                        }}>Book now</button>
                    )}
                </div>
            </div>
        </div>
    )
}