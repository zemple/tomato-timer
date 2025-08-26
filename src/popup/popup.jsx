// 更新 src/popup/popup.jsx - 更美观的版本
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import Timer from '../components/Timer';

function Popup() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full opacity-50 blur-xl" />
        <div className="absolute bottom-8 left-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-50 blur-xl" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30 blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* 精美的头部 */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-400 to-pink-500 text-white shadow-xl">
        {/* 头部装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-pink-600/20" />
        
        <div className="relative z-10 p-4 text-center">
          <div className="flex items-center justify-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="text-xl">🍅</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">Tomato Timer</h1>
              <p className="text-red-100 text-xs font-medium opacity-90">focus·efficiency·growth</p>
            </div>
          </div>
        </div>
        
        {/* 底部波浪效果 */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 320 20" className="w-full h-5">
            <path 
              d="M0,10 Q80,0 160,10 T320,10 L320,20 L0,20 Z" 
              fill="white" 
              fillOpacity="0.1"
            />
          </svg>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="relative z-10 p-4">
        <Timer />
      </div>
    </div>
  );
}

// 渲染到DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}