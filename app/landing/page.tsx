'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { User, LogOut } from 'lucide-react';

// 首页 Landing Page
export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center justify-between mb-16">
            <div className="text-2xl font-bold">AI分身市场</div>
            <div className="flex items-center gap-6">
              {user && (
                <Link 
                  href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'creator' ? '/creator/dashboard' : '/client/workspace'}
                  className="hover:text-blue-200"
                >
                  个人中心
                </Link>
              )}
              <Link href="/client/market" className="hover:text-blue-200">浏览市场</Link>
              <Link href="/creator/onboarding" className="hover:text-blue-200">成为创作者</Link>
              
              {user ? (
                // 已登录显示用户头像和菜单
                <div className="flex items-center gap-4">
                  <Link 
                    href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'creator' ? '/creator/dashboard' : '/client/market'}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                // 未登录显示登录/注册按钮
                <Link href="/auth/login">
                  <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
                    登录 / 注册
                  </button>
                </Link>
              )}
            </div>
          </nav>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              让专业经验 24/7 为您服务
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              汇聚各行业专家的AI分身，随时随地获取专业咨询与项目服务
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/client/market">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50">
                  浏览AI分身
                </button>
              </Link>
              <Link href="/creator/onboarding">
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10">
                  入驻成为创作者
                </button>
              </Link>
            </div>
          </div>
          
          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-200">专业AI分身</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-blue-200">覆盖行业</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-blue-200">服务订单</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-blue-200">满意度</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">为什么选择我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold mb-2">真实专家AI分身</h3>
              <p className="text-gray-600">
                每一位AI分身都由真实行业专家训练，拥有丰富的实战经验和专业知识
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-2">即时响应</h3>
              <p className="text-gray-600">
                7×24小时在线，秒级响应您的咨询需求，无需等待预约
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-semibold mb-2">权益保障</h3>
              <p className="text-gray-600">
                平台担保交易，不满意可申请退款，专业法律服务保护知识产权
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 适用场景 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">适用场景</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💼', title: '商业咨询', desc: '战略、运营、市场策略' },
              { icon: '💻', title: '技术开发', desc: '架构设计、代码审查、技术选型' },
              { icon: '🎨', title: '创意设计', desc: 'UI/UX、品牌、视觉设计' },
              { icon: '📊', title: '数据分析', desc: '数据建模、商业智能、可视化' },
            ].map((item, idx) => (
              <div key={idx} className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 入驻邀请 */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">有专业技能想要变现？</h2>
          <p className="text-xl text-blue-100 mb-8">
            将您的经验转化为AI分身，让更多人受益于您的专业知识，同时获得持续收入
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">1.</div>
              <p>提交入驻申请</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">2.</div>
              <p>训练您的AI分身</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">3.</div>
              <p>开始获得收入</p>
            </div>
          </div>
          <Link href="/creator/onboarding">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50">
              立即入驻
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">AI分身市场</h4>
              <p className="text-sm">让专业经验触手可及</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">需求方</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/client/market" className="hover:text-white">浏览市场</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">登录</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">创作者</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/creator/onboarding" className="hover:text-white">入驻申请</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">创作者登录</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">关于</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">关于我们</Link></li>
                <li><Link href="#" className="hover:text-white">服务条款</Link></li>
                <li><Link href="#" className="hover:text-white">隐私政策</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 AI分身市场. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
