import { getFormattedTime } from "@/utils/functions"

interface Props {
    time: string
    booked: boolean
    currentDay: boolean
    user?: {
        id: number
        name: string
        avatar: string
    }
}

export default async function Cell({time, booked, currentDay, user}: Props) {
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
                            <div className="flex flex-row items-center">
                                <img src={user.avatar} height={32} width={32} className="rounded-full mr-2" />
                                <p>{user.name}</p>
                            </div>
                        ) : (
                            <p>We had an oopsie!</p>
                        )
                    ) : (
                        <div className="flex flex-row items-center">
                            <img src="https://radio.emeraldcoastrp.com/static/uploads/browser_icon/48.1728930901.png" alt="Pixel Buddy"  height={32} width={32} className="rounded-full mr-2" />
                            <p>Pixel Buddy</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}