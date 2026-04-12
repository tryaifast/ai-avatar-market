// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, authFetch } from '@/lib/store';
import { 
  ArrowLeft, User, Briefcase, Tag, FileText, 
  Upload, CheckCircle, Plus, X, ChevronRight, Bot
} from 'lucide-react';

const steps = [
  { id: 1, title: '基本信息', icon: User },
  { id: 2, title: '工作经历', icon: Briefcase },
  { id: 3, title: '技能标签', icon: Tag },
  { id: 4, title: '材料上传', icon: FileText },
];

const skillOptions = [
  '产品经理', '项目管理', '数据分析', '用户研究',
  '前端开发', '后端开发', '全栈开发', '移动端开发',
  'UI设计', 'UX设计', '视觉设计', '品牌设计',
  '内容运营', '社群运营', '品牌营销', 'SEO/SEM',
  '法律咨询', '合同审查', '知识产权', '劳动法',
  '财务顾问', '税务筹划', '审计', '投资理财',
  '人力资源', '招聘', '培训', '组织发展',
];

export default function OnboardingApplyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: '',
    company: '',
    experience: '',
    bio: '',
    experiences: [{ company: '', position: '', duration: '', description: '' }],
    skills: [] as string[],
    newSkill: '',
    resume: null as File | null,
    portfolio: null as File | null,
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addCustomSkill = () => {
    if (formData.newSkill && !formData.skills.includes(formData.newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, formData.newSkill],
        newSkill: ''
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/creator-applications', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          realName: formData.name,
          phone: formData.phone,
          email: user?.email || '',
          profession: formData.profession,
          experienceYears: formData.experience ? parseInt(formData.experience) : undefined,
          bio: formData.bio,
          skills: formData.skills,
          portfolioUrls: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/creator/onboarding/status');
      } else {
        setError(data.error || '提交失败，请重试');
      }
    } catch (err: any) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.phone && formData.profession && formData.bio;
      case 2:
        return formData.experiences.every(e => e.company && e.position);
      case 3:
        return formData.skills.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-px h-5 bg-gray-300" />
              <Link href="/creator/onboarding" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 ml-4">申请入驻</h1>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep > step.id ? 'bg-green-500 text-white' :
                    currentStep === step.id ? 'bg-blue-600 text-white' :
                    'bg-gray-200'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6 sm:p-8">
          {/* Step 1: 基本信息 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">基本信息</h2>
              
              <div className="form-group">
                <label className="form-label">真实姓名 *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="请输入真实姓名"
                />
              </div>

              <div className="form-group">
                <label className="form-label">手机号码 *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder="请输入手机号码"
                />
              </div>

              <div className="form-group">
                <label className="form-label">职业 *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.profession}
                  onChange={(e) => updateForm('profession', e.target.value)}
                  placeholder="如：产品经理、前端工程师"
                />
              </div>

              <div className="form-group">
                <label className="form-label">所在公司/机构</label>
                <input
                  type="text"
                  className="input"
                  value={formData.company}
                  onChange={(e) => updateForm('company', e.target.value)}
                  placeholder="请输入公司名称"
                />
              </div>

              <div className="form-group">
                <label className="form-label">工作年限</label>
                <select
                  className="select"
                  value={formData.experience}
                  onChange={(e) => updateForm('experience', e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="1-3年">1-3年</option>
                  <option value="3-5年">3-5年</option>
                  <option value="5-10年">5-10年</option>
                  <option value="10年以上">10年以上</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">个人简介 *</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="介绍你的专业背景、擅长领域、服务特色..."
                />
                <p className="form-hint">建议100-300字，突出你的专业优势</p>
              </div>
            </div>
          )}

          {/* Step 2: 工作经历 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">工作经历</h2>
                <button
                  onClick={addExperience}
                  className="btn-secondary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加经历
                </button>
              </div>

              {formData.experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">经历 {index + 1}</span>
                    {formData.experiences.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="form-label">公司/机构 *</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="公司名称"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">职位 *</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        placeholder="职位名称"
                      />
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">时间段</label>
                    <input
                      type="text"
                      className="input"
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      placeholder="如：2020.03 - 2023.06"
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">工作内容</label>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="描述你的主要职责和成就"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: 技能标签 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">技能标签</h2>
              <p className="text-gray-600">选择你擅长的技能领域（可多选）</p>

              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <input
                  type="text"
                  className="input flex-1"
                  value={formData.newSkill}
                  onChange={(e) => updateForm('newSkill', e.target.value)}
                  placeholder="添加自定义技能"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                />
                <button
                  onClick={addCustomSkill}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm text-gray-500 mb-2">已选择：</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => toggleSkill(skill)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: 材料上传 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">材料上传</h2>
              <p className="text-gray-600">上传相关证明材料，有助于提高审核通过率</p>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">上传简历</p>
                  <p className="text-xs text-gray-500 mb-3">支持 PDF、Word 格式，最大 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="resume"
                    onChange={(e) => updateForm('resume', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="resume" className="btn-secondary btn-sm cursor-pointer">
                    选择文件
                  </label>
                  {formData.resume && (
                    <p className="text-sm text-green-600 mt-2">
                      已选择: {formData.resume.name}
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">上传作品集（可选）</p>
                  <p className="text-xs text-gray-500 mb-3">展示你的优秀作品或案例</p>
                  <input
                    type="file"
                    accept=".pdf,.zip"
                    className="hidden"
                    id="portfolio"
                    onChange={(e) => updateForm('portfolio', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="portfolio" className="btn-secondary btn-sm cursor-pointer">
                    选择文件
                  </label>
                  {formData.portfolio && (
                    <p className="text-sm text-green-600 mt-2">
                      已选择: {formData.portfolio.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong> 审核通常需要 1-3 个工作日，请确保填写的信息真实有效。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className="btn-secondary"
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            上一步
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="btn-primary"
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Bot className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  提交申请
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
