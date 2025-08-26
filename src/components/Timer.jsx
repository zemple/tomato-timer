// 更新 src/components/Timer.jsx - 更美观的版本
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee } from 'lucide-react';

function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('work');

  const totalTime = phase === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert(phase === 'work' ? '🎉 工作时间结束！' : '✨ 休息结束！');
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, phase]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(phase === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchPhase = () => {
    const newPhase = phase === 'work' ? 'break' : 'work';
    setPhase(newPhase);
    setIsRunning(false);
    setTimeLeft(newPhase === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="space-y-5">
      {/* 精美的模式切换器 */}
      <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-1.5 shadow-inner">
        <div 
          className={`absolute top-1.5 left-1.5 w-1/2 h-8 bg-white rounded-xl shadow-lg transition-transform duration-300 ease-out ${
            phase === 'break' ? 'transform translate-x-full' : ''
          }`}
        />
        <div className="relative flex">
          <button
            onClick={() => phase !== 'work' && switchPhase()}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              phase === 'work' 
                ? 'text-red-600 z-10' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap size={14} />
            <span>工作</span>
          </button>
          <button
            onClick={() => phase !== 'break' && switchPhase()}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              phase === 'break' 
                ? 'text-green-600 z-10' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Coffee size={14} />
            <span>休息</span>
          </button>
        </div>
      </div>

      {/* 精美的圆形进度条 */}
      <div className="relative flex justify-center">
        {/* 外圈装饰 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-36 h-36 rounded-full ${
            phase === 'work' 
              ? 'bg-gradient-to-br from-red-50 to-pink-50' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50'
          } shadow-inner`} />
        </div>
        
        <svg className="w-32 h-32 transform -rotate-90 relative z-10" viewBox="0 0 120 120">
          {/* 背景圆环 */}
          <circle
            cx="60"
            cy="60"
            r="46"
            stroke="rgba(156, 163, 175, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* 进度圆环 */}
          <circle
            cx="60"
            cy="60"
            r="46"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              {phase === 'work' ? (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        
        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="text-2xl font-mono font-bold text-gray-800 mb-0.5">
            {formatTime(timeLeft)}
          </div>
          <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            phase === 'work' 
              ? 'text-red-700 bg-red-50 border-red-100' 
              : 'text-green-700 bg-green-50 border-green-100'
          }`}>
            {phase === 'work' ? '专注中' : '休息中'}
          </div>
          {isRunning && (
            <div className="flex items-center mt-1.5">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse mr-1 ${
                phase === 'work' ? 'bg-red-400' : 'bg-green-400'
              }`} />
              <span className="text-xs text-gray-500 font-medium">运行中</span>
            </div>
          )}
        </div>
      </div>

      {/* 精美的控制按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
            isRunning
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:from-amber-500 hover:via-orange-500 hover:to-orange-600 text-white'
              : 'bg-gradient-to-r from-emerald-400 via-green-400 to-green-500 hover:from-emerald-500 hover:via-green-500 hover:to-green-600 text-white'
          }`}
        >
          <div className={`p-1 bg-white bg-opacity-20 rounded-full ${
            isRunning ? 'animate-pulse' : ''
          }`}>
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </div>
          <span>{isRunning ? '暂停' : '开始'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="px-4 py-3.5 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
        >
          <div className="p-1 bg-white bg-opacity-20 rounded-full">
            <RotateCcw size={14} />
          </div>
        </button>
      </div>

      {/* 精美的统计卡片 */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">今日成果</span>
            <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
              0
            </span>
            <span className="text-xl">🍅</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">完成番茄钟</div>
        </div>
      </div>
    </div>
  );
}

export default Timer;