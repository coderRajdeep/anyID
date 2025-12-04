import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

interface ChatSectionProps {
    apiKey: string;
    imageUrl: string;
    initialDescription: string;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ apiKey, imageUrl, initialDescription }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiKey && imageUrl) {
            const initChat = async () => {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                // We can't easily start a chat with an image in the history in the current SDK version 
                // in a way that persists the image context for all future turns without sending it again.
                // However, for simplicity, we will start a chat and send the image with the first prompt 
                // or just rely on the text context if the user asks about the "person".
                // A better approach for "Ask about this image" is to send the image with every request 
                // or use the multimodal chat capabilities if supported.

                // Strategy: We will use the initial description as context. 
                // If the user asks specific visual questions, we might need to resend the image.
                // For now, let's try to start a chat with the system instruction or initial history.

                const session = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: `I have identified this image. Here is the description: ${initialDescription}. I will ask you questions about it.` }],
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'Understood. I am ready to answer your questions about the identified person/object.' }],
                        },
                    ],
                });
                setChatSession(session);
            };
            initChat();
        }
    }, [apiKey, imageUrl, initialDescription]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            // We are sending just text here. If we needed to send the image again, we would use generateContent with image.
            // But since we seeded the chat with the description, it should work for general questions.
            const result = await chatSession.sendMessage(userMessage);
            const response = result.response.text();

            setMessages((prev) => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 glass rounded-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 bg-white/10 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💬</span> Ask about this
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Ask any question about the identified person or object!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white/10 text-gray-100 rounded-bl-none'
                                }`}
                        >
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-lg rounded-bl-none flex gap-2 items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSection;
