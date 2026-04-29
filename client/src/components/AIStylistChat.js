import React, { useState, useRef, useCallback } from 'react'
import { MessageCircle, Wand2, X, Loader2, Send, Palette } from 'lucide-react'

const AIStylistChat = ({ onClose }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const addMessage = (text, isUser = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, isUser, timestamp: new Date() }])
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = input
    setInput('')
    setLoading(true)
    addMessage(userMessage, true)

    try {
      const response = await fetch('/api/ai-stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.text
          }))
        })
      })

      const data = await response.json()
      if (data.success) {
        addMessage(data.response, false)
      } else {
        addMessage('Kechirasiz, AI stylist hozircha ishlamayapti. Iltimos, keyinroq urinib ko\'ring.', false)
      }
    } catch (error) {
      console.error('AI stylist error:', error)
      addMessage('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.', false)
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickPrompts = [
    "Mehmonxona uchun nima kiyishim kerak?",
    "Ofisga ne kiyishim lozim?",
    "Romantik uchrashuv tavsiyasi",
    "Yozgi trend ranglar",
    "Keng ko'ylaklar qancha?"
  ]

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl w-full max-w-[440px] h-[70vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Wand2 size={24} className="text-[#d6b47c]" />
            <div>
              <h2 className="text-white font-medium text-lg">AI Stylist</h2>
              <p className="text-[#a0a0a0] text-xs">Shaxsiy kiyim yordamchingiz</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#a0a0a0] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 space-y-4">
              <Palette size={40} className="text-[#d6b47c]" />
              <p className="text-[#a0a0a0] text-sm max-w-[80%]">
                Qanday kiyinishni bilmayapsizmi? Men sizning didingizga mos liboslar topishga yordam beraman.
              </p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.isUser 
                  ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-tr-sm' 
                  : 'bg-transparent border border-[#d6b47c]/30 text-[#e0e0e0] rounded-tl-sm'
              }`}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isUser && <Wand2 size={12} className="text-[#d6b47c]" />}
                  <span className="text-[10px] text-[#707070]">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-transparent border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#d6b47c]" />
                <span className="text-[#a0a0a0] text-sm">O'ylamoqda...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-[#2a2a2a] bg-[#0a0a0a]">
          {messages.length === 0 && (
            <div className="mb-4">
               <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt)
                      sendMessage()
                    }}
                    className="px-3 py-1.5 bg-transparent border border-[#2a2a2a] rounded-full text-[#a0a0a0] text-[12px] hover:border-[#d6b47c] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle size={12} />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Shu yerga yozing..."
              className="flex-1 min-h-[44px] max-h-[120px] rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-[14px] text-white placeholder-[#707070] focus:outline-none focus:border-[#d6b47c] transition-colors resize-none custom-scrollbar"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] text-[#d6b47c] rounded-xl hover:bg-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIStylistChat