import { hasPermission, Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import Image from 'next/image'
import Table, { TableSkeleton } from "@/components/utils/Table";
import { CreateResource } from "@/components/staff/manager/resources/CreateResource";
import { makeRequest } from "@/utils/request";
import { DeleteButton, EditButton, PreviewButton } from "@/components/staff/manager/resources/Buttons";

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_RESOURCES)) return <div>Unauthorized</div>

    async function getResources() {
        const res = await makeRequest('/api/staff/presenter/resources', {})
        const data = await res.json()

        const resources = await Promise.all(data.map((resource: any) => {
            return {
                id: resource.id,
                name: resource.name,
                tags: resource.tags.join(', '),
                url: resource.url,
                delete: <DeleteButton id={resource.id} />,
                edit: <EditButton id={resource.id} data={resource} />,
                preview: <PreviewButton url={resource.url} />
            }
        }))

        return resources
    }

    const resources = await getResources()

    return (
        <div className="mx-auto mt-4 overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Manage Resources</h1>
                    <p className="text-sm text-gray-500">Here you can create, edit and delete resources as you wish.</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<PageSkeleton />}>
                <CreateResource />
                <Table headings={["ID", "Name", "URL", "Tags", "Preview", "Edit", "Delete"]} data={resources} />
            </Suspense>
        </div>
    )
}

async function PageSkeleton() {
    return (
        <div className="flex flex-col mt-6">
            <div className="skeleton h-12 w-20"></div>
            <TableSkeleton headings={["ID", "Name", "URL", "Tags", "Delete", "Edit"]} />
        </div>
    )
}