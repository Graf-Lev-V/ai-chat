'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  id: string,
  text: string,
  author: string
}

type Classes = {
  1: string,
  0: string
}

export default function Home() {

  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [menu, setMenu] = useState<string>('')
  const [classes, setClasses] = useState<Classes | null>(null)
  const [menuActive, setMenuActive] = useState<boolean>(false)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>): void {
    e.preventDefault() 
    setMessages((prev) => [...prev, {id: crypto.randomUUID(), text: message, author: 'User'}])
    sendMessage(message)
    setMessage('')
  }
  async function sendMessage(message: string) {
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classify`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: message })
      })
      if (!response.ok) throw new Error('Error')
      const data = await response.json()
        setMessages((prev) => [...prev, {id: crypto.randomUUID(), text: data.received, author: 'Bot'}])
    }
    catch (error) {
      if (error instanceof Error) {
        setError(error)
      }
    }
  }

  async function training() {
    setError(null)
      try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training`, {
          method: 'POST'
        })
      }
      catch (error) {
        if (error instanceof Error) {
          setError(error)
        }
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
    <main className="h-screen bg-gray-900 text-white flex flex-col">
        <h1 className="w-fit mx-auto">AI Chat</h1>
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) =>
            <div key={message.id} className='flex gap-1 group w-fit'>
              <p className='mb-1'>{message.author}: {message.text}</p>
              <span className='relative invisible group-hover:visible' onMouseLeave={() => setMenuActive(false)}>
                {message.author === 'User' && 
                <button 
                  onClick={() => 
                    { setMenu(message.id); setMenuActive((prev) => !prev) }} 
                  className='menu-btn hover: cursor-pointer border px-1 rounded-lg text-sm hidden group-hover:block'
                >
                  learn
                </button>}
                {menu === message.id && menuActive && 
                  <ul className='absolute bg-gray-600 z-1 top-full menu-btn'>
                    {classes && Object.entries(classes).reverse().map(([key, value]) => 
                    <li 
                      key={key} 
                      onClick={() => {
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/add`, {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({text: message.text, label: key})
                        })
                        setMenuActive(false)
                      }}
                      className='hover:cursor-pointer w-max text-sm'
                    >
                      {key}: {value}
                    </li>
                    )}
                  </ul>
                }
              </span>
            </div>
          )}
          {error && <p>{error.message}</p>}
          <div ref={bottomRef}/>
        </div>
        <form className="" onSubmit={(e) => handleSubmit(e)}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} className="border" required></input>
          <button>Отправить</button>
        </form>
        <button onClick={() => training()} className='w-fit'>Переобучить</button>
    </main>
  );
}
