'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, MessageSquare, BookOpen, Lightbulb, ChevronRight, CheckCircle, Clock } from 'lucide-react';

const trainingSteps = [
  {
    title: '创建 SOUL.md（人格定义）',
    duration: '30-60分钟',
    description: '定义你的AI分身的核心价值观、沟通风格和行为准则',
    template: `# SOUL.md - 人格定义文件

## 核心价值观
- 你最看重的价值观是什么？
- 你在工作中遵循什么原则？

## 沟通风格
- 你喜欢正式还是轻松的沟通方式？
- 你习惯详细解释还是简明扼要？

## 行为准则
- 面对不同意见时你通常如何处理？
- 你如何处理压力和冲突？

## 专业领域
- 你擅长的领域有哪些？
- 你的独特优势是什么？
`,
    tips: [
      '参考已有的人格定义模板',
      '描述具体场景而非抽象概念',
      '包含你处理问题的思维方式',
    ]
  },
  {
    title: '创建 MEMORY.md（长期记忆）',
    duration: '1-2小时',
    description: '记录你的专业知识、工作经验和个人偏好',
    template: `# MEMORY.md - 长期记忆文件

## 专业知识库
- 你掌握的核心技能和方法论
- 你常用的工具和技术栈
- 你的行业洞察和最佳实践

## 工作经验
- 代表性项目和成果
- 遇到的问题和解决方案
- 积累的行业资源和人脉

## 个人偏好
- 你喜欢的工作方式
- 你认为重要的细节
- 你避免的事情
`,
    tips: [
      '整理过去的工作笔记',
      '提取你的知识框架',
      '包含具体的案例和例子',
    ]
  },
  {
    title: '导出对话记录（可选）',
    duration: '20-30分钟',
    description: '从你的AI助手导出历史对话，帮助分身学习你的对话风格',
    sources: [
      { name: 'ChatGPT', method: '设置 → 数据控制 → 导出数据' },
      { name: 'Claude', method: '侧边栏 → 设置 → 导出对话' },
      { name: '其他AI工具', method: '查找导出或分享功能' },
    ],
    tips: [
      '选择能体现你思考方式的对话',
      '包含问题定义和解决过程',
      '不需要包含敏感信息',
    ]
  },
];

const faqs = [
  {
    question: '没有现成的资料怎么办？',
    answer: '你可以从零开始创建！参考我们提供的模板，按照引导一步步完成。即使没有历史对话记录，只创建 SOUL.md 和 MEMORY.md 也能训练出不错的分身。'
  },
  {
    question: '资料需要多详细？',
    answer: '越详细越好，但至少要有基本的价值观和专业领域描述。建议 SOUL.md 不少于500字，MEMORY.md 不少于1000字。'
  },
  {
    question: '可以用中文写吗？',
    answer: '当然可以！我们支持中英文，建议用你最习惯的表达方式写，这样分身会更像你。'
  },
  {
    question: '需要多久才能看到效果？',
    answer: '上传资料后，系统需要30分钟左右处理。之后你可以通过对话测试，不满意可以继续上传更多资料迭代优化。'
  },
];

export default function TrainingGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-px h-5 bg-gray-300" />
              <Link href="/creator/avatar/create" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 ml-4">AI分身训练指南</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            从零开始创建你的AI分身
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            即使没有现成的资料，你也可以通过以下步骤创建一个独特的AI分身。
            按照我们的引导，大约需要2-3小时完成全部准备工作。
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          {trainingSteps.map((step, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>

                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      参考模板
                    </div>
                    <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                      {step.template}
                    </pre>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">小贴士：</p>
                    <ul className="space-y-1">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sources for step 3 */}
                  {step.sources && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">导出方法：</p>
                      <div className="space-y-2">
                        {step.sources.map((source, sourceIndex) => (
                          <div key={sourceIndex} className="text-sm">
                            <span className="font-medium text-gray-800">{source.name}:</span>
                            <span className="text-gray-600 ml-1">{source.method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">准备好开始了吗？</h3>
              <p className="text-blue-100">创建好资料后，回到分身创建页面上传即可</p>
            </div>
            <Link
              href="/creator/avatar/create"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              返回创建页面
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            常见问题
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-4">
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            更多资源
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="#" className="p-4 border rounded-lg hover:border-blue-400 transition-colors">
              <p className="font-medium text-gray-900 mb-1">优秀案例分享</p>
              <p className="text-sm text-gray-500">查看其他创作者的分身配置</p>
            </a>
            <a href="#" className="p-4 border rounded-lg hover:border-blue-400 transition-colors">
              <p className="font-medium text-gray-900 mb-1">训练技巧指南</p>
              <p className="text-sm text-gray-500">如何让分身更像你</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
