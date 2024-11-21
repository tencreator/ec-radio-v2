"use client"
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

import Styles from '../../styles/sidebar.module.css'

export default function Sidebar({catagories}: {catagories: {
    title: string
    children: {
        title: string
        href: string
    }[]
}[]}): JSX.Element {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
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

    return (
        <div className='min-h-full'>
            <button ref={sidebarToggleRef} className='btn bg-slate-800 border border-solid border-gray-500 fixed top-20 right-5 text-2xl z-50 lg:hidden' onClick={()=>setShow(!show)}>
                <i className='fas fa-bars'></i>
            </button>

            <div ref={sidebarRef} className={'bg-base-300 ' + Styles.sidebar}>
                {loading ? <p>Loading...</p> : (
                    <ul className="menu">
                        {catagories.map(catagory => (
                            <SidebarCatagory title={catagory.title} children={catagory.children} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

function SidebarCatagory({ title, children }: { title: string, children: {title: string, href: string}[] }) {
    const [open, setOpen] = useState(true)
    const sidebarRef = useRef<HTMLUListElement>(null)

    useEffect(()=>{
        const open = localStorage.getItem(`sidebar-catagory-${title}`)

        if (open) {
            setOpen(open === 'true')
        }
    }, [])

    useEffect(()=>{
        if (!sidebarRef.current) return;

        localStorage.setItem(`sidebar-catagory-${title}`, open.toString())

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
                {open && children.map(child => <SidebarLink href={child.href} title={child.title} />)}
            </ul>
        </li>
    )
}

function SidebarLink({ href, title }: { href: string, title: string }) {
    return <li><Link href={href}>{title}</Link></li>
}