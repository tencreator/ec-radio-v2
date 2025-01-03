"use server"
import { hasPermission, Permissions } from '@/utils/permissions'
import { auth } from '@/utils/auth'

import SidebarClient from './sidebar.client'

interface Catagories {
    title: string
    perm: Permissions
    children: {
        title: string
        href: string
        perm: Permissions
    }[]
}

interface CatagoriesMin {
    title: string
    children: {
        title: string
        href: string
    }[]
}

export default async function Sidebar(): Promise<JSX.Element> {
    const session = await auth()
    const catagories: Catagories[] = [
        {
            title: 'Staff',
            perm: Permissions.VIEW_STAFF,
            children: [{
                title: 'Home',
                href: '/staff',
                perm: Permissions.VIEW_STATS
            }, {
                title: 'Policies',
                href: '/staff/policies',
                perm: Permissions.VIEW_POLICIES
            }]
        },
        {
            title: 'Presenters',
            perm: Permissions.VIEW_REQUESTS,
            children: [{
                title: 'Timetable',
                href: '/staff/presenter/timetable',
                perm: Permissions.VIEW_TIMETABLE
            }, {
                title: 'Requests',
                href: '/staff/presenter/requests',
                perm: Permissions.VIEW_REQUESTS
            }, {
                title: 'Connection',
                href: '/staff/presenter/connection',
                perm: Permissions.SELF_CONNECTION
            }, {
                title: 'Resources',
                href: '/staff/presenter/resources',
                perm: Permissions.VIEW_RESOURCES
            }]
        },
        {
            title: 'Mentors',
            perm: Permissions.VIEW_MENTORS,
            children: [{
                title: 'Request Logs',
                href: '/staff/mentor/requests',
                perm: Permissions.MANAGE_REQUESTS
            }, {
                title: 'Timetable Logs',
                href: '/staff/mentor/timetable',
                perm: Permissions.OTHERS_TIMETABLE
            }]
        },
        {
            title: 'Managers',
            perm: Permissions.VIEW_MANAGERS,
            children: [{
                title: 'Manage Resources',
                href: '/staff/manager/resources',
                perm: Permissions.MANAGE_RESOURCES
            }, {
                title: 'Manage Connection',
                href: '/staff/manager/connection',
                perm: Permissions.MANAGE_CONNECTIONS
            }]
        },
        {
            title: 'Directors',
            perm: Permissions.VIEW_DIRECTORS,
            children: [{
                title: 'Manage Policies',
                href: '/staff/director/policies',
                perm: Permissions.MANAGE_POLICIES
            }, {
                title: 'Manage Settings',
                href: '/staff/director/settings',
                perm: Permissions.VIEW_SETTINGS
            }, {
                title: 'Manage Permissions',
                href: '/staff/director/permissions',
                perm: Permissions.VIEW_PERMISSIONS
            }]
        }
    ]

    const allowed: CatagoriesMin[] = await new Promise<CatagoriesMin[]>(async (resolve) => {
        const result: CatagoriesMin[] = []

        for (const catagory of catagories) {
            if (await hasPermission(session?.user.providerId as string, catagory.perm)) {
                const allowedChildren: { title: string; href: string }[] = []

                for (const child of catagory.children) {
                    if (await hasPermission(session?.user.providerId as string, child.perm)) {
                        allowedChildren.push({
                            title: child.title,
                            href: child.href,
                        })
                    }
                }

                result.push({
                    title: catagory.title,
                    children: allowedChildren,
                })
            }
        }

        resolve(result)
    })

    return <SidebarClient catagories={allowed} />
}