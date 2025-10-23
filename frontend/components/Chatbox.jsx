"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Zap } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown'; // <--- Thư viện gây lỗi
import remarkGfm from 'remark-gfm';

// --- Bảng màu MakeGreen ---
const PRIMARY_GREEN = '#00B050';
const DARK_GREEN_GRADIENT = '#009E48';
const LIGHT_BG = '#F8F9FA';
const DARK_TEXT = '#212529';
const WHITE = '#FFFFFF';
// -------------------------

export default function MakeGreenChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        '⚡ Xin chào bạn! Tôi là **Trợ lý MakeGreen**, sẵn sàng tư vấn về dịch vụ thuê xe điện! 🛵',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 🚨 CẢNH BÁO BẢO MẬT
  const genAI = new GoogleGenerativeAI('AIzaSyBEpKZP9ka9I3IrKzX8ZqOA-Pr_CNjyOE0');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const makeGreenContext = `Bạn là trợ lý ảo của MakeGreen, một công ty cho thuê xe máy điện. 
      Nhiệm vụ của bạn là tư vấn cho khách hàng về các dịch vụ thuê xe.
      Hãy trả lời thân thiện, chuyên nghiệp, tập trung vào:
      1. Các dòng xe (như VinFast, Yadea, Pega).
      2. Quy trình thuê xe (4 bước: Chọn xe, Đặt online, Xác minh eKYC, Nhận xe).
      3. Các lợi ích (Tiết kiệm, An toàn, Thân thiện môi trường).
      Sử dụng emoji 🛵, ⚡, 💚 và Markdown để trình bày.

      Câu hỏi của khách: ${input}`;

      const result = await model.generateContent(makeGreenContext);
      const botMessage = {
        role: 'bot',
        content:
          result.response.text() ||
          'Xin lỗi, tôi chưa thể hỗ trợ câu hỏi này. 💚',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi API:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: `❌ Lỗi: ${error.message}. Bạn vui lòng thử lại sau nhé!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 w-full max-w-md h-[60vh] md:h-[500px] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col md:w-96"
          style={{ background: LIGHT_BG }}
        >
          {/* Header */}
          <div
            className="text-white p-6 relative"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${DARK_GREEN_GRADIENT} 100%)`,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(45deg, #FFFFFF, #E0E0E0)',
                  }}
                >
                  <Zap className="w-6 h-6" style={{ color: PRIMARY_GREEN }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Trợ lý MakeGreen</h3>
                  <p className="text-sm opacity-90 flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-4 rounded-2xl shadow-sm relative ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'rounded-bl-md border'
                  }`}
                  style={{
                    background:
                      msg.role === 'user'
                        ? `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${DARK_GREEN_GRADIENT} 100%)`
                        : WHITE,
                    color: msg.role === 'user' ? WHITE : DARK_TEXT,
                    borderColor: msg.role === 'user' ? 'transparent' : 'rgba(0, 176, 80, 0.2)',
                  }}
                >
                  {/*
                    ***** SỬA LỖI Ở ĐÂY *****
                    1. Bọc ReactMarkdown bằng 1 thẻ <div>.
                    2. Chuyển className từ ReactMarkdown sang thẻ <div> đó.
                  */}
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      // className="text-sm leading-relaxed prose prose-sm max-w-none" <-- Đã xóa dòng này
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Tail for user message */}
                  {msg.role === 'user' && (
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 transform rotate-45"
                      style={{ backgroundColor: DARK_GREEN_GRADIENT }}
                    ></div>
                  )}
                  {/* Tail for bot message */}
                  {msg.role === 'bot' && (
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-l border-b transform rotate-45"
                      style={{ borderColor: 'rgba(0, 176, 80, 0.2)' }}
                    ></div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="bg-white rounded-2xl rounded-bl-md p-4 border shadow-sm relative"
                  style={{ borderColor: 'rgba(0, 176, 80, 0.2)' }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: PRIMARY_GREEN }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: PRIMARY_GREEN,
                          animationDelay: '0.1s',
                        }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: PRIMARY_GREEN,
                          animationDelay: '0.2s',
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: PRIMARY_GREEN }}>
                      AI đang tìm xe...
                    </span>
                  </div>
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-l border-b transform rotate-45"
                    style={{ borderColor: 'rgba(0, 176, 80, 0.2)' }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-6 bg-white/80 backdrop-blur-sm"
            style={{ borderTop: `1px solid rgba(0, 176, 80, 0.1)` }}
          >
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi tôi về xe, giá thuê, quy trình..."
                className="flex-1 p-4 border-2 rounded-2xl focus:outline-none text-sm transition-all duration-300"
                style={{
                  backgroundColor: WHITE,
                  borderColor: 'rgba(0, 176, 80, 0.2)',
                  color: DARK_TEXT
                }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-4 text-white rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
                style={{
                  background:
                    isLoading || !input.trim()
                      ? '#9CA3AF'
                      : `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${DARK_GREEN_GRADIENT} 100%)`,
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 relative overflow-hidden ${
          isOpen ? 'bg-gray-500 hover:bg-gray-600' : ''
        }`}
        style={{
          background: isOpen
            ? undefined
            : `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${DARK_GREEN_GRADIENT} 100%)`,
        }}
      >
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
            <div
              className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            ></div>
          </>
        )}

        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}

