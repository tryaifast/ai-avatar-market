'use client';

import Link from 'next/link';
import { ArrowLeft, Briefcase, User, Clock, DollarSign, MessageSquare, FileText, CheckCircle } from 'lucide-react';

export function TaskDetailClient({ task }: { task: any }) {
  if (!task) {
    return <div>任务不存在</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator/tasks" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">任务详情</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{task.avatarName}</h2>
                  <p className="text-sm text-gray-500">任务ID: {task.id}</p>
                </div>
              </div>
              <span className={`badge-${task.status === 'inProgress' ? 'blue' : task.status === 'completed' ? 'green' : 'yellow'}`}>
                {task.status === 'inProgress' ? '进行中' : task.status === 'completed' ? '已完成' : '待处理'}
              </span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">项目描述</h3>
              <p className="text-gray-600">{task.projectDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500 mb-1">雇佣方式</p>
                <p className="font-medium">{task.type === 'hourly' ? '按时雇佣' : '按次雇佣'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">创建时间</p>
                <p className="font-medium">{new Date(task.createdAt).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              交付物
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">需求分析文档.pdf</span>
                </div>
                <button className="text-blue-600 text-sm">下载</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">原型设计.fig</span>
                </div>
                <button className="text-blue-600 text-sm">下载</button>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              沟通记录
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{task.clientName}</p>
                  <p className="text-sm text-gray-600">你好，请帮我分析一下这个需求</p>
                  <p className="text-xs text-gray-400">10:00</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="text-right">
                  <p className="text-sm font-medium">我</p>
                  <p className="text-sm text-gray-600">好的，我已经开始分析了，稍后给您反馈</p>
                  <p className="text-xs text-gray-400">10:05</p>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              雇佣方信息
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div>
                <p className="font-medium">{task.clientName}</p>
                <p className="text-sm text-gray-500">需求方</p>
              </div>
            </div>
            <button className="w-full btn-secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              联系雇佣方
            </button>
          </div>

          {/* Payment Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              费用信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">项目金额</span>
                <span className="font-semibold">¥{task.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平台服务费(5%)</span>
                <span className="text-red-500">-¥{Math.round(task.amount * 0.05)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">实际收入</span>
                <span className="font-bold text-green-600">¥{Math.round(task.amount * 0.95)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              时间线
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">订单创建</p>
                  <p className="text-xs text-gray-500">{new Date(task.createdAt).toLocaleString('zh-CN')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">支付完成</p>
                  <p className="text-xs text-gray-500">{task.paidAt ? new Date(task.paidAt).toLocaleString('zh-CN') : '-'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">项目开始</p>
                  <p className="text-xs text-gray-500">{task.startedAt ? new Date(task.startedAt).toLocaleString('zh-CN') : '-'}</p>
                </div>
              </div>
              {task.completedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">项目完成</p>
                    <p className="text-xs text-gray-500">{new Date(task.completedAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            {task.status === 'pending' && (
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  接受任务
                </button>
                <button className="w-full btn-outline">
                  拒绝任务
                </button>
              </div>
            )}
            {task.status === 'inProgress' && (
              <button className="w-full btn-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                标记完成
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
