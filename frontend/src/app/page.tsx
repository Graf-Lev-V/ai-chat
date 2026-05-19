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

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>): void {
    e.preventDefault() 
    setMessages([...messages, {id: crypto.randomUUID(), text: message, author: 'user'}])
    sendMessage(message)
    setMessage('')
  }
  async function sendMessage(message: string) {
    const response = await fetch('http://localhost:8000/classify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: message })
    })
    const data = await response.json();
      setMessages((prev) => [...prev, {id: crypto.randomUUID(), text: data.received, author: 'bot'}])
  }

  async function retrain() {
    await fetch('http://localhost:8000/retrain', {
      method: 'POST'
    })
  }

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <main className="h-screen bg-gray-900 text-white flex flex-col">
        <h1 className="w-fit mx-auto">AI Chat</h1>
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => <p key={message.id}>{message.text}</p>)}
          <div ref={bottomRef}/>
        </div>
        <form className="" onSubmit={(e) => handleSubmit(e)}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} className="border"></input>
          <button>Отправить</button>
        </form>
        <button onClick={() => retrain()}>Переобучить</button>
    </main>
  );
}
