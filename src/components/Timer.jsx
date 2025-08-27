import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee } from 'lucide-react';

function Timer() {
  const [timeLeft, setTimeLeft] = useState(10); // 25 minutes = 1500 seconds
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work' or 'break'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const totalTime = phase === 'work' ? 10 : 300; // Work 25min, Break 5min
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  // 监听background script的消息
  useEffect(() => {
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === 'TIMER_COMPLETED') {
        // 计时器在后台完成
        setIsRunning(false);
        setTimeLeft(0);
        
        if (message.phase === 'work') {
          loadStats(); // 重新加载统计数据
        }
      }
    };

    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
      return () => chrome.runtime.onMessage.removeListener(messageListener);
    }
  }, []);

  // 主计时器逻辑
  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // 时间到了
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, phase]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
          if (response && !response.error) {
            setCompletedSessions(response.completedSessions || 0);
            setTotalFocusTime(response.totalFocusTime || 0);
          }
        });
      }
    } catch (error) {
      console.log('Could not load stats:', error);
    }
  };

  // 处理计时器完成
  const handleTimerComplete = () => {
    try {
      // 通知background script会话完成
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'SESSION_COMPLETED',
          phase: phase
        });
      }
      
      // 如果是工作会话完成，更新本地统计
      if (phase === 'work') {
        setCompletedSessions(prev => prev + 1);
        setTotalFocusTime(prev => prev + 25);
      }
      
      // 显示完成消息
      const message = phase === 'work' 
        ? '🎉 Work session completed! Time for a break.' 
        : '✨ Break time is over! Ready to focus?';
      
      // 如果不在扩展环境中，使用alert
      if (!chrome?.runtime?.sendMessage) {
        alert(message);
      }
      
    } catch (error) {
      console.log('Timer completion handling error:', error);
      alert(phase === 'work' ? '🎉 Work session completed!' : '✨ Break time is over!');
    }
  };

  const toggleTimer = () => {
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    try {
      if (chrome?.runtime?.sendMessage) {
        if (newRunningState) {
          // 启动计时器
          chrome.runtime.sendMessage({
            type: 'START_TIMER',
            duration: timeLeft,
            phase: phase
          }, (response) => {
            console.log('Start timer response:', response);
          });
        } else {
          // 停止计时器
          chrome.runtime.sendMessage({
            type: 'STOP_TIMER'
          }, (response) => {
            console.log('Stop timer response:', response);
          });
        }
      }
    } catch (error) {
      console.log('Chrome API not available, running in fallback mode');
    }
  };

  // 添加测试通知功能（开发时使用）
  const testNotification = () => {
    try {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'SESSION_COMPLETED',
          phase: 'work'
        });
      }
    } catch (error) {
      console.log('Chrome API not available');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(phase === 'work' ? 10 : 300);
    
    try {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
      }
    } catch (error) {
      console.log('Chrome API not available');
    }
  };

  const switchPhase = () => {
    const newPhase = phase === 'work' ? 'break' : 'work';
    setPhase(newPhase);
    setIsRunning(false);
    setTimeLeft(newPhase === 'work' ? 10 : 300);
    
    try {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
      }
    } catch (error) {
      console.log('Chrome API not available');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
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
            <span>Work</span>
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
            <span>Break</span>
          </button>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="relative flex justify-center py-6">
        {/* Background decoration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-40 h-40 rounded-full ${
            phase === 'work' 
              ? 'bg-gradient-to-br from-red-50 to-pink-50' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50'
          } shadow-inner`} />
        </div>
        
        <svg className="w-36 h-36 transform -rotate-90 relative z-10" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="46"
            stroke="rgba(156, 163, 175, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
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
          {/* Gradient definition */}
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
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-1">
          <div className="text-3xl font-mono font-bold text-gray-800">
            {formatTime(timeLeft)}
          </div>
          <div className={`text-xs font-medium px-3 py-1 rounded-full border ${
            phase === 'work' 
              ? 'text-red-700 bg-red-50 border-red-100' 
              : 'text-green-700 bg-green-50 border-green-100'
          }`}>
            {phase === 'work' ? 'Focusing' : 'Resting'}
          </div>
          {isRunning && (
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                phase === 'work' ? 'bg-red-400' : 'bg-green-400'
              }`} />
              <span className="text-xs text-gray-500 font-medium">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Control buttons */}
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
          <span>{isRunning ? 'Pause' : 'Start'}</span>
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

      {/* Statistics card - 显示实际数据 */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Today's Progress</span>
            <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
              {completedSessions}
            </span>
            <span className="text-xl">🍅</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Completed Sessions
            {totalFocusTime > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                Total: {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;