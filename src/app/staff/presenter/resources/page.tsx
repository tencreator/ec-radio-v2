import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import { RefreshButton } from "@/components/utils/RefreshButton"
import Image from "next/image"
import View from "@/components/staff/presenters/resources/View"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Resources</h1>
                    <p className="text-sm text-gray-500">Checkout the resources you may need to present live on our station!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"><RefreshButton /></div>
                <div className="flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <View />
        </div>
    )
}