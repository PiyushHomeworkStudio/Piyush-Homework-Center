
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore, OWNER_NUMBER } from '../store';
import { User, ChatMessage } from '../types';
import { Search, Send, Image as ImageIcon, FileText, Download, User as UserCircle, ChevronLeft, MessageSquare } from 'lucide-react';

const OwnerChatPage: React.FC = () => {
  const { users, messages, addMessage, currentUser, onlineUsers, markMessagesAsRead } = useStore();
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
    if (selectedUser) markMessagesAsRead();
  }, [selectedUser, messages, markMessagesAsRead]);

  const getLastMessage = (userId: string) => {
    const userMsgs = messages.filter(m => m.senderId === userId || m.receiverId === userId);
    if (userMsgs.length === 0) return null;
    return userMsgs[userMsgs.length - 1];
  };

  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter(u => 
        !u.isAdmin && 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const lastMsgA = getLastMessage(a.id);
        const lastMsgB = getLastMessage(b.id);
        const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
        const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
        return timeB - timeA;
      });
  }, [users, searchQuery, messages]);

  if (!currentUser?.isAdmin) return null;

  const chatMessages = selectedUser ? messages.filter(
    m => (m.senderId === OWNER_NUMBER && m.receiverId === selectedUser.id) || 
         (m.senderId === selectedUser.id && m.receiverId === OWNER_NUMBER)
  ) : [];

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="h-[72px] sm:h-[88px] shrink-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-1 h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)] overflow-hidden">
        
        {/* Left Side: Users List */}
        <div className={`w-full md:w-80 lg:w-96 bg-neutral-900 border-r border-white/5 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-serif gold-text">Student Live Chats</h2>
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
            {sortedAndFilteredUsers.map((user) => {
              const lastMsg = getLastMessage(user.id);
              const isSelected = selectedUser?.id === user.id;
              const isOnline = onlineUsers.has(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${isSelected ? 'bg-[#d4af37] text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${isSelected ? 'bg-black text-[#d4af37]' : 'gold-gradient text-black'}`}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold truncate text-sm ${isSelected ? 'text-black' : 'text-white'}`}>{user.fullName}</p>
                      {isOnline ? (
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-green-500'}`}>Online</span>
                      ) : (
                        <span className={`text-[8px] opacity-40 font-black`}>{formatLastSeen(user.lastSeen)}</span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate opacity-60 ${isSelected ? 'text-black font-black' : 'text-gray-500'}`}>
                      {lastMsg ? (lastMsg.fileType === 'text' ? lastMsg.text : lastMsg.fileName) : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div className={`flex-1 flex flex-col bg-black/40 relative ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-gray-400">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-black font-black">
                      {selectedUser.fullName.charAt(0)}
                    </div>
                    {onlineUsers.has(selectedUser.id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedUser.fullName}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${onlineUsers.has(selectedUser.id) ? 'text-green-500' : 'text-gray-500'}`}>
                      {onlineUsers.has(selectedUser.id) ? 'ONLINE NOW' : `Last seen: ${formatLastSeen(selectedUser.lastSeen)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>LIVE CHANNEL</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth">
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === OWNER_NUMBER;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-page-enter`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${isMe ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                        {msg.fileType === 'text' ? (
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        ) : msg.fileType === 'image' ? (
                          <img src={msg.fileData} alt="Uploaded" className="rounded-lg max-w-full border border-white/10" />
                        ) : (
                          <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-xl">
                            <FileText size={20} className={isMe ? 'text-black' : 'text-[#d4af37]'} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold truncate">{msg.fileName}</p>
                              <a href={msg.fileData} download={msg.fileName} className="text-[9px] underline text-[#d4af37]">Download</a>
                            </div>
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

              {/* Input */}
              <div className="p-6 border-t border-white/5 bg-neutral-900/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-4xl mx-auto">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-[#d4af37]">
                    <ImageIcon size={24} />
                  </button>
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a live message..."
                    className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#d4af37] outline-none text-white"
                  />
                  <button type="submit" disabled={!inputText.trim()} className="p-4 bg-[#d4af37] text-black rounded-2xl hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50">
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 text-center px-8">
              <MessageSquare className="w-12 h-12 text-[#d4af37]" />
              <h3 className="text-2xl font-serif">Support Center</h3>
              <p className="text-xs font-black uppercase tracking-widest">Select a student chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerChatPage;
