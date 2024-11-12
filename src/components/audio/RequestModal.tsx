"use client"
import { useEffect, useState, useRef } from "react";

async function checkRequestStatus(): Promise<boolean> {
    const response = await fetch('/api/requests/status')
    const data = await response.json()

    return data.acceptingRequests
}

export default function RequestModal(): JSX.Element {
    const modal = useRef<HTMLDialogElement>(null)
    const [isOpen, setOpen] = useState(false)
    const [acceptingRequests, setAcceptingRequests] = useState(false)

    const [requestType, setRequestType] = useState('song')
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')

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
                                        setRequestType(e.target.value)
                                    }}>
                                        <option value="song">Song Request</option>
                                        <option value="shoutout">Shoutout Request</option>
                                        <option value="joke">Joke Request</option>
                                    </select>
                                </div>

                                <div className="flex space-between flex-col">
                                    <label htmlFor="name">Name</label>
                                    <input type="text" name="name" id="name" value={name} className="input bg-base-200" content="telephone=no,date=no,email=no,address=no" onChange={(e)=>{
                                        setName(e.target.value)
                                    }} />
                                </div>

                                <div className="flex space-between flex-col">
                                    <label htmlFor="message">Message</label>
                                    <textarea name="message" id="message" value={message} className="input bg-base-200" content="telephone=no,date=no,email=no,address=no" onChange={(e)=>{
                                        setMessage(e.target.value)
                                    }} />
                                </div>
                            </form>
                        ) : (
                            <p>Requests are currently closed</p>
                        )}
                    </div>

                    <button className="btn btn-primary ml-auto mt-4 w-fit" onClick={()=>{
                        setOpen(false)
                    }}>Close</button>
                </div>
            </dialog>
        </div>
    )
}