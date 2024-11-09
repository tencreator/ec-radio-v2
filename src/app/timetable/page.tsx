"use client"
import { useState, useRef, useEffect } from "react";

const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


export default function Timetable() {
    return (
        <main className="mt-4 md:mx-auto lg:w-10/12 text-lg flex flex-col gap-4 justify-center grow">
            <TimetableDay day="Monday" />
            <TimetableDay day="Tuesday" />
            <TimetableDay day="Wednesday" />
            <TimetableDay day="Thursday" />
            <TimetableDay day="Friday" />
            <TimetableDay day="Saturday" />
            <TimetableDay day="Sunday" />
        </main>
    );
}

function TimetableDay({ day }: { day: string }) {
    const [loading, setLoading] = useState(true)
    const [currentDay, setCurrentDay] = useState(false)

    useEffect(() => {
        setCurrentDay(new Date().getDay() === dayList.indexOf(day))
        const timeout = setTimeout(() => {
            setCurrentDay(new Date().getDay() === dayList.indexOf(day))
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [currentDay])

    const events: { [time: number]: string | string[] } = {
        0: "Pixel Buddy",
        1: "Pixel Buddy",
        2: "Pixel Buddy",
        3: "Pixel Buddy",
        4: "Pixel Buddy",
        5: "Pixel Buddy",
        6: "Pixel Buddy",
        7: "Pixel Buddy",
        8: "Pixel Buddy",
        9: "Pixel Buddy",
        10: "Bobby B",
        11: "Bobby B",
        12: "Bobby B",
        13: "Jeff E",
        14: "Jeff E",
        15: "Jeff E",
        16: "Jeff E",
        17: "Demon",
        18: "Demon",
        19: "Demon",
        20: "Demon",
        21: "Pixel Buddy",
        22: "Pixel Buddy",
        23: "Pixel Buddy",
    }

    return (
        <div className={"collapse bg-base-200 shadow-md border-2 border-solid" + (currentDay ? '  border-green-500 shadow-green-500' : ' border-base-300')}>
            <input type="checkbox" />
            <div className="collapse-title flex flex-row items-center">
                <h2 className="text-xl font-medium">{day}</h2>
                    {currentDay && (
                        <div className="ml-auto card-actions justify-end">
                            <h2 className="badge badge-outline badge-success">Active</h2>
                        </div>
                    )}
            </div>
            <div className="collapse-content">
                <hr />
                <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {Object.entries(events).map(([time, title], index) => {
                        return <TimetableEvent 
                            key={index}
                            time={time.toString().padStart(2, "0") + ":00"}
                            title={Array.isArray(title) ? title.join(", ") : title}
                            day={dayList.indexOf(day)}
                            img="https://radio.emeraldcoastrp.com/static/uploads/browser_icon/48.1728930901.png"
                        />
                    })}
                </div>
            </div>
        </div>
    )
}

function TimetableEvent({ time, day, title, img }: { time: string, title: string, day: number, img: string }) {
    const [isLive, setIsLive] = useState(false)
    const utcTime = new Date().toUTCString()

    function isCurrent() {
        const hour = new Date(utcTime).getHours()
        const eventHour = parseInt(time.split(":")[0])
        const currentDay = new Date().getDay() === day

        if (currentDay && hour === eventHour) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        setIsLive(isCurrent())
        const timeout = setTimeout(() => {
            setIsLive(isCurrent())
        }, 1000)


        return () => {
            clearTimeout(timeout)
        }
    }, [isLive])

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
                <div className="flex flex-row items-center">
                    <img src={img} height={32} width={32} className="rounded-full mr-2" />
                    <p>{title}</p>
                </div>
            </div>
        </div>
    );
}