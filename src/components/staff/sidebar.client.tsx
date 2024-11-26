"use client"
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

import Styles from '../../styles/sidebar.module.css'
import { RefreshButton } from '../utils/RefreshButton'

function getAllSidebarOpen(): { [key: string]: boolean } {
    const storage = localStorage.getItem('staff-sidebar')
    return storage ? JSON.parse(storage) as { [key: string]: boolean } : {}
}

function setSidebarOpen(open: boolean, title: string) {
    const storage = localStorage.getItem('staff-sidebar')
    let openCatagories = storage ? JSON.parse(storage) as { [key: string]: boolean } : {}

    openCatagories[title] = open

    localStorage.setItem('staff-sidebar', JSON.stringify(openCatagories))
}

export default function Sidebar({catagories}: {catagories: {
    title: string
    children: {
        title: string
        href: string
    }[]
}[]}): JSX.Element {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
    const [openCookie, setOpenCookie] = useState<{ [key: string]: boolean }>({})
    const sidebarRef = useRef<HTMLDivElement>(null)
    const sidebarToggleRef = useRef<HTMLButtonElement>(null)

    useEffect(()=>{
        if (!sidebarRef.current) return;

        if (show) {
            sidebarRef.current.style.left = '0';
        } else {
            sidebarRef.current.style.left = '-100%';
        }

        const handleOutsideClick = (e: MouseEvent) => {
            if (sidebarToggleRef.current?.contains(e.target as Node)) return;
            if (sidebarRef.current?.contains(e.target as Node)) return;

            setShow(false);
        }

        document.addEventListener('click', handleOutsideClick);

        return () => document.removeEventListener('click', handleOutsideClick)
    }, [show])

    useEffect(()=>{
        setLoading(false)
    }, [catagories])

    useEffect(() => {
        const storage = localStorage.getItem('staff-sidebar')
        const openCategories = storage ? JSON.parse(storage) as { [key: string]: boolean } : {}
        setOpenCookie(openCategories)
    }, [])

    return (
        <div className='min-h-full'>
            <button ref={sidebarToggleRef} className='btn bg-slate-800 border border-solid border-gray-500 fixed top-20 right-5 text-2xl z-50 lg:hidden' onClick={()=>setShow(!show)}>
                <i className='fas fa-bars'></i>
            </button>

            <div ref={sidebarRef} className={'bg-base-300 ' + Styles.sidebar}>
                {loading ? <p>Loading...</p> : (
                    <ul className="menu sticky">
                        {catagories.map((catagory, i) => (
                            <SidebarCatagory key={i} title={catagory.title} children={catagory.children} openCookie={openCookie[catagory.title] || true} />
                        ))}

                    </ul>
                )}

                <RefreshButton className='w-full mt-4 sticky' />
            </div>
        </div>
    )
}

function SidebarCatagory({ title, children, openCookie }: { title: string, children: {title: string, href: string}[], openCookie: boolean }): JSX.Element {
    const [open, setOpen] = useState(openCookie)
    const sidebarRef = useRef<HTMLUListElement>(null)

    useEffect(()=>{
        if (!sidebarRef.current) return;

        setSidebarOpen(open, title)

        if (open) {
            sidebarRef.current.style.height = 'auto';
        } else {
            sidebarRef.current.style.height = '0';
        }
    }, [open])

    return (
        <li>
            <div className='flex flex-row' onClick={()=>setOpen(!open)}>
                <h3 onClick={()=>setOpen(!open)}>{title}</h3>
                <i className={'ml-auto fas fa-chevron-' + (open ? 'up' : 'down')}></i>
            </div>
            <ul ref={sidebarRef}>
                {open && children.map((child, i) => <SidebarLink key={i} href={child.href} title={child.title} />)}
            </ul>
        </li>
    )
}

function SidebarLink({ href, title }: { href: string, title: string}) {
    return <li><Link href={href}>{title}</Link></li>
}