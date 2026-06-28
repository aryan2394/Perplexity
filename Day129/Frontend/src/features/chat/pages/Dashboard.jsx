import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import remarkGfm from 'remark-gfm'


const Dashboard = () => {
  const chat = useChat()
  const auth = useAuth()
  const user = useSelector((state) => state.auth.user)
  const [ chatInput, setChatInput ] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const error = useSelector((state) => state.chat.error)

  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chats, currentChatId, shouldAutoScroll])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)
  }

  const handleSubmitMessage = (event) => {
    event.preventDefault()

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) {
      return
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId,chats)
  }

  return (
    <main className='min-h-screen w-full bg-[#07090f] p-3 text-white md:p-5'>
      <section className='mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl border   p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1 border-none'>
        <aside className='hidden h-full w-72 shrink-0 rounded-3xl border  bg-[#080b12] p-4 md:flex md:flex-col'>
          <h1 className='mb-5 text-3xl font-semibold tracking-tight'>Perplexity</h1>

          <button
            onClick={() => { chat.handleNewChat() }}
            type='button'
            className='mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/40 shadow-lg'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>

          <div className='flex-1 space-y-2 overflow-y-auto pr-1'>
            {Object.values(chats).map((chat,index) => (
              <button
                onClick={()=>{openChat(chat.id)}}
                key={index}
                type='button'
                className='w-full cursor-pointer rounded-xl border border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:border-white hover:text-white'
              >
                {chat.title}
              </button>
            ))}
          </div>

          {/* Premium User Profile & Logout Section */}
          <div className='mt-auto pt-4 border-t border-white/10 flex flex-col gap-3'>
            <div className='flex items-center gap-3 px-2'>
              {/* Avatar Initial Circle with dynamic gradient */}
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 font-bold text-white shadow-md transition hover:scale-105 duration-300'>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate text-sm font-semibold text-white/95'>{user?.username || 'User'}</p>
                <p className='truncate text-xs text-white/40'>{user?.email || 'user@perplexity.ai'}</p>
              </div>
            </div>
            
            <button
              onClick={() => auth.handleLogout()}
              type='button'
              className='flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-sm font-semibold text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 hover:shadow-red-500/10 hover:shadow-lg active:scale-[0.98]'
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </aside>

        <section className='relative max-w-3/5 mx-auto flex h-full min-w-0 flex-1 flex-col gap-4'>

          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className='messages flex-1 space-y-3 overflow-y-auto pr-1 pb-30'
          >
            {chats[ currentChatId ]?.messages.map((message, index) => {
              const isLastMessage = index === chats[ currentChatId ].messages.length - 1
              return (
                <div
                  key={message.id || index}
                  className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${message.role === 'user'
                      ? 'ml-auto rounded-br-none bg-white/12 text-white'
                      : 'mr-auto border-none text-white/90'
                    }`}
                >
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="relative">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                          ul: ({ children }) => <ul className='mb-2 list-disc pl-5'>{children}</ul>,
                          ol: ({ children }) => <ol className='mb-2 list-decimal pl-5'>{children}</ol>,
                          code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5'>{children}</code>,
                          pre: ({ children }) => <pre className='mb-2 overflow-x-auto rounded-xl bg-black/30 p-3'>{children}</pre>
                        }}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {isLastMessage && isLoading && (
                        <span className="inline-block w-2.5 h-4 bg-[#31b8c6] animate-pulse ml-1 align-middle">▋</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className='mx-1 mb-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200'>
              <strong>Error:</strong> {error}
            </div>
          )}

          <footer className='rounded-3xl w-full absolute bottom-2 border border-white/60 bg-[#080b12] p-4 md:p-5'>
            <form onSubmit={handleSubmitMessage} className='flex flex-col gap-3 md:flex-row'>
              <input
                type='text'
                value={chatInput}
                disabled={isLoading}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={isLoading ? 'Generating response...' : 'Type your message...'}
                className='w-full rounded-2xl border border-white/50 bg-transparent px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/45 focus:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              <button
                type='submit'
                disabled={isLoading || !chatInput.trim()}
                className='rounded-2xl border border-white/60 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Send
              </button>
            </form>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard