import { useEffect, useRef, useState } from "react";
import { chatAPI, partnerChatAPI, riderChatAPI } from "../services/api";
import { connectAdminSocket, socket } from "../services/socket";
import "../styles/chat.css";

export default function Chat() {
    // ---- Global UI State ----
    const [searchTerm, setSearchTerm] = useState("");
    const [filterByUnread, setFilterByUnread] = useState(false);
    
    // ---- CHATS states ----
    const [chats, setChats] = useState([]);
    const [partnerChats, setPartnerChats] = useState([]);
    const [riderChats, setRiderChats] = useState([]);
    const [orderChats, setOrderChats] = useState([]); // User-Rider chats for specific orders
    
    // ---- SELECTION states ----
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedPartnerChat, setSelectedPartnerChat] = useState(null);
    const [selectedRiderChat, setSelectedRiderChat] = useState(null);
    const [selectedOrderChat, setSelectedOrderChat] = useState(null);

    // ---- INPUT states ----
    const [inputText, setInputText] = useState("");
    const [partnerInput, setPartnerInput] = useState("");
    const [riderInput, setRiderInput] = useState("");

    // ---- LOADING states ----
    const [loading, setLoading] = useState(true);
    const [partnerLoading, setPartnerLoading] = useState(false);
    const [riderLoading, setRiderLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);

    // ---- TABS state ----
    const [mainTab, setMainTab] = useState('All'); // 'All' | 'Users' | 'Chefs' | 'Riders' | 'Orders'
    const [activeTab, setActiveTab] = useState('Active');

    const bottomRef = useRef(null);
    const partnerBottomRef = useRef(null);
    const riderBottomRef = useRef(null);

    useEffect(() => {
        fetchChats();
        fetchPartnerChats();
        fetchRiderChats();
        fetchOrderChats();

        connectAdminSocket();

        // Listen for user/AI messages
        socket.on('admin_message', (msg) => {
            setChats(prev => {
                let found = false;
                const next = prev.map(c => {
                    if (c.userId === msg.userId) { found = true; return { ...c, messages: [...c.messages, msg], status: msg.status || 'Admin' }; }
                    return c;
                });
                if (!found) return [{ _id: msg.chatId || msg.userId, userId: msg.userId, userName: msg.userName || 'User', messages: [msg], status: msg.status || 'Admin', type: 'user' }, ...next];
                return next;
            });
            setSelectedChat(curr => curr && curr.userId === msg.userId ? { ...curr, messages: [...curr.messages, msg], status: msg.status || 'Admin' } : curr);
        });

        // Listen for partner messages
        socket.on('partner_message', (msg) => {
            setPartnerChats(prev => {
                let found = false;
                const next = prev.map(c => {
                    if (c.partnerId === msg.partnerId) { found = true; return { ...c, messages: [...c.messages, msg], type: 'chef' }; }
                    return c;
                });
                if (!found) return [{ _id: msg.chatId, partnerId: msg.partnerId, partnerName: msg.partnerName, messages: [msg], type: 'chef' }, ...next];
                return next;
            });
            setSelectedPartnerChat(curr => curr && curr.partnerId === msg.partnerId ? { ...curr, messages: [...curr.messages, msg] } : curr);
        });

        // Listen for rider messages
        socket.on('admin_rider_message', (msg) => {
            setRiderChats(prev => {
                let found = false;
                const next = prev.map(c => {
                    if (c.riderId === msg.riderId) { found = true; return { ...c, messages: [...c.messages, msg], type: 'rider' }; }
                    return c;
                });
                if (!found) return [{ _id: msg.chatId, riderId: msg.riderId, riderName: msg.riderName, messages: [msg], type: 'rider' }, ...next];
                return next;
            });
            setSelectedRiderChat(curr => curr && curr.riderId === msg.riderId ? { ...curr, messages: [...curr.messages, msg] } : curr);
        });

        // Listen for order-based user-rider chats
        socket.on('order_rider_chat', (data) => {
            setOrderChats(prev => {
                let found = false;
                const next = prev.map(c => {
                    if (c.orderId === data.orderId) { found = true; return { ...c, messages: [...c.messages, data.message] }; }
                    return c;
                });
                if (!found) return [{ _id: data.chatId, orderId: data.orderId, customerName: data.customerName, riderName: data.riderName, messages: [data.message], type: 'order' }, ...next];
                return next;
            });
            setSelectedOrderChat(curr => curr && curr.orderId === data.orderId ? { ...curr, messages: [...curr.messages, data.message] } : curr);
        });

        // Listen for order completion/cancellation to deactivate chats
        socket.on('order_completed', (data) => {
            console.log('Chat: Order completed, deactivating chat', data);
            setOrderChats(prev => prev.map(c => 
                c.orderId === data.orderId 
                    ? { ...c, status: 'completed', active: false, completedAt: new Date() }
                    : c
            ));
            
            // Clear selected order chat if it was the completed one
            setSelectedOrderChat(curr => curr && curr.orderId === data.orderId ? null : curr);
            
            // Show notification
            alert(`Order #${data.orderId} completed. User-rider chat has been deactivated.`);
        });

        socket.on('order_cancelled', (data) => {
            console.log('Chat: Order cancelled, deactivating chat', data);
            setOrderChats(prev => prev.map(c => 
                c.orderId === data.orderId 
                    ? { ...c, status: 'cancelled', active: false, cancelledAt: new Date() }
                    : c
            ));
            
            // Clear selected order chat if it was the cancelled one
            setSelectedOrderChat(curr => curr && curr.orderId === data.orderId ? null : curr);
            
            // Show notification
            alert(`Order #${data.orderId} cancelled. User-rider chat has been deactivated.`);
        });

        return () => {
            socket.off('admin_message');
            socket.off('partner_message');
            socket.off('admin_rider_message');
            socket.off('order_rider_chat');
            socket.off('order_completed');
            socket.off('order_cancelled');
        };
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedChat?.messages]);
    useEffect(() => { partnerBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedPartnerChat?.messages]);
    useEffect(() => { riderBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedRiderChat?.messages]);

    const fetchChats = async () => {
        try {
            const res = await chatAPI.getAll();
            const data = res.data.map(c => ({ ...c, type: 'user' }));
            setChats(data);
            const activeChats = data.filter(c => c.status === 'Admin');
            if (activeChats.length > 0) setSelectedChat(activeChats[0]);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchPartnerChats = async () => {
        setPartnerLoading(true);
        try {
            const res = await partnerChatAPI.getAll();
            const data = res.data.map(c => ({ ...c, type: 'chef' }));
            setPartnerChats(data);
            if (data.length > 0) setSelectedPartnerChat(data[0]);
        } catch (err) { console.error(err); } finally { setPartnerLoading(false); }
    };

    const fetchRiderChats = async () => {
        setRiderLoading(true);
        try {
            const res = await riderChatAPI.getAll();
            const data = res.data.map(c => ({ ...c, type: 'rider' }));
            setRiderChats(data);
            if (data.length > 0) setSelectedRiderChat(data[0]);
        } catch (err) { console.error(err); } finally { setRiderLoading(false); }
    };

    const fetchOrderChats = async () => {
        try {
            const res = await chatAPI.getOrderChats ? chatAPI.getOrderChats() : [];
            setOrderChats(res.data || []);
        } catch (err) { console.error(err); }
    };

    const sendUserMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedChat) return;
        const text = inputText;
        setInputText("");
        try {
            await chatAPI.reply(selectedChat.userId, text);
            const newMessage = { sender: 'Admin', text, timestamp: new Date() };
            const updated = { ...selectedChat, messages: [...selectedChat.messages, newMessage] };
            setSelectedChat(updated);
            setChats(prev => prev.map(c => c.userId === selectedChat.userId ? updated : c));
        } catch { alert("Failed to send message"); }
    };

    const sendPartnerMessage = async (e) => {
        e.preventDefault();
        if (!partnerInput.trim() || !selectedPartnerChat) return;
        const text = partnerInput;
        setPartnerInput("");
        try {
            await partnerChatAPI.reply(selectedPartnerChat.partnerId, text);
            const newMessage = { sender: 'Admin', text, timestamp: new Date() };
            const updated = { ...selectedPartnerChat, messages: [...selectedPartnerChat.messages, newMessage] };
            setSelectedPartnerChat(updated);
            setPartnerChats(prev => prev.map(c => c.partnerId === selectedPartnerChat.partnerId ? updated : c));
        } catch { alert("Failed to send message"); }
    };

    const sendRiderMessage = async (e) => {
        e.preventDefault();
        if (!riderInput.trim() || !selectedRiderChat) return;
        const text = riderInput;
        setRiderInput("");
        try {
            await riderChatAPI.reply(selectedRiderChat.riderId, text);
            const newMessage = { sender: 'Admin', text, timestamp: new Date() };
            const updated = { ...selectedRiderChat, messages: [...selectedRiderChat.messages, newMessage] };
            setSelectedRiderChat(updated);
            setRiderChats(prev => prev.map(c => c.riderId === selectedRiderChat.riderId ? updated : c));
        } catch { alert("Failed to send message"); }
    };

    const sendOrderMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedOrderChat) return;
        const text = inputText;
        setInputText("");
        try {
            await chatAPI.sendOrderMessage(selectedOrderChat.orderId, text);
            const newMessage = { sender: 'Admin', text, timestamp: new Date() };
            const updated = { ...selectedOrderChat, messages: [...selectedOrderChat.messages, newMessage] };
            setSelectedOrderChat(updated);
            setOrderChats(prev => prev.map(c => c.orderId === selectedOrderChat.orderId ? updated : c));
        } catch { alert("Failed to send message"); }
    };

    // Merged "All" logic
    const allRecentChats = [...chats, ...partnerChats, ...riderChats].sort((a, b) => {
        const timeA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp) : 0;
        const timeB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp) : 0;
        return timeB - timeA;
    });

    const activeUserChats = chats.filter(c => c.status === 'Admin');

    const handleSelectChatFromAll = (chat) => {
        if (chat.type === 'user') {
            setMainTab('Users');
            setSelectedChat(chat);
        } else if (chat.type === 'chef') {
            setMainTab('Chefs');
            setSelectedPartnerChat(chat);
        } else if (chat.type === 'rider') {
            setMainTab('Riders');
            setSelectedRiderChat(chat);
        }
    };

    return (
        <div className="whatsapp-main-page chat-page">
            <div className="whatsapp-container chat-container">

                {/* === SIDEBAR === */}
                <div className="whatsapp-sidebar chat-sidebar">
                    <div className="chat-title">
                        <h2>Chats</h2>
                        <div className="header-actions">
                            <span className="header-icon">➕</span>
                            <span className="header-icon">⋮</span>
                        </div>
                    </div>

                    <div className="chat-search-container">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search or start new chat" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <span className={`filter-icon ${filterByUnread ? 'active' : ''}`} onClick={() => setFilterByUnread(!filterByUnread)}>⏳</span>
                    </div>

                    <div className="whatsapp-tabs">
                        <button className={`wa-tab ${mainTab === 'All' ? 'active' : ''}`} onClick={() => setMainTab('All')}>All</button>
                        <button className={`wa-tab ${mainTab === 'Users' ? 'active' : ''}`} onClick={() => setMainTab('Users')}>User</button>
                        <button className={`wa-tab ${mainTab === 'Chefs' ? 'active' : ''}`} onClick={() => setMainTab('Chefs')}>Chef</button>
                        <button className={`wa-tab ${mainTab === 'Riders' ? 'active' : ''}`} onClick={() => setMainTab('Riders')}>Rider</button>
                        <button className={`wa-tab ${mainTab === 'Orders' ? 'active' : ''}`} onClick={() => setMainTab('Orders')}>Orders</button>
                    </div>

                    <div className="contacts-list whatsapp-contacts">
                        {mainTab === 'All' ? (
                            allRecentChats.filter(c => (c.userName || c.partnerName || c.riderName || '').toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <div key={c._id} className="contact-item" onClick={() => handleSelectChatFromAll(c)}>
                                    <div className="contact-avatar">
                                        {(c.userName || c.partnerName || c.riderName || '?').charAt(0)}
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-top">
                                            <h4>{c.userName || c.partnerName || c.riderName || ''}</h4>
                                            <div className="meta-right">
                                                {c.hasRequestedHelp && <span className="help-dot"></span>}
                                                <span className="msg-time">{c.messages.length > 0 ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                        </div>
                                        <div className="contact-bottom">
                                            <span className="tag-type">{c.type}</span>
                                            <p className="last-msg">{c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : mainTab === 'Users' ? (
                            loading ? <p className="loading">Loading...</p> :
                            chats.filter(c => c.userName.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <div key={c._id} className={`contact-item ${selectedChat?._id === c._id ? 'active' : ''}`} onClick={() => setSelectedChat(c)}>
                                    <div className="contact-avatar">{c.userName.charAt(0)}</div>
                                    <div className="contact-info">
                                        <div className="contact-top">
                                            <h4>{c.userName}</h4>
                                            <div className="meta-right">
                                                {c.hasRequestedHelp && <span className="help-dot"></span>}
                                                <span className="msg-time">{c.messages.length > 0 ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                        </div>
                                        <p className="last-msg">{c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages'}</p>
                                    </div>
                                </div>
                            ))
                        ) : mainTab === 'Chefs' ? (
                            partnerLoading ? <p className="loading">Loading...</p> :
                            partnerChats.filter(c => c.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <div key={c._id} className={`contact-item ${selectedPartnerChat?._id === c._id ? 'active' : ''}`} onClick={() => setSelectedPartnerChat(c)}>
                                    <div className="contact-avatar">{c.partnerName?.charAt(0) || 'P'}</div>
                                    <div className="contact-info">
                                        <div className="contact-top">
                                            <h4>{c.partnerName}</h4>
                                            <div className="meta-right">
                                                {c.hasRequestedHelp && <span className="help-dot"></span>}
                                                <span className="msg-time">{c.messages.length > 0 ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                        </div>
                                        <p className="last-msg">{c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages'}</p>
                                    </div>
                                </div>
                            ))
                        ) : mainTab === 'Riders' ? (
                            riderLoading ? <p className="loading">Loading...</p> :
                            riderChats.filter(c => c.riderName?.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <div key={c._id} className={`contact-item ${selectedRiderChat?._id === c._id ? 'active' : ''}`} onClick={() => setSelectedRiderChat(c)}>
                                    <div className="contact-avatar">{c.riderName?.charAt(0) || 'R'}</div>
                                    <div className="contact-info">
                                        <div className="contact-top">
                                            <h4>{c.riderName}</h4>
                                            <div className="meta-right">
                                                {c.hasRequestedHelp && <span className="help-dot"></span>}
                                                <span className="msg-time">{c.messages.length > 0 ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                        </div>
                                        <p className="last-msg">{c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            orderLoading ? <p className="loading">Loading...</p> :
                            orderChats.filter(c => c.customerName?.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <div key={c._id} className={`contact-item ${selectedOrderChat?._id === c._id ? 'active' : ''}`} onClick={() => setSelectedOrderChat(c)}>
                                    <div className="contact-avatar">{c.customerName?.charAt(0) || 'O'}</div>
                                    <div className="contact-info">
                                        <div className="contact-top">
                                            <h4>{c.customerName}</h4>
                                            <span className="msg-time">{c.messages.length > 0 ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        </div>
                                        <p className="last-msg">{c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* === CHAT WINDOW === */}
                <div className="whatsapp-chat-window chat-window">
                    {mainTab === 'Users' && selectedChat ? (
                        <>
                            <div className="whatsapp-header chat-header" id="chat-header">
                                <div className="chat-header-info">
                                    <div className="header-avatar" style={{ background: '#FF7622' }}>{selectedChat.userName.charAt(0)}</div>
                                    <div>
                                        <h3>{selectedChat.userName}</h3>
                                        <p className="header-status">Active Session</p>
                                    </div>
                                </div>
                            </div>
                            <div className="whatsapp-messages chat-messages">
                                {selectedChat.messages.map((msg, idx) => (
                                    <div key={idx} className={`whatsapp-bubble chat-message ${msg.sender === 'Admin' ? 'admin' : 'user'}`}>
                                        <div className="msg-body">
                                            <p>{msg.text}</p>
                                            <div className="msg-meta">
                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.sender === 'Admin' && <span className="ticks">✔✔</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <form className="whatsapp-input chat-input" onSubmit={sendUserMessage}>
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={inputText} 
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="send-btn" disabled={!inputText.trim()}>➤</button>
                            </form>
                        </>
                    ) : mainTab === 'Chefs' && selectedPartnerChat ? (
                        <>
                            <div className="whatsapp-header chat-header" id="chat-header">
                                <div className="chat-header-info">
                                    <div className="header-avatar" style={{ background: '#FF7622' }}>{selectedPartnerChat.partnerName.charAt(0)}</div>
                                    <div>
                                        <h3>{selectedPartnerChat.partnerName}</h3>
                                        <p className="header-status">Active Session</p>
                                    </div>
                                </div>
                            </div>
                            <div className="whatsapp-messages chat-messages">
                                {selectedPartnerChat.messages.map((msg, idx) => (
                                    <div key={idx} className={`whatsapp-bubble chat-message ${msg.sender === 'Admin' ? 'admin' : 'user'}`}>
                                        <div className="msg-body">
                                            <p>{msg.text}</p>
                                            <div className="msg-meta">
                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.sender === 'Admin' && <span className="ticks">✔✔</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={partnerBottomRef} />
                            </div>
                            <form className="whatsapp-input chat-input" onSubmit={sendPartnerMessage}>
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={partnerInput} 
                                        onChange={(e) => setPartnerInput(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="send-btn" disabled={!partnerInput.trim()}>➤</button>
                            </form>
                        </>
                    ) : mainTab === 'Riders' && selectedRiderChat ? (
                        <>
                            <div className="whatsapp-header chat-header" id="chat-header">
                                <div className="chat-header-info">
                                    <div className="header-avatar" style={{ background: '#2D8A4E' }}>{selectedRiderChat.riderName.charAt(0)}</div>
                                    <div>
                                        <h3>{selectedRiderChat.riderName}</h3>
                                        <p className="header-status">Active Session</p>
                                    </div>
                                </div>
                            </div>
                            <div className="whatsapp-messages chat-messages">
                                {selectedRiderChat.messages.map((msg, idx) => (
                                    <div key={idx} className={`whatsapp-bubble chat-message ${msg.sender === 'Admin' ? 'admin' : 'user'}`}>
                                        <div className="msg-body">
                                            <p>{msg.text}</p>
                                            <div className="msg-meta">
                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.sender === 'Admin' && <span className="ticks">✔✔</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={riderBottomRef} />
                            </div>
                            <form className="whatsapp-input chat-input" onSubmit={sendRiderMessage}>
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={riderInput} 
                                        onChange={(e) => setRiderInput(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="send-btn" disabled={!riderInput.trim()}>➤</button>
                            </form>
                        </>
                    ) : mainTab === 'Orders' && selectedOrderChat ? (
                        <>
                            <div className="whatsapp-header chat-header" id="chat-header">
                                <div className="chat-header-info">
                                    <div className="header-avatar" style={{ background: '#FF6B00' }}>{selectedOrderChat.customerName.charAt(0)}</div>
                                    <div>
                                        <h3>Order #{selectedOrderChat.orderId} - {selectedOrderChat.customerName}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="whatsapp-messages chat-messages">
                                {selectedOrderChat.messages.map((msg, idx) => (
                                    <div key={idx} className={`whatsapp-bubble chat-message ${msg.sender === 'Admin' ? 'admin' : 'user'}`}>
                                        <div className="msg-body">
                                            <p>{msg.text}</p>
                                            <div className="msg-meta">
                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <form className="whatsapp-input chat-input" onSubmit={sendOrderMessage}>
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={inputText} 
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="send-btn" disabled={!inputText.trim()}>➤</button>
                            </form>
                        </>
                    ) : (
                        <div className="welcome-chat-screen">
                            <div className="welcome-content">
                                <div className="welcome-icon">🍱</div>
                                <h1>Maa Ki Rasoi Support</h1>
                                <p>Select a contact to start chatting. You can view message history from Users, Chefs, and Riders.</p>
                            </div>
                            <div className="welcome-footer">
                                🔒 End-to-end encrypted support lines
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
