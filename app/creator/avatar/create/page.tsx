'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bot, User, Upload, Plus, X, ChevronRight,
  MessageCircle, FileText, Code, Palette, BarChart, MoreHorizontal,
  CheckCircle
} from 'lucide-react';
import { identityTags, communicationStyles, taskTypes } from '@/lib/utils';

const steps = [
  { id: 'basic', label: '基本信息', description: '名称、头像、简介' },
  { id: 'personality', label: '人格配置', description: '性格、沟通风格、专业领域' },
  { id: 'memory', label: '记忆文件', description: '上传记忆文件训练分身' },
  { id: 'pricing', label: '定价设置', description: '设置价格和接单范围' },
];

export default function CreateAvatarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: {
      mbti: '',
      communicationStyle: 'professional',
      proactivity: 5,
      expertise: [] as string[],
    },
    memoryFiles: {
      soul: null as File | null,
      memory: null as File | null,
      history: [] as File[],
    },
    pricing: {
      type: 'per_task' as 'per_task' | 'subscription',
      perTask: { min: 500, max: 2000 },
      subscription: { monthly: 29900, yearly: 299000 },
    },
    scope: {
      canDo: [] as string[],
      cannotDo: [] as string[],
      responseTime: '24小时内',
    },
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [newCanDo, setNewCanDo] = useState('');
  const [newCannotDo, setNewCannotDo] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
    // 3秒后跳转到我的分身页面
    setTimeout(() => {
      router.push('/creator/avatars');
    }, 3000);
  };

  const addExpertise = () => {
    if (newExpertise && !formData.personality.expertise.includes(newExpertise)) {
      setFormData({
        ...formData,
        personality: {
          ...formData.personality,
          expertise: [...formData.personality.expertise, newExpertise],
        },
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (exp: string) => {
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        expertise: formData.personality.expertise.filter(e => e !== exp),
      },
    });
  };

  const addCanDo = () => {
    if (newCanDo && !formData.scope.canDo.includes(newCanDo)) {
      setFormData({
        ...formData,
        scope: {
          ...formData.scope,
          canDo: [...formData.scope.canDo, newCanDo],
        },
      });
      setNewCanDo('');
    }
  };

  const addCannotDo = () => {
    if (newCannotDo && !formData.scope.cannotDo.includes(newCannotDo)) {
      setFormData({
        ...formData,
        scope: {
          ...formData.scope,
          cannotDo: [...formData.scope.cannotDo, newCannotDo],
        },
      });
      setNewCannotDo('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-px h-5 bg-gray-300" />
              <Link href="/creator/dashboard" className="text-gray-500 hover:text-gray-700">
                <span className="text-sm">创作者中心</span>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">创建AI分身</h1>
            </div>
            <div className="text-sm text-gray-500">
              步骤 {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.label}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="card p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分身名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="给你的AI分身起个名字，如：代码审查助手·小明"
                  className="input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  建议格式：职能 + 名字，让用户一眼知道你的分身能做什么
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  头像
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="btn-secondary text-sm cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    上传头像
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="介绍你的AI分身能做什么，擅长什么领域..."
                  rows={4}
                  className="textarea"
                />
                <p className="text-sm text-gray-500 mt-1">
                  清晰准确的简介能提高被雇佣的概率
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personality */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  沟通风格
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {communicationStyles.map((style) => (
                    <label
                      key={style.value}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.personality.communicationStyle === style.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="communicationStyle"
                        value={style.value}
                        checked={formData.personality.communicationStyle === style.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personality: {
                              ...formData.personality,
                              communicationStyle: e.target.value as any,
                            },
                          })
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{style.label}</div>
                        <div className="text-sm text-gray-500">{style.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主动性 (1-10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formData.personality.proactivity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personality: {
                        ...formData.personality,
                        proactivity: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>被动响应</span>
                  <span className="font-medium text-blue-600">{formData.personality.proactivity}</span>
                  <span>主动建议</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  专业领域 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="输入专业领域，如：React、产品设计..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                  <button onClick={addExpertise} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personality.expertise.map((exp) => (
                    <span key={exp} className="badge-blue">
                      {exp}
                      <button
                        onClick={() => removeExpertise(exp)}
                        className="ml-1 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Memory Files */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">关于记忆文件</h4>
                <p className="text-sm text-blue-700">
                  上传你的记忆文件（如SOUL.md、MEMORY.md等），让AI分身学习你的思维方式、价值观和工作习惯。
                  文件内容越丰富，分身越像你。
                </p>
              </div>

              {/* 引导按钮 */}
              <div className="flex justify-end">
                <Link 
                  href="/creator/training-guide" 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  我没有现成资料？查看训练方案
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SOUL.md（人格定义）
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('soul-upload')?.click()}
                >
                  <input
                    type="file"
                    accept=".md,.txt"
                    className="hidden"
                    id="soul-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          memoryFiles: { ...formData.memoryFiles, soul: file }
                        });
                      }
                    }}
                  />
                  {formData.memoryFiles.soul ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>{formData.memoryFiles.soul.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            memoryFiles: { ...formData.memoryFiles, soul: null }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">点击或拖拽上传 SOUL.md</p>
                      <p className="text-xs text-gray-400">定义你的价值观、沟通风格、行为准则</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MEMORY.md（长期记忆）
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('memory-upload')?.click()}
                >
                  <input
                    type="file"
                    accept=".md,.txt"
                    className="hidden"
                    id="memory-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          memoryFiles: { ...formData.memoryFiles, memory: file }
                        });
                      }
                    }}
                  />
                  {formData.memoryFiles.memory ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>{formData.memoryFiles.memory.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            memoryFiles: { ...formData.memoryFiles, memory: null }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">点击或拖拽上传 MEMORY.md</p>
                      <p className="text-xs text-gray-400">记录你的知识、经验、偏好</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  历史对话记录（可选）
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('history-upload')?.click()}
                >
                  <input
                    type="file"
                    accept=".md,.txt,.json"
                    multiple
                    className="hidden"
                    id="history-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setFormData({
                          ...formData,
                          memoryFiles: { 
                            ...formData.memoryFiles, 
                            history: [...formData.memoryFiles.history, ...files]
                          }
                        });
                      }
                    }}
                  />
                  {formData.memoryFiles.history.length > 0 ? (
                    <div className="space-y-2">
                      {formData.memoryFiles.history.map((file, index) => (
                        <div key={index} className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                memoryFiles: { 
                                  ...formData.memoryFiles, 
                                  history: formData.memoryFiles.history.filter((_, i) => i !== index)
                                }
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">上传历史对话导出文件</p>
                      <p className="text-xs text-gray-400">帮助分身学习你的对话风格和思维方式</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  定价方式
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.pricing.type === 'per_task'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricingType"
                      value="per_task"
                      checked={formData.pricing.type === 'per_task'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, type: 'per_task' },
                        })
                      }
                    />
                    <div>
                      <div className="font-medium text-gray-900">按任务计费</div>
                      <div className="text-sm text-gray-500">每个任务单独定价</div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.pricing.type === 'subscription'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricingType"
                      value="subscription"
                      checked={formData.pricing.type === 'subscription'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, type: 'subscription' },
                        })
                      }
                    />
                    <div>
                      <div className="font-medium text-gray-900">订阅制</div>
                      <div className="text-sm text-gray-500">按月/年订阅</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.pricing.type === 'per_task' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最低价格 (¥)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.perTask.min / 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            perTask: {
                              ...formData.pricing.perTask,
                              min: parseInt(e.target.value) * 100,
                            },
                          },
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最高价格 (¥)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.perTask.max / 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            perTask: {
                              ...formData.pricing.perTask,
                              max: parseInt(e.target.value) * 100,
                            },
                          },
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      月订阅价格 (¥)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.subscription.monthly / 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            subscription: {
                              ...formData.pricing.subscription,
                              monthly: parseInt(e.target.value) * 100,
                            },
                          },
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      年订阅价格 (¥)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.subscription.yearly / 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            subscription: {
                              ...formData.pricing.subscription,
                              yearly: parseInt(e.target.value) * 100,
                            },
                          },
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  能做什么
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCanDo}
                    onChange={(e) => setNewCanDo(e.target.value)}
                    placeholder="如：代码审查、需求分析..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCanDo())}
                  />
                  <button onClick={addCanDo} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.scope.canDo.map((item) => (
                    <span key={item} className="badge-green">
                      {item}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            scope: {
                              ...formData.scope,
                              canDo: formData.scope.canDo.filter((i) => i !== item),
                            },
                          })
                        }
                        className="ml-1 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  不能做什么
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCannotDo}
                    onChange={(e) => setNewCannotDo(e.target.value)}
                    placeholder="如：需要签字的法律文件、医疗诊断..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCannotDo())}
                  />
                  <button onClick={addCannotDo} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.scope.cannotDo.map((item) => (
                    <span key={item} className="badge-red">
                      {item}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            scope: {
                              ...formData.scope,
                              cannotDo: formData.scope.cannotDo.filter((i) => i !== item),
                            },
                          })
                        }
                        className="ml-1 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  响应时间承诺
                </label>
                <select
                  value={formData.scope.responseTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scope: { ...formData.scope, responseTime: e.target.value },
                    })
                  }
                  className="select"
                >
                  <option>2小时内</option>
                  <option>6小时内</option>
                  <option>12小时内</option>
                  <option>24小时内</option>
                  <option>48小时内</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                下一步
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? '创建中...' : '创建分身'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              分身创建成功！
            </h3>
            <p className="text-gray-600 mb-6">
              你的AI分身 "{formData.name}" 已创建成功，正在跳转到我的分身页面...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              正在跳转
            </div>
          </div>
        </div>
      )}
    </div>
  );
}