'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  id: string,
  text: string,
  proba?: number,
  class?: string,
  author: string
}

export default function Home() {

  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [menu, setMenu] = useState<string>('')
  const [classes, setClasses] = useState<{[key: string]: string} | null>(null)
  const [menuActive, setMenuActive] = useState<boolean>(false)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>): void {
    e.preventDefault() 
    setMessages((prev) => [...prev, {id: crypto.randomUUID(), text: message, author: 'User'}])
    sendMessage(message)
    setMessage('')
  }
  async function sendMessage(message: string) {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classify`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: message }),
      })
      if (!response.ok) throw new Error('Error')
      const data = await response.json()
        setMessages((prev) => [...prev, {id: crypto.randomUUID(), text: data.text, proba: data.proba, class: data.class, author: 'Bot'}])
    }
    catch (error) {
      if (error instanceof Error) {
        setError(error)
      }
    }
    finally {
      setLoading(false)
    }
  }

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    (async () => {
      setError(null)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
          method: 'GET'
        })
        if (!response.ok) throw new Error('Error')
        const data = await response.json()
        setClasses(data)
      }
      catch (error) {
        if (error instanceof Error) {
          setError(error)
        }
      }
    })()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {if (e.target instanceof HTMLElement && e.target.closest('.menu-btn')) return; setMenuActive(false)}
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <main className="flex-1 min-h-0 bg-gray-800 text-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) =>
            <div key={message.id} className='mb-3'>
            {message.author === 'User' && 
              <div className='relative flex ml-auto flex-col items-end w-fit group gap-1 '>
                <p className='bg-purple-600 rounded-2xl rounded-br-sm p-2 w-fit mb-1'>{message.text}</p> 
                <span className='hidden group-hover:flex flex-col items-end absolute top-full right-0' onMouseLeave={() => setMenuActive(false)}>
                  <button 
                    className='menu-btn hover:cursor-pointer border px-3 py-2 rounded-lg text-sm w-max mb-1 border-white/25'
                    onClick={() => 
                      { setMenu(message.id); setMenuActive((prev) => !prev) }} 
                  >
                    › Категория
                  </button>
                  {menu === message.id && menuActive && 
                    <ul className='menu-btn flex flex-col items-end gap-1 z-1' onMouseLeave={() => setMenuActive(false)}>
                      {classes && Object.entries(classes).reverse().map(([key, value]) => 
                        <li 
                          key={key} 
                          className='hover:cursor-pointer w-max text-xs text-white/50 bg-gray-900 p-1 rounded-full'
                          onClick={() => {
                            (async () => {
                              try {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add`, {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({text: message.text, label: key})
                                })
                                if (!response.ok) throw new Error('Error')
                              }
                              catch (error) {
                                if (error instanceof Error) {
                                  setError(error)
                                }
                              }
                            })()
                            setMenuActive(false)
                          }}
                        >
                          {key}: {value}
                        </li>
                      )}
                    </ul>
                  }
                </span>
              </div> 
            }
            {message.author === 'Bot' && 
            <p className='bg-gray-600 w-fit p-2 rounded-2xl rounded-bl-sm flex flex-col gap-1'>
              <span>{message.text}</span>
              <span className='text-xs text-white/50'>{message.class} · {message.proba}</span>
            </p>}
            </div>
        )}
        {loading && <p className='bg-gray-600 w-fit p-2 rounded-2xl rounded-bl-sm'>...</p>}
        {error && <p>{error.message}</p>}
        <div ref={bottomRef}/>
      </div>
      <form className="border-t border-white/25 p-4 flex gap-2" onSubmit={(e) => handleSubmit(e)}>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          className="border border-white/25 bg-neutral-800 flex-1 rounded-md p-1.5"
          placeholder='Введите сообщение...' 
          required
          disabled={loading}/>
        <button className='px-4 py-2 border border-white/25 rounded-md hover:cursor-pointer' disabled={loading}>↑</button>
      </form>
    </main>
  );
}
