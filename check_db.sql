-- 查询用户数量
SELECT COUNT(*) as total_users FROM users;

-- 查询所有用户信息
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC;

-- 查询分身数量
SELECT COUNT(*) as total_avatars FROM avatars;

-- 查询任务数量
SELECT COUNT(*) as total_tasks FROM tasks;
