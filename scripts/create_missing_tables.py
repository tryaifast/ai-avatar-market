"""在 Supabase 中创建缺失的表 (feedbacks, admin_broadcasts, user_messages, ai_configs)"""
import os
import urllib.request
import urllib.error
import json

# 读取环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
project_ref = url.replace('https://', '').split('.')[0]

SQL = """
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  user_name TEXT,
  type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_reply TEXT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT DEFAULT 'all',
  target_users UUID[],
  sent_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT DEFAULT 'system',
  title TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_feedback_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL DEFAULT 'kimi',
  api_key TEXT NOT NULL,
  api_url TEXT,
  model VARCHAR(100) DEFAULT 'kimi-latest',
  max_tokens INTEGER DEFAULT 2048,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER DEFAULT 1000000,
  usage_current INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_is_read ON user_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at DESC);
"""

def check_tables():
    """检查表是否存在"""
    headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}
    results = {}
    for table in ['admin_broadcasts', 'feedbacks', 'user_messages', 'ai_configs']:
        req = urllib.request.Request(f'{url}/rest/v1/{table}?select=id&limit=1', headers=headers)
        try:
            urllib.request.urlopen(req)
            results[table] = True
        except urllib.error.HTTPError:
            results[table] = False
        except Exception:
            results[table] = False
    return results

def create_tables_via_management_api():
    """尝试通过 Supabase Management API 创建表"""
    # Supabase Management API 需要个人 access token，这里跳过
    # 改为输出 SQL 供手动执行
    print("=" * 60)
    print("需要在 Supabase Dashboard SQL Editor 中执行以下 SQL:")
    print("=" * 60)
    print(SQL)
    print("=" * 60)
    print(f"\nDashboard URL: https://supabase.com/dashboard/project/{project_ref}/sql")
    print("\n或者使用 Supabase CLI:")
    print(f"  npx supabase db push")

if __name__ == '__main__':
    print("Checking existing tables...")
    results = check_tables()
    for table, exists in results.items():
        status = "EXISTS" if exists else "NOT EXISTS"
        print(f"  {table}: {status}")
    
    missing = [t for t, e in results.items() if not e]
    if missing:
        print(f"\nMissing tables: {', '.join(missing)}")
        create_tables_via_management_api()
    else:
        print("\nAll tables exist!")
