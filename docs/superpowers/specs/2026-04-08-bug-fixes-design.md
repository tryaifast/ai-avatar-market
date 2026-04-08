# Bug修复设计文档

> **方案A：最小修复**

## 问题清单

### 1. 注册/登录API错误（P0 - 严重）
- **现象**：`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **原因**：API返回HTML（404/500错误页面）而非JSON
- **修复**：确保API路由正确返回JSON格式错误

### 2. 头像上传无响应（P1 - 高）
- **现象**：点击"上传头像"按钮无反应
- **原因**：事件处理器未绑定或文件上传逻辑缺失
- **修复**：添加正确的onChange事件处理

### 3. 侧边栏导航失效（P1 - 高）
- **现象**：只有"总览"可用，其他菜单点击无效
- **原因**：路由链接错误或组件渲染问题
- **修复**：检查所有导航链接的href和路由配置

### 4. 页面偶尔崩溃（P1 - 高）
- **现象**：渲染崩溃
- **原因**：组件错误边界缺失，数据访问异常
- **修复**：添加错误边界组件，增加空值检查

### 5. 雇佣按钮404（P1 - 高）
- **现象**：点击"雇佣"跳转404
- **原因**：路由未配置对应页面
- **修复**：创建雇佣页面或修复路由

## 技术方案

### API错误处理修复
```typescript
// 统一API错误响应格式
export function handleApiError(error: unknown) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Internal error' },
    { status: 500 }
  );
}
```

### 头像上传修复
```typescript
// 添加文件选择处理
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  // 上传逻辑...
};
```

### 导航修复
```typescript
// 确保所有href正确
const menuItems = [
  { href: '/creator/dashboard', label: '总览' },
  { href: '/creator/avatars', label: '我的分身' },
  // ...
];
```

### 错误边界
```typescript
// 添加React错误边界
class ErrorBoundary extends React.Component {
  // 错误处理逻辑
}
```

## 文件清单

需要修改的文件：
1. `app/api/auth/route.ts` - API错误处理
2. `lib/hooks/useAuth.tsx` - 登录状态管理
3. `app/creator/avatar/create/page.tsx` - 头像上传
4. `components/layout/Sidebar.tsx` - 导航修复
5. `app/client/market/page.tsx` - 雇佣按钮
6. `app/layout.tsx` - 添加错误边界
7. `app/creator/layout.tsx` - 修复侧边栏

## 验证方案

1. 测试注册/登录流程
2. 测试头像上传功能
3. 测试所有导航链接
4. 测试雇佣按钮跳转
5. 检查控制台无错误
