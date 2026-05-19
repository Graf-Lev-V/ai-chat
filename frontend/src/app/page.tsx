'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  id: string,
  text: string,
  author: string
}

export default function Home() {

  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>): void {
    e.preventDefault() 
    setMessages([...messages, {id: crypto.randomUUID(), text: message, author: 'User'}])
    sendMessage(message)
    setMessage('')
  }
  async function sendMessage(message: string) {
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: message })
      })
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
          await fetch('http://localhost:8000/training', {
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

  return (
    <main className="h-screen bg-gray-900 text-white flex flex-col">
        <h1 className="w-fit mx-auto">AI Chat</h1>
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => <p className='mb-1' key={message.id}>{message.author}: {message.text}</p>)}
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
