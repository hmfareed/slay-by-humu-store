'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, User, MessageCircle, Sparkles, ShoppingBag, Package, ExternalLink, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/src/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'products' | 'orders' | 'cart' | 'quickActions';
  data?: any;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  authToken?: string | null;
  cartItems?: any[];
  wishlistItems?: any[];
}

// ── Intent Detection ───────────────────────────────────────────────────────

type Intent = 'greeting' | 'product_search' | 'order_status' | 'cart_info' | 'delivery_info' | 'return_info' | 'account_help' | 'checkout_help' | 'thanks' | 'farewell' | 'unknown';

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[] }[] = [
  { intent: 'greeting', patterns: [/^(hi|hello|hey|good\s?(morning|afternoon|evening)|greetings|yo|sup|what'?s\s?up)/i] },
  { intent: 'product_search', patterns: [/recommend|suggest|show\s?me|looking\s?for|find|search|best|wig|hair|straight|curly|wavy|bone|deep\s?wave|water\s?wave|frontal|closure|bundle|piece|style|cheap|expensive|under|budget|product|collection|new\s?arrival|category/i] },
  { intent: 'order_status', patterns: [/order|track|where\s?is\s?my|status|shipping\s?status|delivery\s?status|when\s?will|shipped|delivered|pending|processing|cancel/i] },
  { intent: 'cart_info', patterns: [/cart|bag|basket|what('?s| is)\s?in\s?my|items?\s?i\s?(have|added)|shopping/i] },
  { intent: 'delivery_info', patterns: [/deliver|shipping|ship|how\s?long|arrival|dispatch|courier|location|address|international/i] },
  { intent: 'return_info', patterns: [/return|refund|exchange|money\s?back|replace|damaged|defective|wrong\s?item/i] },
  { intent: 'account_help', patterns: [/account|profile|setting|password|email|phone|address|payment\s?method|update\s?my|change\s?my|edit\s?my/i] },
  { intent: 'checkout_help', patterns: [/checkout|pay|purchase|buy|momo|mobile\s?money|card|visa|mastercard|how\s?to\s?pay|payment/i] },
  { intent: 'thanks', patterns: [/thank|thx|thanks|appreciate|helpful|great\s?help/i] },
  { intent: 'farewell', patterns: [/bye|goodbye|see\s?you|later|take\s?care|good\s?night/i] },
];

function detectIntent(text: string): { intent: Intent; query: string } {
  const cleaned = text.trim().toLowerCase();
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return { intent, query: cleaned };
      }
    }
  }
  return { intent: 'unknown', query: cleaned };
}

// ── Extract search terms from natural language ─────────────────────────────

function extractSearchTerms(text: string): string {
  const stopWords = ['i', 'want', 'need', 'looking', 'for', 'show', 'me', 'find', 'some', 'a', 'the', 'any', 'can', 'you', 'please', 'do', 'have', 'recommend', 'suggest', 'best', 'good', 'nice'];
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const meaningful = words.filter(w => !stopWords.includes(w) && w.length > 1);
  return meaningful.join(' ') || text;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AIChat({ isOpen, onClose, userName, authToken, cartItems = [], wishlistItems = [] }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = userName ? `Hello ${userName}!` : 'Hello there!';
      setMessages([
        {
          id: 'welcome',
          text: `${greeting} I'm your Slay Assistant. I can help you find products, track orders, manage your account, and more. What can I do for you?`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'quickActions',
          data: {
            actions: [
              { label: 'Browse Products', message: 'Show me your best products' },
              { label: 'Track My Order', message: 'Where is my order?' },
              { label: 'View My Cart', message: "What's in my cart?" },
              { label: 'Talk to Support', message: 'I need help with something' },
            ]
          }
        },
      ]);
    }
  }, [isOpen, userName, messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── API Helpers ────────────────────────────────────────────────────────

  const searchProducts = useCallback(async (query: string) => {
    try {
      const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=4`);
      if (res.ok) return await res.json();
    } catch (e) { console.error('Product search failed:', e); }
    return [];
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!authToken) return null;
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) return await res.json();
    } catch (e) { console.error('Order fetch failed:', e); }
    return null;
  }, [authToken]);

  // ── Response Generators ────────────────────────────────────────────────

  const generateResponse = useCallback(async (userText: string): Promise<Message> => {
    const { intent, query } = detectIntent(userText);
    const baseMsg = { id: (Date.now() + 1).toString(), sender: 'ai' as const, timestamp: new Date() };

    switch (intent) {

      case 'greeting': {
        const greetings = [
          `Hey${userName ? ` ${userName}` : ''}! How can I help you today?`,
          `Hello${userName ? ` ${userName}` : ''}! Welcome to Slay By Humu. What are you looking for?`,
          `Hi there! Ready to help you find your perfect look. What's on your mind?`,
        ];
        return { ...baseMsg, text: greetings[Math.floor(Math.random() * greetings.length)], type: 'text' };
      }

      case 'product_search': {
        const searchTerms = extractSearchTerms(userText);
        const products = await searchProducts(searchTerms);
        if (products && products.length > 0) {
          return {
            ...baseMsg,
            text: `Here's what I found for "${searchTerms}":`,
            type: 'products',
            data: { products }
          };
        }
        // Try broader search
        const allProducts = await searchProducts('');
        if (allProducts && allProducts.length > 0) {
          return {
            ...baseMsg,
            text: `I couldn't find exact matches for "${searchTerms}", but here are some of our popular pieces:`,
            type: 'products',
            data: { products: allProducts.slice(0, 4) }
          };
        }
        return { ...baseMsg, text: "I couldn't find any products right now. Try browsing our full collection on the Shop page!", type: 'text' };
      }

      case 'order_status': {
        if (!authToken) {
          return { ...baseMsg, text: "To track your orders, you'll need to sign in first. Head to your Account page to log in, then come back and I'll help you track your order.", type: 'text' };
        }
        const orders = await fetchOrders();
        if (orders && orders.length > 0) {
          return {
            ...baseMsg,
            text: `Here are your recent orders:`,
            type: 'orders',
            data: { orders: orders.slice(0, 5) }
          };
        }
        return { ...baseMsg, text: "You don't have any orders yet. Ready to start shopping? Just ask me to show you some products.", type: 'text' };
      }

      case 'cart_info': {
        if (cartItems.length === 0) {
          return { ...baseMsg, text: "Your cart is empty right now. Want me to recommend some products? Just tell me what style you're looking for.", type: 'text' };
        }
        const total = cartItems.reduce((sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 1), 0);
        return {
          ...baseMsg,
          text: `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart (₵${total.toLocaleString()} total):`,
          type: 'cart',
          data: { items: cartItems, total }
        };
      }

      case 'delivery_info': {
        return {
          ...baseMsg,
          type: 'text',
          text: `**Delivery Info:**\n\n• Orders are processed within **1–2 business days**\n• Delivery within Ghana: **1–3 days**\n• International shipping: **5–10 business days**\n• You'll receive a tracking update once your order ships\n\nNeed to update your delivery address? Go to **Account → Delivery Address**.`
        };
      }

      case 'return_info': {
        return {
          ...baseMsg,
          type: 'text',
          text: `**Returns & Refunds:**\n\n• Returns accepted within **7 days** of delivery\n• Items must be **unused** and in original packaging\n• Contact us via **WhatsApp (+233 50 200 2904)** to start a return\n• Refunds are processed within **3–5 business days** after we receive the item\n\nFor damaged or wrong items, please send photos via WhatsApp for faster resolution.`
        };
      }

      case 'account_help': {
        const helpItems = [];
        if (/address/i.test(userText)) helpItems.push({ text: 'Update Delivery Address', link: '/account/address' });
        if (/payment/i.test(userText)) helpItems.push({ text: 'Manage Payment Methods', link: '/account/payment' });
        if (/password/i.test(userText)) helpItems.push({ text: 'Change Password', link: '/account/settings' });
        if (/profile|name|email|phone/i.test(userText)) helpItems.push({ text: 'Edit Profile', link: '/account/settings' });

        if (helpItems.length === 0) {
          helpItems.push(
            { text: 'Delivery Address', link: '/account/address' },
            { text: 'Payment Methods', link: '/account/payment' },
            { text: 'Settings & Password', link: '/account/settings' },
            { text: 'Order History', link: '/account/orders' }
          );
        }
        return {
          ...baseMsg,
          type: 'text',
          text: `Here's where you can manage your account:\n\n${helpItems.map(h => `• [${h.text}](${h.link})`).join('\n')}\n\nYou can access these from the Account page. Need help with anything specific?`
        };
      }

      case 'checkout_help': {
        return {
          ...baseMsg,
          type: 'text',
          text: `**Payment & Checkout:**\n\n• We accept **Mobile Money** (MTN, Vodafone, AirtelTigo)\n• **Credit/Debit cards** (Visa, Mastercard)\n• **Bank Transfer**\n\n**To checkout:**\n1. Add items to your cart\n2. Go to Cart → Proceed to Checkout\n3. Enter your delivery address\n4. Choose payment method and confirm\n\nAll payments are secure. Need help adding something to your cart?`
        };
      }

      case 'thanks': {
        const responses = [
          "You're welcome! Happy to help. Is there anything else you need?",
          "My pleasure! Don't hesitate to ask if you need anything else.",
          "Glad I could help! Enjoy your shopping experience at Slay By Humu.",
        ];
        return { ...baseMsg, text: responses[Math.floor(Math.random() * responses.length)], type: 'text' };
      }

      case 'farewell': {
        return { ...baseMsg, text: `Goodbye${userName ? ` ${userName}` : ''}! Thanks for visiting Slay By Humu. Come back anytime!`, type: 'text' };
      }

      default: {
        return {
          ...baseMsg,
          type: 'text',
          text: `I'm not sure I understand that. Here are some things I can help with:\n\n• **Find products** — "Show me straight wigs"\n• **Track orders** — "Where is my order?"\n• **Cart info** — "What's in my cart?"\n• **Payment help** — "How do I pay?"\n• **Account help** — "Change my address"\n\nOr you can reach our team directly via **WhatsApp at +233 50 200 2904**.`
        };
      }
    }
  }, [userName, authToken, cartItems, searchProducts, fetchOrders]);

  // ── Send Handler ─────────────────────────────────────────────────────

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setIsTyping(true);

    // Simulate a small delay for natural feel
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const aiResponse = await generateResponse(text);
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  }, [input, generateResponse]);

  // ── Render Helpers ───────────────────────────────────────────────────

  const renderProductCards = (products: any[]) => (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {products.map((p: any) => (
        <Link key={p._id} href={`/products/${p._id}`} onClick={onClose}
          className="bg-brand-bg rounded-xl overflow-hidden border border-brand-text/5 hover:border-brand-accent/30 transition-all group">
          <div className="aspect-square overflow-hidden bg-brand-text/5">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-brand-muted" /></div>
            )}
          </div>
          <div className="p-2.5">
            <p className="font-sans font-semibold text-xs text-brand-text truncate">{p.name}</p>
            <p className="font-sans font-bold text-sm text-brand-accent mt-0.5">₵{p.price?.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderOrderCards = (orders: any[]) => (
    <div className="space-y-2 mt-3">
      {orders.map((o: any) => {
        const statusColors: Record<string, string> = {
          'Pending': 'text-amber-500 bg-amber-500/10',
          'Processing': 'text-blue-500 bg-blue-500/10',
          'Shipped': 'text-violet-500 bg-violet-500/10',
          'Delivered': 'text-emerald-500 bg-emerald-500/10',
          'Cancelled': 'text-rose-500 bg-rose-500/10',
        };
        const color = statusColors[o.status] || 'text-zinc-500 bg-zinc-500/10';
        return (
          <Link key={o._id} href="/account/orders" onClick={onClose}
            className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-text/5 hover:border-brand-accent/20 transition-colors">
            <div>
              <p className="font-sans font-semibold text-xs text-brand-text">Order #{o._id?.substring(0, 8)}</p>
              <p className="font-sans text-[10px] text-brand-muted mt-0.5">{new Date(o.createdAt).toLocaleDateString()} • {o.items?.length || 0} item(s)</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${color}`}>{o.status}</span>
              <p className="font-sans font-bold text-xs text-brand-text mt-0.5">₵{o.totalAmount?.toLocaleString()}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );

  const renderCartItems = (items: any[], total: number) => (
    <div className="space-y-2 mt-3">
      {items.map((item: any, idx: number) => {
        const product = item.product || item;
        return (
          <div key={idx} className="flex items-center gap-3 p-2.5 bg-brand-bg rounded-xl border border-brand-text/5">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-text/5 flex-shrink-0">
              {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 m-auto text-brand-muted" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium text-xs truncate">{product.name}</p>
              <p className="font-sans text-[10px] text-brand-muted">Qty: {item.quantity || 1}</p>
            </div>
            <p className="font-sans font-bold text-xs text-brand-accent">₵{((product.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
          </div>
        );
      })}
      <Link href="/cart" onClick={onClose}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-accent text-white rounded-xl font-sans font-bold text-xs hover:bg-brand-accent-hover transition-colors">
        Go to Cart — ₵{total.toLocaleString()} <ArrowRight size={14} />
      </Link>
    </div>
  );

  const renderQuickActions = (actions: { label: string; message: string }[]) => (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {actions.map((action, idx) => (
        <button key={idx} onClick={() => handleSend(action.message)}
          className="text-left p-3 bg-brand-bg rounded-xl border border-brand-text/5 hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all">
          <span className="font-sans font-medium text-xs text-brand-text">{action.label}</span>
        </button>
      ))}
    </div>
  );

  const renderMessageContent = (msg: Message) => {
    // Text with basic markdown-like formatting
    const formatText = (text: string) => {
      return text.split('\n').map((line, i) => {
        // Bold
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Links
        const withLinks = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-brand-accent underline">$1</a>');
        return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: withLinks || '&nbsp;' }} />;
      });
    };

    return (
      <div>
        <div className="text-sm font-sans leading-relaxed">{formatText(msg.text)}</div>
        {msg.type === 'products' && msg.data?.products && renderProductCards(msg.data.products)}
        {msg.type === 'orders' && msg.data?.orders && renderOrderCards(msg.data.orders)}
        {msg.type === 'cart' && msg.data?.items && renderCartItems(msg.data.items, msg.data.total)}
        {msg.type === 'quickActions' && msg.data?.actions && renderQuickActions(msg.data.actions)}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60" />
      
      {/* Chat Window */}
      <div className="relative w-full max-w-lg bg-brand-panel sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-text/5 flex items-center justify-between bg-brand-accent/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-text">SBH Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-brand-muted">AI • Online</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-text/5 rounded-full transition-colors text-brand-muted hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.sender === 'user' ? 'bg-brand-accent/10' : 'bg-brand-text/5'}`}>
                  {msg.sender === 'user' ? <User size={13} className="text-brand-accent" /> : <Bot size={13} className="text-brand-muted" />}
                </div>
                <div className={`p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-brand-accent text-white rounded-tr-none' 
                    : 'bg-brand-text/5 text-brand-text rounded-tl-none'
                }`}>
                  {renderMessageContent(msg)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] flex gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-text/5 flex-shrink-0 flex items-center justify-center mt-1">
                  <Bot size={13} className="text-brand-muted" />
                </div>
                <div className="bg-brand-text/5 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-muted animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-muted animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-muted animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-brand-text/5 bg-brand-panel">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about products, orders, or anything..."
              className="w-full bg-brand-text/5 border border-brand-text/10 rounded-2xl px-4 py-3.5 pr-12 text-sm font-sans focus:outline-none focus:border-brand-accent/50 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 w-9 h-9 bg-brand-accent text-white rounded-xl flex items-center justify-center hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-center text-brand-muted mt-2.5 font-sans uppercase tracking-[0.15em] flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-brand-accent" />
            Powered by Fareed Core Tech
          </p>
        </div>
      </div>
    </div>
  );
}
