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
    <main className="h-screen bg-gray-800 text-white flex flex-col">
        <header className='bg-gray-900 border-b border-white/50 flex gap-4 p-4'>
          <h1 className="w-fit p-4">AI Chat</h1>
          <button onClick={() => training()} className='w-fit text-sm border rounded-full p-4'>Переобучить</button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) =>
              <div key={message.id} className=''>
              {message.author === 'User' && 
                <div className='flex ml-auto flex-col items-end w-fit group gap-1'>
                  <p className='bg-purple-600 rounded-2xl rounded-br-none p-2 w-fit'>{message.text}</p> 
                  <span className='relative hidden group-hover:block' onMouseLeave={() => setMenuActive(false)}>
                    <button 
                      className='menu-btn hover:cursor-pointer border p-2 rounded-lg text-sm w-fit mb-1'
                      onClick={() => 
                        { setMenu(message.id); setMenuActive((prev) => !prev) }} 
                    >
                      Категория
                    </button>
                    {menu === message.id && menuActive && 
                      <ul className='menu-btn flex gap-2 absolute top-full right-0'>
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
                            className='hover:cursor-pointer w-max text-sm bg-gray-900'
                          >
                            {key}: {value}
                          </li>
                        )}
                      </ul>
                    }
                  </span>
                </div> 
              }
              {message.author === 'Bot' && <p className='mb-1'>{message.text}</p>}
              </div>
          )}
          {error && <p>{error.message}</p>}
          <div ref={bottomRef}/>
        </div>
        <form className="" onSubmit={(e) => handleSubmit(e)}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} className="border" required></input>
          <button>Отправить</button>
        </form>
    </main>
  );
}
