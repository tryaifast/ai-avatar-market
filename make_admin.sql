-- 将 danielyang@avarta.com 设为管理员
UPDATE users 
SET role = 'admin', 
    identity = ARRAY['管理员']::text[],
    bio = '系统管理员'
WHERE email = 'danielyang@avarta.com';

-- 查看结果
SELECT id, email, name, role, identity FROM users WHERE email = 'danielyang@avarta.com';
