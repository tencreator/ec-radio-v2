import { Skeleton } from "@/components/staff/directors/policies/viewPolicies"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Suspense } from "react"
import { PrismaClient } from "@prisma/client"
import WebhookChannels from "@/components/staff/directors/settings/WebhookChannels"

const prisma = new PrismaClient()
export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_SETTINGS)) return <div>Unauthorized</div>

    async function getWebhookChannels() {
        const channels = await prisma.webhookChannels.findFirst()
        return channels
    }

    const canEdit = await hasPermission(session.user.providerId, Permissions.EDIT_SETTINGS)
    const webhookChannels = await getWebhookChannels() as any

    return (
        <div className="mx-auto mt-4 overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Site Settings</h1>
                    <p className="text-sm text-gray-500">This is where you can change the site settings, be very careful here not to break anything!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<Skeleton />}>
                <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <WebhookChannels data={webhookChannels} edit={canEdit} />
                    </div>
                </div>
            </Suspense>
        </div>
    )
}