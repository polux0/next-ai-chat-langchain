'use client'

import { useChat } from 'ai/react'
import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

async function callChatAPI(inputContent: any) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: inputContent })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

const customStyles = `
.custom-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 375px;
  height: 100vh;
  background-color: #f0f0f0;
  z-index: 1000;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
`;

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [visible, setVisible] = useState(false);

  return (

    <div>
      <Sidebar 
        visible={visible} 
        onHide={() => setVisible(false)} 
        style={{ backgroundColor: '#f0f0f0' }} 
        className="sm:w-1/4 w-full custom-sidebar" 
        showCloseIcon={false} >

        <div className="custom-close-icon" onClick={() => setVisible(false)}>
          <span className="pi pi-times p-4" style={{ fontSize: '1.4rem' }} />
        </div>
        
        <div className="px-4 py-4">

          <h2 className="text-2xl font-semibold py-6 text-center">Collaborative Finance Chatbot</h2>
          <h3 className="text-md font-semibold">About</h3>

          <div className="text-md pt-5 ">This app is an LLM-powered chatbot built using:</div>

          <ul className="list-disc px-4 pt-4">
            <li className="text-md py-3">
              <a className="text-blue-500 underline" href="https://streamlit.io/" target="_blank">Streamlit</a>
            </li>
            <li className="text-md">
              <a className="text-blue-500 underline" href="https://platform.openai.com/docs/models/gpt-3-5" target="_blank">OpenAI/GPT-3.5</a> LLM model
            </li>
          </ul>

          <hr className="h-px my-8 bg-gray-300 border-0"></hr>

          <p className="text-md pb-2">Made with ❤️ by 
            <a className="text-blue-500 underline px-1" href="https://t.me/jesseforyou" target="_blank">Jesse</a> 
          &
            <a className="text-blue-500 underline px-1" href="https://t.me/alexusnavas" target="_blank">Aleksa</a>
          </p>
          <p className="text-md pb-4">Deep gratitude to 
            <a className="text-blue-500 underline px-1" href="https://platform.openai.com/docs/models/gpt-3-5" target="_blank">The Commons Hub</a> 
            without whose support this would not have been possible! ❤️</p>
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        </div>
      </Sidebar>
      <Button icon="pi pi-angle-right" className="p-3" style={{ fontSize: '1.5rem' }} onClick={() => setVisible(true)}></Button>
    
    <div className="mx-auto max-w-3xl py-24 flex flex-col space-y-8 px-4 md:px-0">

    {messages.length > 0
  ? messages.map((m, index) => (
      <div
        key={m.id}
        className={`message ${m.role} 
                                ${ m.role === 'user' ? 'bg-indigo-50' : 'bg-indigo-100'}
                      p-4`}
      >
        {m.role === 'user' ? 'User: ' : 'AI: '}
        {m.content}
      </div>
    ))
  : null}
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <input
            className="fixed w-5/6 max-w-2xl bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
    </div>
  )
}

