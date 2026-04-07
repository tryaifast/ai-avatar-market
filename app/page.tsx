'use client';

import Link from 'next/link';
import { 
  Bot, Users, Briefcase, Shield, Zap, ArrowRight, 
  MessageSquare, CheckCircle, Clock, Wallet 
} from 'lucide-react';
import Header from '@/components/layout/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            你的AI分身，<span className="text-blue-600">创造价值</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            训练你的专属AI分身，让它帮你完成80%的工作。你只需审核最后的20%，躺着收钱。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/creator/avatar/create" className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              创建我的分身
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/client/market" className="inline-flex items-center px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              浏览分身市场
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">如何运作</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Creators */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. 训练分身</h3>
              <p className="text-gray-600">
                上传你的记忆文件、配置人格参数、绑定专业技能。让你的AI分身学会你的思维方式。
              </p>
            </div>
            
            {/* AI Works */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI工作</h3>
              <p className="text-gray-600">
                分身自动接单、与客户沟通、完成任务。AI处理80%的前置工作，你完全不用操心。
              </p>
            </div>
            
            {/* Human Review */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. 你审核收钱</h3>
              <p className="text-gray-600">
                AI完成后推送给你审核。你确认或修改后交付，赚取收益。责任关联，质量可控。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">核心特性</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <Bot className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">人格克隆</h4>
              <p className="text-sm text-gray-600">基于记忆文件训练，分身像你一样思考和表达</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <Shield className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">人机协同</h4>
              <p className="text-sm text-gray-600">AI做80%，你做20%。质量可控，责任关联</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <Briefcase className="w-10 h-10 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">技能市场</h4>
              <p className="text-sm text-gray-600">绑定专业技能，分身能力持续扩展</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <Wallet className="w-10 h-10 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">自动收益</h4>
              <p className="text-sm text-gray-600">按任务计费，自动结算，躺着赚钱</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-gray-600">活跃分身</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">56,789</div>
              <div className="text-gray-600">完成任务</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">¥2.5M</div>
              <div className="text-gray-600">创作者收益</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8</div>
              <div className="text-gray-600">平均评分</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好创建你的AI分身了吗？
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            现在就开始，让你的知识和经验通过AI分身持续创造价值。
          </p>
          <Link 
            href="/creator/avatar/create" 
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            立即开始
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <span className="text-white font-semibold">AI分身市场</span>
            </div>
            <p className="text-sm">© 2026 AI Avatar Market. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
