"use client"
import { useState, useRef, useEffect } from "react";

export default function Timetable() {
    return (
        <main className="mt-4 mx-auto lg:w-10/12 text-lg flex flex-col gap-4 justify-center">
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
        <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="timetable-day"/>
            <div className="collapse-title text-xl font-medium">{day}</div>
            <div className="collapse-content grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {Object.entries(events).map(([time, title], index) => {
                    return <TimetableEvent key={index} time={time.toString().padStart(2, "0") + ":00"} title={Array.isArray(title) ? title.join(", ") : title} day={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day)} isFirst={index === 0} isLast={index === Object.entries(events).length - 1} />
                })}
            </div>
        </div>
    )
}

function TimetableEvent({ time, title, day, isFirst = false, isLast = false }: { time: string, title: string, day: number, isFirst?: boolean, isLast?: boolean }) {
    // const timePassed = () => {
    //     const hour = new Date().getHours()
    //     const eventHour = parseInt(time.split(":")[0]);
    //     const dayPassed = new Date().getDay() > day;
    //     const currentDay = new Date().getDay() === day;

    //     if (dayPassed) {
    //         return true;
    //     } else if (currentDay && hour > eventHour) {
    //         return true;
    //     } else {
    //         return false
    //     }
    // }

    // const isCurrent = () => {
    //     const hour = new Date().getHours()
    //     const eventHour = parseInt(time.split(":")[0]);
    //     const dayPassed = new Date().getDay() > day;
    //     const currentDay = new Date().getDay() === day;

    //     if (dayPassed) {
    //         return true;
    //     } else if (currentDay && hour === eventHour) {
    //         return true;
    //     } else {
    //         return false
    //     }
    // }

    return (
        <div className="card bg-base-300 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{time}</h2>
                <p>{title}</p>
            </div>
        </div>
    );
}