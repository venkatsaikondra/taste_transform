"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
// Removed: import { useChat } from '@ai-sdk/react'; 
import { MessageCircle, X, Send, Loader2, ArrowDownCircle } from 'lucide-react';
import Styles from './chat.module.css';

// Define a simple Message type since we aren't importing it anymore
type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

const Chat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showChatIcon, setShowChatIcon] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Local State Replacements for useChat ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 1. Add user message
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        
        // 2. Simulate AI thinking (Optional)
        setIsLoading(true);
        setTimeout(() => {
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: "Backend is currently disabled. This is a local preview." 
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1000);
    };

    const stop = () => setIsLoading(false);
    // ------------------------------------------

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowChatIcon(true);
            } else {
                setShowChatIcon(false);
                setIsChatOpen(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    return (
        <div className={Styles.chat_wrapper}>
            <AnimatePresence>
                {showChatIcon && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={Styles.chat_trigger}
                        onClick={toggleChat}
                    >
                        {isChatOpen ? <ArrowDownCircle /> : <MessageCircle />}
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                        className={Styles.chat_window}
                    >
                        <div className={Styles.chat_header}>
                            <div>
                                <h3 className={Styles.chat_title}>Chat with PIXCRAFT</h3>
                                <span className={Styles.status_dot}>Offline</span>
                            </div>
                            <button onClick={toggleChat} className={Styles.close_btn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={Styles.chat_content} ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className={Styles.empty_state}>
                                    <p>How can I help you today?</p>
                                </div>
                            )}
                            {messages.map((m) => (
                                <div key={m.id} className={`${Styles.message_bubble} ${m.role === 'user' ? Styles.user : Styles.ai}`}>
                                    {m.content}
                                </div>
                            ))}
                            {isLoading && (
                                <div className={Styles.loading_indicator}>
                                    <Loader2 className={Styles.spinner} size={16} />
                                    <button onClick={stop} className={Styles.stop_btn}>Stop generating</button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className={Styles.chat_footer}>
                            <input 
                                value={input} 
                                onChange={handleInputChange} 
                                placeholder='Ask me anything...' 
                                className={Styles.chat_input}
                            />
                            <button type='submit' disabled={isLoading || !input} className={Styles.send_btn}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Chat;