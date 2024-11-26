"use client"
import { useEffect, useState, useRef } from "react";

async function checkRequestStatus(): Promise<boolean> {
    const response = await fetch('/api/requests/status')
    if (!response.ok) return false

    const data = await response.json()
    return data.acceptingRequests
}

export default function RequestModal(): JSX.Element {
    const modal = useRef<HTMLDialogElement>(null)
    const [isOpen, setOpen] = useState(false)
    const [acceptingRequests, setAcceptingRequests] = useState(false)

    const [forumData, setForumData] = useState({
        reqType: 'song',
        name: '',
        message: ''
    })

    function updateForumData(key: string, value: string) {
        setForumData(prev => ({
            ...prev,
            [key]: value
        }))
    }

    async function submitRequest() {
        fetch('/api/requests', {
            method: 'POST',
            body: JSON.stringify(forumData)
        })
    
        setOpen(false)
        setForumData({
            reqType: 'song',
            name: '',
            message: ''
        })
    }

    useEffect(()=>{
        if (!modal.current) return

        checkRequestStatus().then((status)=>{
            setAcceptingRequests(status)
        })

        if (isOpen) {
            modal.current.showModal()
        } else {
            modal.current.close()
        }

        modal.current.onclose = ()=>{
            setOpen(false)
        }
    }, [isOpen])

    return (
        <div className="modal-container">
            <button className="btn btn-ghost" onClick={()=>{
                setOpen(!isOpen)
            }}>
                <i className="fa-solid fa-bullhorn"></i>
            </button>

            <dialog ref={modal} className="modal">
                <div className="modal-box flex-col flex">
                    <h3 className="modal-title">Make a request</h3>

                    <div className="modal-action">
                        {acceptingRequests ? (
                            <form className="flex flex-col w-full" method="dialog">
                                <div className="flex space-between flex-col">
                                    <label htmlFor="requestType">Request Type</label>
                                    <select name="requestType" id="requestType" className="select bg-base-200" content="telephone=no,date=no,email=no,address=no" onChange={(e)=>{
                                        updateForumData('reqType', e.target.value)
                                    }}>
                                        <option value="song">Song Request</option>
                                        <option value="shoutout">Shoutout Request</option>
                                        <option value="joke">Joke Request</option>
                                    </select>
                                </div>

                                <div className="flex space-between flex-col">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={forumData.name}
                                        className="input bg-base-200"
                                        content="telephone=no,date=no,email=no,address=no"
                                        onChange={(e) => {
                                            updateForumData('name', e.target.value)
                                        }}
                                    />
                                </div>

                                <div className="flex space-between flex-col">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        value={forumData.message}
                                        className="input bg-base-200"
                                        content="telephone=no,date=no,email=no,address=no"
                                        onChange={(e) => {
                                            updateForumData('message', e.target.value)
                                        }}
                                    />
                                </div>
                                        
                                <div className="ml-auto flex flex-row mt-4 gap-4">
                                    <button className="btn btn-secondary" onClick={submitRequest}>Submit</button>

                                    <button className="btn btn-primary w-fit" onClick={()=>{
                                        setOpen(false)
                                    }}>Close</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col">
                                <p className="mr-auto">Requests are currently closed</p>
                                <button className="btn btn-primary ml-auto mt-4 w-fit" onClick={()=>{
                                    setOpen(false)
                                }}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            </dialog>
        </div>
    )
}