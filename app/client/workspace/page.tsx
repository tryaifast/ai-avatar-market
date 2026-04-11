'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTaskStore, useAuthStore } from '@/lib/store';

// 项目工作区 - 客户端组件
export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'files' | 'timeline'>('overview');
  const { tasks, currentTask, fetchTasks, fetchTaskById, isLoading: taskLoading } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id, 'client');
    }
  }, [user?.id, fetchTasks]);

  // 使用第一个任务作为当前展示项目（如果有URL参数可改为具体任务）
  const project = currentTask || tasks[0];

  if (taskLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载项目数据...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">暂无进行中的项目</p>
          <Link href="/client/market" className="btn btn-primary">
            去市场雇佣AI分身
          </Link>
        </div>
      </div>
    );
  }

  const taskData = project as any;
  const deliverables = taskData.workflow?.aiStage?.deliverables || [];
  const messages = taskData.workflow?.aiStage?.messages || [];

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
              <h1 className="text-lg font-semibold">{taskData.title || '项目工作区'}</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {taskData.status === 'ai_working' ? 'AI工作中' :
                 taskData.status === 'ai_completed' ? '待审核' :
                 taskData.status === 'delivered' ? '已交付' :
                 taskData.status === 'completed' ? '已完成' :
                 taskData.status || '进行中'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {taskData.timeline?.createdAt ? `创建: ${new Date(taskData.timeline.createdAt).toLocaleDateString()}` : ''}
              </span>
              <Link href={`/client/chat?project=${taskData.id}`}>
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
                      {taskData.status === 'completed' ? '100' : taskData.status === 'delivered' ? '80' : taskData.status === 'ai_working' ? '40' : '20'}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{ width: `${taskData.status === 'completed' ? 100 : taskData.status === 'delivered' ? 80 : taskData.status === 'ai_working' ? 40 : 20}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">创建日期</p>
                  <p className="font-medium">{taskData.timeline?.createdAt ? new Date(taskData.timeline.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">任务类型</p>
                  <p className="font-medium">{taskData.type || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* 项目信息 */}
            <div className="card">
              <h3 className="font-semibold mb-4">项目信息</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">描述</p>
                  <p className="font-medium text-sm">{taskData.description || '暂无描述'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">定价方式</p>
                  <p className="font-medium">{taskData.pricingType === 'fixed' ? '固定价格' : '估价'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">价格</p>
                  <p className="font-medium">¥{(taskData.price || 0) / 100}</p>
                </div>
              </div>
            </div>
            
            {/* 支付状态 */}
            <div className="card">
              <h3 className="font-semibold mb-4">支付状态</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">任务价格</span>
                  <span className="font-medium">¥{(taskData.price || 0) / 100}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">支付状态</span>
                  <span className={`font-medium ${
                    taskData.payment?.status === 'released' ? 'text-green-600' :
                    taskData.payment?.status === 'held' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {taskData.payment?.status === 'released' ? '已释放' :
                     taskData.payment?.status === 'held' ? '托管中' :
                     taskData.payment?.status === 'refunded' ? '已退款' : '待支付'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">平台服务费</span>
                  <span className="font-medium">¥{(taskData.payment?.platformFee || 0) / 100}</span>
                </div>
              </div>
            </div>
            
            {/* 交付物 */}
            <div className="card lg:col-span-3">
              <h3 className="font-semibold mb-4">交付物</h3>
              {deliverables.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>创建者</th>
                        <th>日期</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((item: any) => (
                        <tr key={item.id}>
                          <td>{item.description || item.content?.substring(0, 30) || '-'}</td>
                          <td>{item.type}</td>
                          <td>{item.createdBy === 'ai' ? 'AI' : '真人'}</td>
                          <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                          <td>
                            <button className="text-blue-600 hover:underline text-sm">
                              查看
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无交付物</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="card" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-semibold">AI分身对话</h3>
                    <span className="text-xs text-gray-500">项目: {taskData.title}</span>
                  </div>
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 在线
                </span>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg: any) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'client' ? 'justify-end' : ''}`}>
                      {msg.role !== 'client' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                          {msg.role === 'ai' ? '🤖' : '👤'}
                        </div>
                      )}
                      <div className={`${msg.role === 'client' ? 'bg-blue-600 text-white' : 'bg-white'} rounded-lg p-3 max-w-[80%] shadow-sm`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-xs mt-1 block ${msg.role === 'client' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">暂无对话记录</p>
                  </div>
                )}
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
                        }
                      }}
                    />
                  </div>
                  <button className="btn btn-primary px-6 py-3 h-fit">
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
            {deliverables.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>名称</th>
                      <th>类型</th>
                      <th>创建者</th>
                      <th>日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliverables.map((item: any) => (
                      <tr key={item.id}>
                        <td className="flex items-center gap-2">
                          <span>📄</span>
                          {item.description || item.content?.substring(0, 30) || '-'}
                        </td>
                        <td>{item.type}</td>
                        <td>{item.createdBy === 'ai' ? 'AI' : '真人'}</td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
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
            ) : (
              <p className="text-gray-500 text-center py-8">暂无交付物</p>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="card">
            <h3 className="font-semibold mb-6">项目时间线</h3>
            <div className="space-y-6">
              {[
                { event: '项目创建', date: taskData.timeline?.createdAt, type: 'milestone', icon: '🏁' },
                { event: 'AI处理完成', date: taskData.timeline?.aiCompletedAt, type: 'deliverable', icon: '📄' },
                { event: '真人审核', date: taskData.timeline?.humanReviewAt, type: 'meeting', icon: '🤝' },
                { event: '已交付', date: taskData.timeline?.deliveredAt, type: 'deliverable', icon: '📄' },
                { event: '项目完成', date: taskData.timeline?.completedAt, type: 'milestone', icon: '🏁' },
              ]
                .filter(item => item.date)
                .map((item, index, arr) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        item.type === 'milestone' ? 'bg-purple-100 text-purple-600' :
                        item.type === 'deliverable' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {item.icon}
                      </div>
                      {index < arr.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">{item.event}</p>
                      <p className="text-sm text-gray-500">{new Date(item.date!).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              }
            </div>
            {!taskData.timeline?.createdAt && (
              <p className="text-gray-500 text-center py-8">暂无时间线记录</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
