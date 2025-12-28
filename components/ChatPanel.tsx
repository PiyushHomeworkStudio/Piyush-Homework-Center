
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Image as ImageIcon, FileText, Download, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, OWNER_NUMBER } from '../store';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { currentUser, messages, addMessage, onlineUsers, markMessagesAsRead } = useStore();
  const [inputText, setInputText] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnerOnline = onlineUsers.has(OWNER_NUMBER);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      markMessagesAsRead();
    }
  }, [isOpen, messages, markMessagesAsRead]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: String(currentUser.id),
      receiverId: String(OWNER_NUMBER),
      text: inputText,
      fileType: 'text',
      timestamp: new Date().toISOString(),
    };

    try {
      await addMessage(newMessage);
      setInputText('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: String(currentUser.id),
        receiverId: String(OWNER_NUMBER),
        fileName: file.name,
        fileData: base64Data,
        fileType: fileType as any,
        timestamp: new Date().toISOString(),
      };

      try {
        await addMessage(newMessage);
      } catch (err) {
        console.error("Failed to upload file:", err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const userMessages = messages.filter(
    m => (m.senderId === String(currentUser?.id) && m.receiverId === String(OWNER_NUMBER)) || 
         (m.senderId === String(OWNER_NUMBER) && m.receiverId === String(currentUser?.id))
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-[72px] sm:top-[88px] right-0 h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)] w-full max-w-[450px] bg-neutral-900 border-l border-white/10 z-[1200] transform transition-transform duration-500 ease-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header with Live and Online Indicators */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-black border-b border-white/10 p-4 sm:p-5 h-[80px] sm:h-[90px] flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={onClose} 
              className="p-2 -ml-2 text-gray-400 hover:text-[#d4af37] transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4 ml-2">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 gold-gradient rounded-full flex items-center justify-center text-black font-black text-lg sm:text-xl shadow-lg">
                  P
                </div>
                {isOwnerOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-lg font-black text-white gold-text uppercase leading-tight">PIYUSH TEAM</h3>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isOwnerOnline ? 'text-green-500' : 'text-gray-500'}`}>
                    {isOwnerOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>LIVE CHAT</span>
          </div>
        </div>

        {/* Messages Body */}
        <div 
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-black/20 scroll-smooth"
        >
          {!currentUser ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mx-auto">
                  <UserIcon size={32} />
                </div>
                <p className="text-gray-400 text-sm font-medium">Sign in to chat with the team</p>
              </div>
              
              <div className="w-full flex flex-col space-y-4">
                <Link to="/register" onClick={onClose} className="w-full py-5 gold-gradient text-black font-black text-sm rounded-full text-center uppercase tracking-[0.2em] shadow-xl">REGISTER NOW</Link>
                <Link to="/login" onClick={onClose} className="w-full py-5 bg-white/5 border border-white/10 text-white font-black text-sm rounded-full text-center uppercase tracking-[0.2em]">SIGN IN</Link>
              </div>
            </div>
          ) : (
            <>
              {userMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <UserIcon size={40} className="text-gray-500" />
                  <p className="text-xs font-black uppercase tracking-widest">Send a message to start live chat</p>
                </div>
              )}
              {userMessages.map((msg) => {
                const isMe = String(msg.senderId) === String(currentUser?.id);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-page-enter`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${isMe ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                      {msg.fileType === 'text' ? (
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      ) : msg.fileType === 'image' ? (
                        <div className="space-y-2">
                          <img src={msg.fileData} alt="Uploaded" className="rounded-lg max-w-full border border-white/10" />
                          {msg.fileName && <p className="text-[10px] opacity-70 truncate">{msg.fileName}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-xl border border-white/10">
                          <FileText size={20} className={isMe ? 'text-black' : 'text-[#d4af37]'} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold truncate">{msg.fileName}</p>
                            <p className="text-[9px] opacity-60">Document</p>
                          </div>
                          <a href={msg.fileData} download={msg.fileName} className={`p-1.5 rounded-lg ${isMe ? 'bg-black/10 text-black' : 'bg-white/5 text-[#d4af37]'}`}>
                            <Download size={14} />
                          </a>
                        </div>
                      )}
                      <p className={`text-[8px] mt-1 text-right font-black opacity-40`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Input Footer */}
        <div className={`p-4 sm:p-6 bg-black border-t border-white/10 transition-opacity duration-300 ${!currentUser ? 'opacity-30' : 'opacity-100'} flex-shrink-0`}>
          <form onSubmit={handleSendMessage} className={`flex items-center space-x-3 ${!currentUser ? 'pointer-events-none' : ''}`}>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={!currentUser} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-[#d4af37] transition-colors" disabled={!currentUser}>
              <ImageIcon size={22} />
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type live message..."
              className="flex-1 bg-neutral-900 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all text-white font-medium"
              disabled={!currentUser}
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || !currentUser}
              className="p-4 bg-[#d4af37] text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/10 disabled:opacity-50"
            >
              <Send size={22} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
