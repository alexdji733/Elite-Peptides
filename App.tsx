/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Home, 
  Grid, 
  User, 
  MessageSquare, 
  X, 
  Plus, 
  Minus, 
  Send, 
  ExternalLink,
  ShieldCheck,
  Info,
  Heart,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';

// --- Transliteration Helper ---
const transliterate = (text: string) => {
  const map: { [key: string]: string } = {
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'zh': 'ж',
    'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о',
    'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'ts': 'ц',
    'ch': 'ч', 'sh': 'ш', 'sch': 'щ', '`': 'ъ', 'yi': 'ы', "'": 'ь', 'ye': 'э', 'yu': 'ю', 'ya': 'я',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '`', 'ы': 'yi', 'ь': "'", 'э': 'ye', 'ю': 'yu', 'я': 'ya'
  };
  return text.split('').map(char => map[char.toLowerCase()] || char).join('');
};

// --- Vial Graphic Component ---
const VialGraphic = ({ name, inCart, className }: { name: string, inCart?: boolean, className?: string }) => (
  <div className={`relative flex flex-col items-center ${className}`}>
    {/* Cap */}
    <div className="w-[30%] h-[10%] bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-t-lg shadow-inner" />
    {/* Neck */}
    <div className="w-[20%] h-[5%] bg-white/20 backdrop-blur-sm border-x border-white/10" />
    {/* Body */}
    <div className="w-[80%] h-[60%] bg-white/10 backdrop-blur-md rounded-lg border border-white/20 relative overflow-hidden shadow-2xl">
      {/* Liquid */}
      <div className={`absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t ${inCart ? 'from-zinc-300/30' : 'from-gold/20'} to-transparent`} />
      {/* Label */}
      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 bg-white px-0.5 py-1 shadow-lg flex items-center justify-center">
        <span className="text-[6px] font-black text-black uppercase tracking-tighter text-center leading-none break-words">
          {name}
        </span>
      </div>
      {/* Gloss effect */}
      <div className="absolute top-0 left-1 w-0.5 h-full bg-white/10 blur-[1px]" />
    </div>
  </div>
);

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

interface ProductCardProps {
  product: Product;
  idx: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onClick: () => void;
}

const CATEGORIES = [
  "Все",
  "Пептиды",
  "ProComplex",
  "ProDerma",
  "Bio-Liquid Solutions",
  "Bio-Regulatory Peptides",
  "Вспомогательные товары",
  "Пептиды tablets",
  "Косметическое сырье"
];

// --- Mock Data ---
const PRODUCTS: Product[] = [
  // Пептиды
  {
    id: 1,
    name: "BPC-157",
    description: "Регенерация тканей и заживление",
    price: 4500,
    image: "https://picsum.photos/seed/peptide1/400/400",
    category: "Пептиды"
  },
  {
    id: 2,
    name: "TB-500",
    description: "Восстановление мышц и связок",
    price: 5200,
    image: "https://picsum.photos/seed/peptide2/400/400",
    category: "Пептиды"
  },
  {
    id: 3,
    name: "Ipamorelin",
    description: "Стимуляция гормона роста",
    price: 3800,
    image: "https://picsum.photos/seed/peptide3/400/400",
    category: "Пептиды"
  },
  {
    id: 4,
    name: "Melanotan II",
    description: "Идеальный загар и защита кожи",
    price: 2900,
    image: "https://picsum.photos/seed/peptide4/400/400",
    category: "Пептиды"
  },
  {
    id: 5,
    name: "Cagrilintide",
    description: "Контроль аппетита и веса",
    price: 7500,
    image: "https://picsum.photos/seed/cagri/400/400",
    category: "Пептиды"
  },
  {
    id: 6,
    name: "AOD9604",
    description: "Эффективное сжигание жира",
    price: 4800,
    image: "https://picsum.photos/seed/aod/400/400",
    category: "Пептиды"
  },
  {
    id: 7,
    name: "Adipotide",
    description: "Таргетное сжигание жировой ткани",
    price: 8200,
    image: "https://picsum.photos/seed/adipotide/400/400",
    category: "Пептиды"
  },
  {
    id: 10,
    name: "Survodutide",
    description: "Инновационный пептид для снижения веса",
    price: 8900,
    image: "https://picsum.photos/seed/survo/400/400",
    category: "Пептиды"
  },
  {
    id: 11,
    name: "RetaRivi",
    description: "Комплексный пептид для метаболизма",
    price: 7200,
    image: "https://picsum.photos/seed/reta/400/400",
    category: "Пептиды"
  },
  {
    id: 12,
    name: "Sema",
    description: "Классический пептид для контроля веса",
    price: 5500,
    image: "https://picsum.photos/seed/sema/400/400",
    category: "Пептиды"
  },

  // ProComplex
  {
    id: 13,
    name: "KLOW",
    description: "Мультитаргетный регенеративный комплекс",
    price: 12500,
    image: "https://picsum.photos/seed/klow/400/400",
    category: "ProComplex"
  },
  {
    id: 14,
    name: "GLOW 35/10/5",
    description: "Синергия GHK-cu, Tb-500, Bpc-157",
    price: 11800,
    image: "https://picsum.photos/seed/glow/400/400",
    category: "ProComplex"
  },
  {
    id: 15,
    name: "GBK-Complex",
    description: "GHK-cu + BPC-157 + KPV",
    price: 10500,
    image: "https://picsum.photos/seed/gbk/400/400",
    category: "ProComplex"
  },
  {
    id: 16,
    name: "Sem+Sel",
    description: "Комбинация Semax и Selank",
    price: 6800,
    image: "https://picsum.photos/seed/semsel/400/400",
    category: "ProComplex"
  },
  {
    id: 17,
    name: "Mots-c+SS31",
    description: "Митохондриальный энергетический комплекс",
    price: 9200,
    image: "https://picsum.photos/seed/mots/400/400",
    category: "ProComplex"
  },

  // ProDerma
  {
    id: 18,
    name: "Matrixyl",
    description: "Пептид молодости для кожи",
    price: 3500,
    image: "https://picsum.photos/seed/matrixyl/400/400",
    category: "ProDerma"
  },
  {
    id: 19,
    name: "Snap-8",
    description: "Альтернатива ботоксу в пептидах",
    price: 4200,
    image: "https://picsum.photos/seed/snap8/400/400",
    category: "ProDerma"
  },
  {
    id: 20,
    name: "GHK-Cu 200mg",
    description: "Косметическое сырье высокой чистоты",
    price: 15000,
    image: "https://picsum.photos/seed/ghkcu/400/400",
    category: "ProDerma"
  },

  // Bio-Liquid Solutions
  {
    id: 8,
    name: "NAD+",
    description: "Клеточное омоложение и энергия",
    price: 9500,
    image: "https://picsum.photos/seed/nad/400/400",
    category: "Bio-Liquid Solutions"
  },
  {
    id: 21,
    name: "LIPO-C",
    description: "Липосомальный витамин C",
    price: 3200,
    image: "https://picsum.photos/seed/lipoc/400/400",
    category: "Bio-Liquid Solutions"
  },
  {
    id: 22,
    name: "LC526",
    description: "Жидкий био-раствор для метаболизма",
    price: 4800,
    image: "https://picsum.photos/seed/lc526/400/400",
    category: "Bio-Liquid Solutions"
  },
  {
    id: 23,
    name: "GAZ",
    description: "Био-активный раствор для энергии",
    price: 5100,
    image: "https://picsum.photos/seed/gaz/400/400",
    category: "Bio-Liquid Solutions"
  },
  {
    id: 24,
    name: "RELAXATION PM",
    description: "Раствор для улучшения сна",
    price: 3900,
    image: "https://picsum.photos/seed/relax/400/400",
    category: "Bio-Liquid Solutions"
  },

  // Bio-Regulatory Peptides
  {
    id: 25,
    name: "Testagen",
    description: "Биорегулятор мужской системы",
    price: 4500,
    image: "https://picsum.photos/seed/testagen/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 26,
    name: "Vilon",
    description: "Биорегулятор иммунной системы",
    price: 4200,
    image: "https://picsum.photos/seed/vilon/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 27,
    name: "Pinealon",
    description: "Биорегулятор работы мозга",
    price: 4800,
    image: "https://picsum.photos/seed/pinealon/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 28,
    name: "Vesugen",
    description: "Биорегулятор сосудистой системы",
    price: 4400,
    image: "https://picsum.photos/seed/vesugen/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 29,
    name: "Prostamax",
    description: "Биорегулятор простаты",
    price: 4600,
    image: "https://picsum.photos/seed/prosta/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 33,
    name: "Pancragen",
    description: "Биорегулятор поджелудочной железы",
    price: 4300,
    image: "https://picsum.photos/seed/pancra/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 34,
    name: "Livagen",
    description: "Биорегулятор печени",
    price: 4400,
    image: "https://picsum.photos/seed/liver/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 35,
    name: "Crystagen",
    description: "Биорегулятор иммунитета",
    price: 4200,
    image: "https://picsum.photos/seed/crystal/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 36,
    name: "Cortagen",
    description: "Биорегулятор коры головного мозга",
    price: 4700,
    image: "https://picsum.photos/seed/corta/400/400",
    category: "Bio-Regulatory Peptides"
  },
  {
    id: 37,
    name: "Cartalax",
    description: "Биорегулятор хрящевой ткани",
    price: 4500,
    image: "https://picsum.photos/seed/cartalax/400/400",
    category: "Bio-Regulatory Peptides"
  },

  // Пептиды tablets
  {
    id: 38,
    name: "Methylene Blue",
    description: "20mg x 100 таблеток",
    price: 5500,
    image: "https://picsum.photos/seed/blue/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 39,
    name: "Dihexa",
    description: "20mg x 25 таблеток",
    price: 8200,
    image: "https://picsum.photos/seed/dihexa/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 40,
    name: "Tesofensine",
    description: "500mcg x 100 таблеток",
    price: 12500,
    image: "https://picsum.photos/seed/teso/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 41,
    name: "BAM 15",
    description: "50mg х 60 таблеток",
    price: 9800,
    image: "https://picsum.photos/seed/bam15/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 42,
    name: "Orfoglipron",
    description: "6mg x 100 таблеток",
    price: 14500,
    image: "https://picsum.photos/seed/orfo/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 43,
    name: "5-Amino-1MQ",
    description: "50mg x 100 таблеток",
    price: 11200,
    image: "https://picsum.photos/seed/5amino/400/400",
    category: "Пептиды tablets"
  },
  {
    id: 44,
    name: "МК-677",
    description: "10mg x 100 таблеток",
    price: 6500,
    image: "https://picsum.photos/seed/mk677/400/400",
    category: "Пептиды tablets"
  },

  // Вспомогательные товары
  {
    id: 9,
    name: "Bacteriostatic water",
    description: "Вода для инъекций 10мл",
    price: 500,
    image: "https://picsum.photos/seed/water/400/400",
    category: "Вспомогательные товары"
  },
  {
    id: 30,
    name: "ACETIC ACID",
    description: "Растворитель для пептидов",
    price: 400,
    image: "https://picsum.photos/seed/acetic/400/400",
    category: "Вспомогательные товары"
  },
  {
    id: 31,
    name: "HumaPen Luxura",
    description: "Инъекционная ручка премиум класса",
    price: 8500,
    image: "https://picsum.photos/seed/pen/400/400",
    category: "Вспомогательные товары"
  },
  {
    id: 32,
    name: "Картридж 3мл",
    description: "Стерильный картридж для ручки",
    price: 300,
    image: "https://picsum.photos/seed/cartridge/400/400",
    category: "Вспомогательные товары"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'cart' | 'profile' | 'favorites'>('home');
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Привет! Я ваш AI-ассистент. Чем могу помочь в выборе пептидов?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // --- Favorites Logic ---
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const insurance = subtotal * 0.03;
  const total = subtotal + insurance;

  // --- Filtered Products ---
  const fuse = new Fuse(PRODUCTS, {
    keys: ['name', 'category', 'description'],
    threshold: 0.4, // Allow more errors
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2
  });

  const filteredProducts = searchQuery.trim() 
    ? Array.from(new Set([
        ...fuse.search(searchQuery).map(result => result.item),
        ...fuse.search(transliterate(searchQuery)).map(result => result.item)
      ]))
    : PRODUCTS.filter(p => selectedCategory === "Все" || p.category === selectedCategory);

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  // --- Chat Logic ---
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    try {
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'local-model',
          messages: [{ role: 'user', content: inputValue }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch from LM Studio');

      const data = await response.json();
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        text: data.choices[0].message.content, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error connecting to LM Studio:', error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        text: "Извините, не удалось подключиться к локальной модели LM Studio. Убедитесь, что она запущена.", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-gold/30">
      {/* Header */}
      <header className="sticky top-0 z-40 glass px-6 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xs">PE</span>
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">Elite Peptides</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`relative p-1 transition-colors ${activeTab === 'favorites' ? 'text-gold' : 'text-white/40'}`}
            >
              <Heart size={20} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[8px] font-black rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <a 
              href="https://t.me/your_channel" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium text-gold border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors"
            >
              Telegram <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-gold transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Поиск по названию, категории или симптому..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() && activeTab !== 'catalog') {
                setActiveTab('catalog');
              }
            }}
            className="w-full glass bg-white/5 border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/50 transition-all placeholder:text-white/20"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="relative h-64 rounded-3xl overflow-hidden group">
                <img 
                  src="https://picsum.photos/seed/luxury-lab/800/600" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 space-y-2">
                  <span className="text-gold text-xs font-bold uppercase tracking-widest">New Arrival</span>
                  <h2 className="text-3xl font-bold leading-tight">Вершина биохакинга</h2>
                  <button 
                    onClick={() => setActiveTab('catalog')}
                    className="gold-gradient text-black px-6 py-2 rounded-full text-sm font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                  >
                    В каталог
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-2xl space-y-2">
                  <ShieldCheck className="text-gold" size={24} />
                  <h3 className="font-bold text-sm">Гарантия качества</h3>
                  <p className="text-xs text-white/50 leading-relaxed">Лабораторные тесты каждой партии</p>
                </div>
                <div className="glass p-4 rounded-2xl space-y-2">
                  <ShoppingBag className="text-gold" size={24} />
                  <h3 className="font-bold text-sm">Быстрая доставка</h3>
                  <p className="text-xs text-white/50 leading-relaxed">Отправка в день заказа</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-lg font-bold">Популярные категории</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {CATEGORIES.slice(1, 5).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab('catalog');
                      }}
                      className="whitespace-nowrap glass px-4 py-2 rounded-full text-xs font-medium hover:border-gold/50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'catalog' && (
            <motion.div 
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold tracking-tight">
                  {searchQuery ? 'Результаты поиска' : 'Каталог'}
                </h2>
                <span className="text-xs text-white/40">{filteredProducts.length} позиций</span>
              </div>

              {/* Categories Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat 
                        ? 'gold-gradient text-black' 
                        : 'glass text-white/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    idx={idx} 
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    onAddToCart={() => addToCart(product)}
                    onUpdateQuantity={(delta) => updateQuantity(product.id, delta)}
                    cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div 
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold tracking-tight">Избранное</h2>
                <span className="text-xs text-white/40">{favoriteProducts.length} позиций</span>
              </div>
              
              {favoriteProducts.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <Heart size={48} className="mx-auto text-white/10" />
                  <p className="text-white/40">В избранном пока ничего нет</p>
                  <button 
                    onClick={() => setActiveTab('catalog')}
                    className="text-gold text-sm font-bold underline underline-offset-4"
                  >
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {favoriteProducts.map((product, idx) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      idx={idx} 
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      onAddToCart={() => addToCart(product)}
                      onUpdateQuantity={(delta) => updateQuantity(product.id, delta)}
                      cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              <div className="w-24 h-24 rounded-full border-2 border-gold p-1">
                <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                  <User size={40} className="text-gold" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">Elite Member</h2>
                <p className="text-sm text-white/40">ID: 8829-XJ</p>
              </div>
              <div className="w-full space-y-3">
                <button className="w-full glass py-4 rounded-2xl flex justify-between px-6 items-center hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium">История заказов</span>
                  <ExternalLink size={16} className="text-white/20" />
                </button>
                <button className="w-full glass py-4 rounded-2xl flex justify-between px-6 items-center hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium">Настройки</span>
                  <ExternalLink size={16} className="text-white/20" />
                </button>
                <button className="w-full border border-red-500/30 text-red-500 py-4 rounded-2xl text-sm font-bold">
                  Выйти
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 px-6 py-12 border-t border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Магазин</h4>
            <ul className="space-y-2 text-xs text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Оплата и доставка</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Возврат и обмен</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Публичная оферта</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Полезная информация</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Контакты</h4>
            <ul className="space-y-2 text-xs text-white/40">
              <li><a href="tel:+79033514333" className="hover:text-white transition-colors">+7 (903) 351-43-33</a></li>
              <li><a href="tel:+79638996435" className="hover:text-white transition-colors">+7 (963) 899-64-35</a></li>
              <li><a href="mailto:info@rivivelife.ru" className="hover:text-white transition-colors">info@rivivelife.ru</a></li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-2 opacity-30">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p className="text-[10px] uppercase tracking-tighter leading-relaxed">
              Для исследовательских целей, не является лекарством. Перед применением проконсультируйтесь со специалистом.
            </p>
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/20 uppercase tracking-widest font-bold pt-6 border-t border-white/5">
            <span>© 2026 Elite Peptides</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 glass rounded-t-[40px] z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold">Корзина</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <ShoppingBag size={48} className="mx-auto text-white/10" />
                    <p className="text-white/40">Ваша корзина пуста</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <VialGraphic name={item.name} className="w-12 h-16" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-gold font-bold">{item.price.toLocaleString()} ₽</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-white/40"><Minus size={14} /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gold"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-black/50 border-t border-white/5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Сумма</span>
                      <span>{subtotal.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Страховка (3%)</span>
                      <span>{insurance.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold">Итого</span>
                      <span className="text-xl font-bold text-gold">{total.toLocaleString()} ₽</span>
                    </div>
                  </div>
                  <button className="w-full gold-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
                    Оформить заказ
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Assistant Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)] z-40 hover:scale-110 transition-transform"
      >
        <MessageSquare className="text-white" size={24} />
      </button>

      {/* AI Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-6 bottom-28 top-20 glass rounded-[32px] z-50 flex flex-col overflow-hidden shadow-2xl border-violet-500/20"
          >
            <div className="p-5 bg-violet-600 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Elite AI Assistant</h3>
                  <p className="text-[10px] text-white/70">Online • RTX 5080 Powered</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Спросите ассистента..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button 
                onClick={handleSendMessage}
                className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center hover:bg-violet-500 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass h-20 px-6 flex justify-between items-center z-40 rounded-t-3xl border-t border-white/10">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<Home size={22} />} 
          label="Главная" 
        />
        <NavButton 
          active={activeTab === 'catalog'} 
          onClick={() => setActiveTab('catalog')} 
          icon={<Grid size={22} />} 
          label="Каталог" 
        />
        <NavButton 
          active={activeTab === 'favorites'} 
          onClick={() => setActiveTab('favorites')} 
          icon={<Heart size={22} />} 
          label="Избранное" 
        />
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 group"
        >
          <div className={`p-2 rounded-xl transition-all ${isCartOpen ? 'text-gold' : 'text-white/40'}`}>
            <ShoppingBag size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                {cart.length}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-tighter ${isCartOpen ? 'text-gold' : 'text-white/40'}`}>Корзина</span>
        </button>
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<User size={22} />} 
          label="Профиль" 
        />
      </nav>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-2xl bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="overflow-y-auto no-scrollbar">
                <div className="aspect-square sm:aspect-video relative bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center p-12">
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                  >
                    <X size={20} />
                  </button>
                  
                  <VialGraphic name={selectedProduct.name} className="w-40 h-60" />

                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-1 block">
                          {selectedProduct.category}
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight">{selectedProduct.name}</h2>
                      </div>
                      <div className="text-2xl font-black text-gold">
                        {selectedProduct.price.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Описание</h4>
                    <p className="text-white/70 leading-relaxed">
                      {selectedProduct.description}
                      {" "}Инновационный препарат высокой степени очистки, предназначенный для оптимизации физиологических процессов и повышения качества жизни. 
                      Разработан с применением передовых технологий биосинтеза.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                    <div className="text-center space-y-1">
                      <div className="text-gold font-bold">99.8%</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-tighter">Чистота</div>
                    </div>
                    <div className="text-center space-y-1 border-x border-white/5">
                      <div className="text-gold font-bold">10 мг</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-tighter">Дозировка</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-gold font-bold">Lab Test</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-tighter">Сертификат</div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    {cart.find(item => item.id === selectedProduct.id) ? (
                      <div className="flex-1 flex items-center justify-between bg-zinc-200/10 rounded-2xl px-6 py-4 border border-zinc-400/30">
                        <button 
                          onClick={() => updateQuantity(selectedProduct.id, -1)}
                          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white"
                        >
                          <Minus size={20} />
                        </button>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-black text-zinc-300">
                            {cart.find(item => item.id === selectedProduct.id)?.quantity}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-white/20">В корзине</span>
                        </div>
                        <button 
                          onClick={() => updateQuantity(selectedProduct.id, 1)}
                          className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          addToCart(selectedProduct);
                        }}
                        className="flex-1 gold-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all"
                      >
                        Добавить в корзину
                      </button>
                    )}
                    <button 
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`w-16 rounded-2xl flex items-center justify-center border transition-all ${
                        favorites.includes(selectedProduct.id) 
                          ? 'bg-gold border-gold text-black' 
                          : 'border-white/10 text-white hover:bg-white/5'
                      }`}
                    >
                      <Heart fill={favorites.includes(selectedProduct.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  idx: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  cartQuantity: number;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  idx, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart,
  onUpdateQuantity,
  cartQuantity,
  onClick
}) => {
  const inCart = cartQuantity > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onClick}
      className="glass rounded-3xl overflow-hidden group cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
        <VialGraphic name={product.name} inCart={inCart} className="w-20 h-32 sm:w-32 sm:h-48 group-hover:scale-110 transition-transform duration-500" />


        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-2 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isFavorite ? 'bg-gold text-black' : 'bg-black/40 text-white backdrop-blur-md hover:bg-white/20'
            }`}
          >
            <Heart size={14} className="sm:w-[18px] sm:h-[18px]" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {!inCart && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 gold-gradient text-black rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all shadow-lg"
            >
              <Plus size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-gold/80">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-3 sm:p-5 space-y-1">
        <h3 className="text-sm sm:text-lg font-bold truncate">{product.name}</h3>
        <p className="text-[10px] sm:text-xs text-white/50 line-clamp-1">{product.description}</p>
        <div className="pt-2 sm:pt-3 flex justify-between items-center h-8 sm:h-10">
          <span className="text-xs sm:text-gold font-bold">{product.price.toLocaleString()} ₽</span>
          
          {inCart ? (
            <div className="flex items-center gap-2 bg-zinc-200/10 rounded-full px-2 py-1 border border-zinc-400/20" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onUpdateQuantity(-1)}
                className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <Minus size={12} />
              </button>
              <span className="text-[10px] font-black w-4 text-center text-zinc-300">{cartQuantity}</span>
              <button 
                onClick={() => onUpdateQuantity(1)}
                className="w-5 h-5 flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest gold-gradient text-black px-3 py-1.5 rounded-full hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all"
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className="relative flex flex-col items-center gap-1 group">
      <div className={`p-2 rounded-xl transition-all ${active ? 'text-gold' : 'text-white/40'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? 'text-gold' : 'text-white/40'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-gold rounded-full"
        />
      )}
    </button>
  );
}

// Add Heart icon to imports if not already there
