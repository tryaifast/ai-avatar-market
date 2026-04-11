// 创建新的管理员账号（使用新邮箱避免冲突）
fetch('/api/admin/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret: 'init_admin_2024',
    email: 'admin@ai-avatar.com',
    password: 'admin123456',
    name: '超级管理员'
  })
}).then(r => r.json()).then(data => {
  console.log('Result:', data);
  if (data.success) {
    console.log('✅ 管理员创建成功！');
    console.log('邮箱: admin@ai-avatar.com');
    console.log('密码: admin123456');
  } else {
    console.log('❌ 错误:', data.error);
  }
});
