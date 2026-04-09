'use client';

import { useState } from 'react';
import Link from 'next/link';

// 项目工作区 - 客户端组件
export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'files' | 'timeline'>('overview');
  
  // Mock 项目数据
  const project = {
    id: 'proj-001',
    name: 'AI 产品策略咨询',
    status: '进行中',
    progress: 65,
    startDate: '2026-04-01',
    deadline: '2026-04-15',
    client: {
      name: '李华',
      company: '某科技公司',
    },
    avatar: {
      name: '张明',
      title: '资深产品经理',
    },
    budget: 5000,
    paid: 3000,
  };
  
  // Mock 交付物
  const deliverables = [
    { id: 1, name: '需求分析报告.pdf', status: '已完成', date: '2026-04-03' },
    { id: 2, name: '竞品分析.xlsx', status: '已完成', date: '2026-04-05' },
    { id: 3, name: '产品规划文档.docx', status: '进行中', date: '-' },
  ];
  
  // Mock 时间线
  const timeline = [
    { id: 1, date: '2026-04-01', event: '项目启动', type: 'milestone' },
    { id: 2, date: '2026-04-03', event: '完成需求分析', type: 'deliverable' },
    { id: 3, date: '2026-04-05', event: '完成竞品分析', type: 'deliverable' },
    { id: 4, date: '2026-04-08', event: '中期评审会议', type: 'meeting' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/client/market" className="text-gray-500 hover:text-gray-700">
                ← 返回市场
              </Link>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                截止: {project.deadline}
              </span>
              <Link href={`/client/chat?project=${project.id}`}>
                <button className="btn btn-secondary btn-sm">
                  💬 沟通
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab 导航 */}
        <div className="tabs mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          >
            项目概览
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab ${activeTab === 'chat' ? 'tab-active' : ''}`}
          >
            AI对话
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`tab ${activeTab === 'files' ? 'tab-active' : ''}`}
          >
            交付物
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
          >
            时间线
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 项目进度 */}
            <div className="card">
              <h3 className="font-semibold mb-4">项目进度</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      进度
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{ width: `${project.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">开始日期</p>
                  <p className="font-medium">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">截止日期</p>
                  <p className="font-medium">{project.deadline}</p>
                </div>
              </div>
            </div>
            
            {/* 参与方 */}
            <div className="card">
              <h3 className="font-semibold mb-4">参与方</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="avatar">🧑</div>
                  <div>
                    <p className="font-medium">{project.client.name}</p>
                    <p className="text-sm text-gray-500">需求方 · {project.client.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="avatar">👨‍💼</div>
                  <div>
                    <p className="font-medium">{project.avatar.name}</p>
                    <p className="text-sm text-gray-500">AI分身 · {project.avatar.title}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 支付状态 */}
            <div className="card">
              <h3 className="font-semibold mb-4">支付状态</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">项目预算</span>
                  <span className="font-medium">¥{project.budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">已支付</span>
                  <span className="font-medium text-green-600">¥{project.paid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">待支付</span>
                  <span className="font-medium text-orange-600">¥{project.budget - project.paid}</span>
                </div>
                <div className="pt-3 border-t">
                  <button className="btn btn-primary w-full btn-sm">
                    支付尾款
                  </button>
                </div>
              </div>
            </div>
            
            {/* 最新交付物 */}
            <div className="card lg:col-span-3">
              <h3 className="font-semibold mb-4">最新交付物</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>文件名</th>
                      <th>状态</th>
                      <th>日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliverables.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === '已完成' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.date}</td>
                        <td>
                          <button className="text-blue-600 hover:underline text-sm">
                            下载
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="card" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-lg">
                    👨‍💼
                  </div>
                  <div>
                    <h3 className="font-semibold">与 {project.avatar.name} AI分身对话</h3>
                    <span className="text-xs text-gray-500">项目: {project.name}</span>
                  </div>
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 在线
                </span>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                    👨‍💼
                  </div>
                  <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">您好！我是张明AI分身。我已了解您的项目需求，请问有什么我可以帮助您的？</p>
                    <span className="text-xs text-gray-400 mt-1 block">10:30</span>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%] shadow-sm">
                    <p className="text-sm">我想了解一下竞品分析的思路</p>
                    <span className="text-xs text-blue-200 mt-1 block">10:32</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                    👨‍💼
                  </div>
                  <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">好的，竞品分析一般包括以下几个步骤：</p>
                    <ol className="text-sm text-gray-700 mt-2 space-y-1 list-decimal list-inside">
                      <li>确定竞品范围（直接/间接/潜在）</li>
                      <li>收集竞品信息（功能、定价、用户评价）</li>
                      <li>分析优劣势（SWOT分析）</li>
                      <li>总结差异化机会</li>
                    </ol>
                    <p className="text-sm text-gray-800 mt-2">您希望我针对哪个方面详细展开？</p>
                    <span className="text-xs text-gray-400 mt-1 block">10:33</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full p-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="输入消息，按Enter发送..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          // 发送消息逻辑
                        }
                      }}
                    />
                    <button className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    className="btn btn-primary px-6 py-3 h-fit"
                    onClick={() => {
                      alert('消息已发送！');
                    }}
                  >
                    发送
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">AI分身会尽快回复您的消息</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="card">
            <h3 className="font-semibold mb-4">交付物管理</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>文件名</th>
                    <th>类型</th>
                    <th>大小</th>
                    <th>状态</th>
                    <th>日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((item) => (
                    <tr key={item.id}>
                      <td className="flex items-center gap-2">
                        <span>📄</span>
                        {item.name}
                      </td>
                      <td>PDF/Excel/Word</td>
                      <td>2.5 MB</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === '已完成' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <button className="text-blue-600 hover:underline text-sm mr-3">
                          下载
                        </button>
                        <button className="text-gray-600 hover:underline text-sm">
                          预览
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="card">
            <h3 className="font-semibold mb-6">项目时间线</h3>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      item.type === 'milestone' ? 'bg-purple-100 text-purple-600' :
                      item.type === 'deliverable' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.type === 'milestone' ? '🏁' :
                       item.type === 'deliverable' ? '📄' : '🤝'}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium">{item.event}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
