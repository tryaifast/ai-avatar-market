// 重置管理员密码
fetch('/api/admin/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret: 'init_admin_2024',
    email: 'danielyang@avarta.com',
    password: '123456qwert',
    name: 'Daniel Yang'
  })
}).then(r => r.json()).then(console.log);
