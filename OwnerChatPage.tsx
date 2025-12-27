
import React, { useState, useRef, useEffect } from 'react';
import { useStore, OWNER_NUMBER } from '../store';
import { User, ChatMessage } from '../types';
import { Search, Send, Image as ImageIcon, FileText, Download, User as UserCircle, ChevronLeft } from 'lucide-react';

const OwnerChatPage: React.FC = () => {
  const { users, messages, addMessage, currentUser } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, messages]);

  if (!currentUser?.isAdmin) return null;

  const filteredUsers = users.filter(u => 
    !u.isAdmin && 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = selectedUser ? messages.filter(
    m => (m.senderId === OWNER_NUMBER && m.receiverId === selectedUser.id) || 
         (m.senderId === selectedUser.id && m.receiverId === OWNER_NUMBER)
  ) : [];

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: OWNER_NUMBER,
      receiverId: selectedUser.id,
      text: inputText,
      fileType: 'text',
      timestamp: new Date().toISOString(),
    };

    addMessage(newMessage);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: OWNER_NUMBER,
        receiverId: selectedUser.id,
        fileName: file.name,
        fileData: base64Data,
        fileType: fileType as any,
        timestamp: new Date().toISOString(),
      };

      addMessage(newMessage);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getLastMessage = (userId: string) => {
    const userMsgs = messages.filter(m => m.senderId === userId || m.receiverId === userId);
    if (userMsgs.length === 0) return null;
    return userMsgs[userMsgs.length - 1];
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* 
        SPACER: Pushes the Chat Interface below the fixed Navbar and Floating Back Button.
        Mobile: Navbar (56px) + Gap + Back Button (at 100px) + Gap => ~160px (h-40)
        Desktop: Navbar (64px) + Gap + Back Button (at 112px) + Gap => ~176px (h-44)
      */}
      <div className="h-40 sm:h-44 shrink-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-1 h-[calc(100vh-160px)] sm:h-[calc(100vh-176px)] overflow-hidden">
        
        {/* Left Side: Users List */}
        <div className={`w-full md:w-80 lg:w-96 bg-neutral-900 border-r border-white/5 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-serif gold-text">Student Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-[#d4af37] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll px-2 pb-6 space-y-1">
            {filteredUsers.map((user) => {
              const lastMsg = getLastMessage(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${selectedUser?.id === user.id ? 'bg-[#d4af37] text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${selectedUser?.id === user.id ? 'bg-black text-[#d4af37]' : 'gold-gradient text-black'}`}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`font-bold truncate text-sm ${selectedUser?.id === user.id ? 'text-black' : 'text-white'}`}>{user.fullName}</p>
                    <p className={`text-[10px] truncate opacity-60 ${selectedUser?.id === user.id ? 'text-black font-black' : 'text-gray-500'}`}>
                      {lastMsg ? (lastMsg.fileType === 'text' ? lastMsg.text : lastMsg.fileName) : 'No messages yet'}
                    </p>
                  </div>
                  {lastMsg && (
                    <span className="text-[8px] opacity-40 font-black">
                      {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div className={`flex-1 flex flex-col bg-black/40 relative ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl flex items-center space-x-4">
                <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-gray-400">
                  <ChevronLeft size={24} />
                </button>
                <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-black font-black">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedUser.fullName}</h3>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{selectedUser.phoneNumber}</p>
                </div>
              </div>

              {/* Chat Body */}
              <div 
                ref={chatBodyRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
              >
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                    <UserCircle size={48} />
                    <p className="text-sm font-bold uppercase tracking-widest">Start conversation with {selectedUser.fullName.split(' ')[0]}</p>
                  </div>
                )}
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === OWNER_NUMBER;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${isMe ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
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
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-white/5 bg-neutral-900/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-4xl mx-auto">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-500 hover:text-[#d4af37] transition-colors"
                  >
                    <ImageIcon size={24} />
                  </button>
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Message student..."
                    className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#d4af37] outline-none transition-all text-white"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="p-4 bg-[#d4af37] text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 text-center px-8">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                <MessageCircleIcon />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif">Your Conversations</h3>
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Select a student from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const MessageCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);

export default OwnerChatPage;
