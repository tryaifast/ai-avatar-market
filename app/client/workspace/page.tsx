'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bot, User, Send, Paperclip, MoreVertical,
  CheckCircle, Clock, AlertCircle, FileText, Download
} from 'lucide-react';

// 模拟任务数据
const mockTask = {
  id: 'task_demo',
  title: 'React项目代码审查',
  avatar: {
    name: '代码审查助手·小明',
    avatar: '/avatars/1.png',
  },
  client: {
    name: '张三',
  },
  price: 1500,
  status: 'ai_working',
  workflow: {
    aiStage: {
      status: 'working',
      messages: [
        { role: 'client', content: '你好，我有一个React项目需要你帮忙审查一下。主要是想检查一下代码规范和潜在的性能问题。' },
        { role: 'ai', content: '你好！我是代码审查助手·小明，很高兴为你服务。\n\n我可以帮你审查以下内容：\n1. 代码规范和风格问题\n2. 潜在的性能瓶颈\n3. 安全漏洞\n4. 可维护性建议\n\n请把你的代码发给我，可以是GitHub链接、代码片段，或者打包的文件。' },
        { role: 'client', content: '好的，这是一个组件的代码：\n\n```jsx\nfunction UserList({ users }) {\n  const [filteredUsers, setFilteredUsers] = useState(users);\n  \n  useEffect(() => {\n    setFilteredUsers(users.filter(u => u.active));\n  }, []);\n  \n  return (\n    <div>\n      {filteredUsers.map(user => (\n        <UserCard key={user.id} user={user} />\n      ))}\n    </div>\n  );\n}\n```\n\n帮我看看有什么问题？' },
      ],
    },
  },
};

const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

export default function WorkspacePage() {
  const [messages, setMessages] = useState(mockTask.workflow.aiStage.messages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add client message
    setMessages([...messages, { role: 'client', content: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '我发现了几个问题：\n\n1. **useEffect依赖项缺失** - 第6行的useEffect依赖数组为空，但使用了`users` prop。这会导致当`users`变化时，过滤逻辑不会重新执行。\n\n2. **不必要的state** - 如果`filteredUsers`只是`users`的派生状态，可以直接用useMemo计算，不需要额外的state。\n\n3. **缺少key的唯一性检查** - 虽然你用了`user.id`作为key，但建议确保id确实是唯一的。\n\n需要我给出修改后的代码吗？',
      }]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/client/market" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{mockTask.avatar.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="badge-blue text-xs">AI工作中</span>
                    <span>·</span>
                    <span>{formatPrice(mockTask.price)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost p-2">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Workflow Status */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">AI处理中</div>
                  <div className="text-xs text-gray-500">已完成 80%</div>
                </div>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-blue-600 rounded-full" />
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">真人审核</div>
                  <div className="text-xs text-gray-400">等待中</div>
                </div>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">最终交付</div>
                  <div className="text-xs text-gray-400">等待中</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Task Info Card */}
          <div className="card p-4 mb-6 bg-blue-50 border-blue-100">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">任务：{mockTask.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  AI分身正在处理你的请求。完成后会推送给真人审核，确保质量。
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 ${msg.role === 'client' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'client'
                      ? 'bg-blue-100'
                      : 'bg-gradient-to-br from-blue-400 to-purple-500'
                  }`}
                >
                  {msg.role === 'client' ? (
                    <User className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === 'client'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入消息..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI分身由真人训练，所有输出需经真人审核后交付
          </p>
        </div>
      </div>
    </div>
  );
}
