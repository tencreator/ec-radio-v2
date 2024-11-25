"use client"
import React, { useState, useEffect } from 'react';
import { getFormattedDate } from "@/utils/functions"
import TimetableCell from "./TimetableCell"

const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Event {
    id: number;
    name: string;
    avatar: string;
}

interface Props {
    data: {
        bookings: {
            date: string;
            time: string;
            user: {
                id: number;
                name: string;
                avatar: string;
            };
        }[];
    };
    date: string;
}

const defaultEvent: Event = {
    id: 0,
    name: 'Pixel Buddy',
    avatar: "https://radio.emeraldcoastrp.com/static/uploads/browser_icon/48.1728930901.png"
}

export default function Timetable({ data, date }: Props) {
    const [currentDay, setCurrentDay] = useState(false);
    const [events, setEvents] = useState<{ [time: number]: Event }>({
        0: defaultEvent,
        1: defaultEvent,
        2: defaultEvent,
        3: defaultEvent,
        4: defaultEvent,
        5: defaultEvent,
        6: defaultEvent,
        7: defaultEvent,
        8: defaultEvent,
        9: defaultEvent,
        10: defaultEvent,
        11: defaultEvent,
        12: defaultEvent,
        13: defaultEvent,
        14: defaultEvent,
        15: defaultEvent,
        16: defaultEvent,
        17: defaultEvent,
        18: defaultEvent,
        19: defaultEvent,
        20: defaultEvent,
        21: defaultEvent,
        22: defaultEvent,
        23: defaultEvent,
    });

    async function checkDate() {
        const formattedDate = await getFormattedDate(date);
        setCurrentDay(new Date().toISOString().split("T")[0] === formattedDate);
    }

    function getDayFromDate(date: string) {
        const day = new Date(date).getDay();
        return dayList[day];
    }

    useEffect(() => {
        checkDate();
        const interval = setInterval(() => {
            checkDate();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [date]);

    useEffect(() => {
        const newEvents: { [time: number]: Event } = {
            0: defaultEvent,
            1: defaultEvent,
            2: defaultEvent,
            3: defaultEvent,
            4: defaultEvent,
            5: defaultEvent,
            6: defaultEvent,
            7: defaultEvent,
            8: defaultEvent,
            9: defaultEvent,
            10: defaultEvent,
            11: defaultEvent,
            12: defaultEvent,
            13: defaultEvent,
            14: defaultEvent,
            15: defaultEvent,
            16: defaultEvent,
            17: defaultEvent,
            18: defaultEvent,
            19: defaultEvent,
            20: defaultEvent,
            21: defaultEvent,
            22: defaultEvent,
            23: defaultEvent,
        };

        data.bookings.forEach((booking) => {
            if (booking.date === date) {
                newEvents[parseInt(booking.time)] = {
                    id: booking.user.id,
                    name: booking.user.name,
                    avatar: booking.user.avatar
                };
            }
        });

        setEvents(newEvents);
    }, [data.bookings, date]);

    return (
        <div className={"collapse bg-base-200 shadow-md border-2 border-solid " + (currentDay ? 'border-green-500 shadow-green-500' : 'border-base-300')}>
            <input type="checkbox" />
            <div className="collapse-title flex flex-row items-center">
                <h2 className="text-xl font-medium">
                    {getDayFromDate(date)}
                </h2>
                {currentDay && (
                    <div className="justify-end ml-auto card-actions">
                        <div className="badge badge-outline badge-success">Active</div>
                    </div>
                )}
            </div>
            <div className="collapse-content">
                <hr />
                <div className="mt-4 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {Object.keys(events).map((event: any, index) => {
                        return (
                            <TimetableCell
                                key={index}
                                time={event}
                                date={date}
                                booked={events[parseInt(event)].id !== 0}
                                currentDay={currentDay}
                                user={events[parseInt(event)]}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}