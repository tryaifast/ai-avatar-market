# AI分身市场 - 全端口开发实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 完成5大端口的全部页面开发，实现完整的AI分身市场平台
**Architecture:** Next.js静态导出，Mock数据驱动，后续可无缝接入后端API
**Tech Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui + Recharts

---

## 实施策略

按模块分阶段开发，每个模块包含完整的前端页面、Mock数据、路由配置。先完成骨架，再填充细节。

---

## Phase 1: 基础设施 + 核心框架

### Task 1.1: 安装依赖
**File Path:** 命令行
**Action:**
```bash
cd D:\ai-avatar-market
npm install recharts zustand @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```
**验证:** package.json中新增依赖

### Task 1.2: 创建全局状态管理
**File Path:** `lib/store/index.ts`
**Code:**
```typescript
import { create } from 'zustand';

interface AppState {
  user: any | null;
  setUser: (user: any) => void;
  isAuthenticated: boolean;
  login: (user: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Task 1.3: 创建Mock数据服务
**File Path:** `lib/mock/data.ts`
**Code:**
```typescript
export const mockAvatars = [...]
export const mockUsers = [...]
export const mockOrders = [...]
export const mockApplications = [...]
export const mockTransactions = [...]
export const mockMessages = [...]
```

### Task 1.4: 更新全局样式
**File Path:** `app/globals.css`
**Action:** 添加更多通用组件样式（卡片、按钮变体、表格等）

---

## Phase 2: 供给端完善 (Creator)

### Task 2.1: 创建入驻引导页面
**File Path:** `app/creator/onboarding/page.tsx`
**功能:** 入驻流程引导首页
**包含:** 流程说明、开始申请按钮、入驻优势展示

### Task 2.2: 创建入驻申请页面
**File Path:** `app/creator/onboarding/apply/page.tsx`
**功能:** 多步骤表单
**步骤:**
1. 基本信息（姓名、职业、简介）
2. 工作经历（支持添加多条）
3. 技能标签选择
4. 材料上传（简历、作品集）
5. 确认提交

### Task 2.3: 创建审核状态页面
**File Path:** `app/creator/onboarding/status/page.tsx`
**功能:** 显示审核进度
**状态:** 待提交 → 审核中 → 已通过/已拒绝
**包含:** 审核反馈、重新申请按钮

### Task 2.4: 增强分身列表页面
**File Path:** `app/creator/avatars/page.tsx`
**新增功能:**
- 状态筛选（全部/草稿/审核中/已上架/已下架）
- 分身卡片增强（数据展示：浏览量、雇佣次数、收入）
- 快捷操作（编辑/上下架/查看数据）

### Task 2.5: 创建分身数据分析页面
**File Path:** `app/creator/avatars/[id]/analytics/page.tsx`
**功能:** 单个分身的数据分析
**包含:**
- 关键指标卡片（浏览量、雇佣次数、收入、评分）
- 趋势图表（近7天/30天数据）
- 雇佣记录列表

### Task 2.6: 增强任务中心
**File Path:** `app/creator/tasks/page.tsx`
**重写:** 完整的任务管理界面
**包含:**
- 状态Tab（待处理/进行中/已完成）
- 任务卡片（项目信息、雇佣方、金额、截止日期）
- 搜索/筛选功能

### Task 2.7: 创建任务详情页面
**File Path:** `app/creator/tasks/[id]/page.tsx`
**功能:** 单个任务详情
**包含:**
- 项目信息
- 雇佣方信息
- 项目进度
- 交付物管理
- 操作按钮（接受/拒绝/完成）

### Task 2.8: 增强收益中心
**File Path:** `app/creator/earnings/page.tsx`
**重写:** 完整的收益管理界面
**包含:**
- 收入概览（今日/本周/本月/累计）
- 收入趋势图
- 收入明细表格
- 提现入口

### Task 2.9: 创建提现页面
**File Path:** `app/creator/earnings/withdraw/page.tsx`
**功能:** 提现申请
**包含:**
- 可提现余额
- 提现方式选择（支付宝/银行卡）
- 提现金额输入
- 提现记录

### Task 2.10: 增强消息中心
**File Path:** `app/creator/messages/page.tsx`
**重写:** 完整的聊天界面
**包含:**
- 会话列表（左侧）
- 聊天窗口（右侧）
- 消息类型支持（文字/图片/文件）

---

## Phase 3: 需求端完善 (Client)

### Task 3.1: 创建市场首页
**File Path:** `app/market/page.tsx`
**功能:** 分身市场主入口
**包含:**
- 搜索栏
- 分类导航
- 推荐分身（轮播/网格）
- 热门标签

### Task 3.2: 创建搜索结果页面
**File Path:** `app/market/search/page.tsx`
**功能:** 搜索结果显示
**包含:**
- 搜索结果列表/网格
- 筛选条件（价格/评分/行业）
- 排序选项

### Task 3.3: 创建分类浏览页面
**File Path:** `app/market/category/[slug]/page.tsx`
**功能:** 按分类浏览分身
**包含:**
- 分类标题/描述
- 子分类筛选
- 分身列表

### Task 3.4: 创建分身详情页面
**File Path:** `app/avatar/[id]/page.tsx`
**功能:** 完整的分身展示页
**包含:**
- 分身基本信息
- 详细介绍（富文本）
- 技能标签云
- 服务定价
- 用户评价列表
- 相似推荐
- 雇佣按钮

### Task 3.5: 增强雇佣页面
**File Path:** `app/hire/[id]/page.tsx`
**重写:** 完整的雇佣流程
**步骤:**
1. 服务类型选择（咨询/项目）
2. 定价方式选择（按时/按次）
3. 项目需求描述
4. 预估费用计算
5. 确认雇佣

### Task 3.6: 创建支付页面
**File Path:** `app/hire/[id]/payment/page.tsx`
**功能:** 支付确认
**包含:**
- 订单信息确认
- 支付方式选择（模拟）
- 支付按钮

### Task 3.7: 创建项目中心
**File Path:** `app/client/projects/page.tsx`
**功能:** 需求方项目管理
**包含:**
- 项目列表（进行中/已完成）
- 项目卡片（分身信息、进度、截止日期）

### Task 3.8: 创建AI对话页面
**File Path:** `app/client/projects/[id]/page.tsx`
**功能:** 与AI分身协作
**包含:**
- AI对话界面（类ChatGPT）
- 项目信息侧边栏
- 文件上传/下载
- 联系所有者按钮

### Task 3.9: 创建订单中心
**File Path:** `app/client/orders/page.tsx`
**功能:** 我的订单
**包含:**
- 订单列表
- 订单详情
- 评价入口

### Task 3.10: 创建钱包页面
**File Path:** `app/client/wallet/page.tsx`
**功能:** 账户余额管理
**包含:**
- 余额展示
- 充值入口
- 消费记录

---

## Phase 4: 管理端 (Admin)

### Task 4.1: 创建管理员登录
**File Path:** `app/admin/login/page.tsx`
**功能:** 管理员专用登录
**包含:** 账号密码输入、登录按钮

### Task 4.2: 创建管理端布局
**File Path:** `app/admin/layout.tsx`
**功能:** 管理端侧边栏导航
**包含:**
- Logo
- 导航菜单（Dashboard/入驻审核/分身管理/用户管理/订单管理/数据/设置）
- 退出登录

### Task 4.3: 创建管理首页
**File Path:** `app/admin/dashboard/page.tsx`
**功能:** 管理后台首页
**包含:**
- 今日关键数据卡片
- 待办事项（待审核/待处理订单/待处理反馈）
- 快捷入口

### Task 4.4: 创建入驻审核列表
**File Path:** `app/admin/applications/page.tsx`
**功能:** 入驻申请管理
**包含:**
- 状态筛选（待审核/已通过/已拒绝）
- 申请列表表格
- 快捷操作（通过/拒绝）

### Task 4.5: 创建审核详情页面
**File Path:** `app/admin/applications/[id]/page.tsx`
**功能:** 单个申请审核
**包含:**
- 申请人完整资料
- 材料查看
- 审核操作（通过/拒绝+原因）
- 审核历史

### Task 4.6: 创建分身管理页面
**File Path:** `app/admin/avatars/page.tsx`
**功能:** 全部分身管理
**包含:**
- 状态筛选
- 分身列表
- 搜索功能
- 快捷操作（上下架/编辑/删除）

### Task 4.7: 创建用户管理页面
**File Path:** `app/admin/users/page.tsx`
**功能:** 用户账号管理
**包含:**
- 用户类型筛选（供给端/需求端/管理员）
- 用户列表
- 账号状态管理（正常/封禁）
- 查看详情

### Task 4.8: 创建订单管理页面
**File Path:** `app/admin/orders/page.tsx`
**功能:** 平台订单管理
**包含:**
- 订单列表
- 状态筛选
- 订单详情
- 纠纷处理

### Task 4.9: 创建内容审核页面
**File Path:** `app/admin/content/page.tsx`
**功能:** 内容审核
**包含:**
- 待审核内容列表
- 审核操作（通过/删除）
- 违规记录

### Task 4.10: 创建系统设置页面
**File Path:** `app/admin/settings/page.tsx`
**功能:** 平台配置
**包含:**
- 基础设置
- 分成比例设置
- 权重规则设置

---

## Phase 5: 数据端 (Data)

### Task 5.1: 创建数据看板首页
**File Path:** `app/admin/data/page.tsx`
**功能:** 数据概览仪表盘
**包含:**
- 实时数据卡片（在线人数/今日PV/今日注册/今日雇佣）
- 关键趋势图
- TOP排行

### Task 5.2: 创建用户数据页面
**File Path:** `app/admin/data/users/page.tsx`
**功能:** 用户数据分析
**包含:**
- 注册趋势图
- 用户留存分析
- 用户画像饼图
- 供给/需求比例

### Task 5.3: 创建分身数据页面
**File Path:** `app/admin/data/avatars/page.tsx`
**功能:** 分身数据分析
**包含:**
- 分身增长趋势
- 热门分身排行
- 分身活跃度分析
- 分身收入排行

### Task 5.4: 创建交易数据页面
**File Path:** `app/admin/data/transactions/page.tsx`
**功能:** 交易数据分析
**包含:**
- 交易额趋势
- 成交量统计
- 平台分成统计
- 退款统计

### Task 5.5: 创建财务数据页面
**File Path:** `app/admin/data/finance/page.tsx`
**功能:** 财务报表
**包含:**
- 收支汇总
- 利润分析
- 资金流水表

---

## Phase 6: 认证端 (Certification)

### Task 6.1: 创建认证首页
**File Path:** `app/certification/page.tsx`
**功能:** 认证服务入口
**包含:**
- 认证服务介绍
- 认证类型卡片（身份认证/知识产权/1V1咨询）
- 我的认证状态

### Task 6.2: 创建身份认证申请
**File Path:** `app/certification/identity/page.tsx`
**功能:** 身份真实性认证
**包含:**
- 认证说明
- 资料上传（身份证/工牌/学历证明）
- 提交申请

### Task 6.3: 创建知识产权认证
**File Path:** `app/certification/ip/page.tsx`
**功能:** AI分身版权认证
**包含:**
- 认证说明
- AI分身选择
- 语料所有权声明
- 数字证书预览

### Task 6.4: 创建1V1咨询页面
**File Path:** `app/certification/consulting/page.tsx`
**功能:** 专家咨询服务
**包含:**
- 专家列表
- 专家详情
- 预约咨询
- 咨询记录

### Task 6.5: 创建证书查看页面
**File Path:** `app/certification/certificate/[id]/page.tsx`
**功能:** 认证证书展示
**包含:**
- 证书样式
- 认证信息
- 验证二维码

---

## Phase 7: 首页与导航优化

### Task 7.1: 创建新的首页
**File Path:** `app/page.tsx`
**重写:** 平台首页
**包含:**
- 平台价值主张
- 快速入口（我是供给端/我是需求端）
- 热门分身展示
- 平台数据统计
- 用户评价
- CTA按钮

### Task 7.2: 创建公共导航组件
**File Path:** `components/Navbar.tsx`
**功能:** 响应式导航栏
**包含:** Logo、导航链接、用户菜单、登录/注册按钮

### Task 7.3: 创建页脚组件
**File Path:** `components/Footer.tsx`
**功能:** 网站页脚
**包含:** 链接分组、版权信息、社交媒体

---

## 测试验证

每个Phase完成后执行：
1. 本地构建测试
2. 页面路由检查
3. 响应式布局检查
4. 交互功能验证

---

## 部署计划

- Phase 1-2 完成后 → 部署供给端
- Phase 3 完成后 → 部署需求端
- Phase 4-5 完成后 → 部署管理端和数据端
- Phase 6 完成后 → 部署认证端
- Phase 7 完成后 → 全量部署

---

## 优先级调整建议

如需调整优先级，建议顺序：
1. **P0** - 供给端核心（入驻+分身管理+收益）
2. **P1** - 需求端核心（市场+雇佣+项目）
3. **P2** - 管理端（审核+分身管理）
4. **P3** - 数据端
5. **P4** - 认证端
