import { getFormattedTime } from "@/utils/functions"
import { BookButton, UnbookButton } from "./TimetableButtons"
import { auth } from "@/utils/auth"

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
}

export default async function Cell({date, time, booked, currentDay, user}: Props) {
    const session = await auth()
    const me = session?.user?.providerId?.toString() || ""

    function isCurrent() {
        const hour = new Date().getHours()
        const eventHour = parseInt(time.split(":")[0])

        if (currentDay && hour === eventHour) {
            return true
        } else {
            return false
        }
    }
    
    return (
        <div className={"card bg-base-300 shadow-md border-solid border-2 " + (isCurrent() ? 'border-red-600 shadow-red-600' : 'border-base-100')}>
            <div className="card-body">
                <div className="card-title flex flex-row">
                    <h2>{getFormattedTime(time)}</h2>
                    {isCurrent() && (
                        <div className="ml-auto card-actions justify-end">
                            <h2 className="badge badge-outline badge-error">Now</h2>
                        </div>
                    )}
                </div>
                <hr />
                <div>
                    {booked ? (
                        user ? (
                            <div className="flex flex-col items-center justify-start">
                                <div className="flex flex-row items-center justify-center mr-auto">
                                    <img src={user.avatar} height={32} width={32} className="rounded-full mr-2" />
                                    <p>{user.name}</p>
                                </div>
                                {me === user.id.toString() && (
                                    <UnbookButton time={time} date={date} />
                                )}
                            </div>
                        ) : (
                            <p>We had an oopsie!</p>
                        )
                    ) : (
                        <BookButton time={time} date={date} />
                    )}
                </div>
            </div>
        </div>
    )
}