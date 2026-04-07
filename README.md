# AI分身市场 (AI Avatar Market)

## 核心概念
个人AI分身托管与交易平台。创作者训练自己的AI分身并出租，使用者按需雇佣分身解决问题。

## 关键设计
- **人机协同**: AI做80%前置工作，真人做20%审核决策
- **架构预留**: 当前B方案(创作者自托管)，底层支持未来迁移到A方案(平台托管)
- **定价模型**: 按任务计费 + 订阅制

## 技术栈
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- 本地JSON存储(B方案) → 未来迁移PostgreSQL(A方案)

## 项目结构
```
app/
  ├── page.tsx              # 首页/市场列表
  ├── layout.tsx            # 根布局
  ├── globals.css           # 全局样式
  ├── creator/              # 创作者端
  │   ├── dashboard/        # 创作者后台
  │   ├── avatar/           # 分身管理
  │   │   ├── create/       # 创建分身
  │   │   └── [id]/         # 分身详情编辑
  │   └── earnings/         # 收益管理
  ├── client/               # 使用者端
  │   ├── market/           # 分身市场
  │   ├── hire/[id]/        # 雇佣分身
  │   └── workspace/        # 工作空间(对话)
  └── api/                  # API路由
components/
  ├── ui/                   # 基础UI组件
  ├── avatar/               # 分身相关组件
  ├── chat/                 # 聊天组件
  └── layout/               # 布局组件
lib/
  ├── db/                   # 数据层(B方案JSON/未来SQL)
  ├── types/                # TypeScript类型
  └── utils/                # 工具函数
public/
  └── avatars/              # 分身头像
```
