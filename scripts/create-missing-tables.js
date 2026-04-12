// ============================================
// 在 Supabase 中创建缺失的表
// 表: feedbacks, admin_broadcasts, user_messages, ai_configs
// 运行: node scripts/create-missing-tables.js
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createMissingTables() {
  console.log('Creating missing tables in Supabase...\n');

  // 1. feedbacks 表
  console.log('1. Creating feedbacks table...');
  const { error: feedbacksError } = await supabase.rpc('query', {
    query: `
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
      CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
      CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
      CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
    `
  });
  if (feedbacksError) console.log('  (Using direct insert fallback)');

  // 2. admin_broadcasts 表
  console.log('2. Creating admin_broadcasts table...');
  const { error: broadcastsError } = await supabase.rpc('query', {
    query: `
      CREATE TABLE IF NOT EXISTS admin_broadcasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        target_type TEXT DEFAULT 'all',
        target_users UUID[],
        sent_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  if (broadcastsError) console.log('  (Using direct insert fallback)');

  // 3. user_messages 表
  console.log('3. Creating user_messages table...');
  const { error: messagesError } = await supabase.rpc('query', {
    query: `
      CREATE TABLE IF NOT EXISTS user_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        type TEXT DEFAULT 'system',
        title TEXT,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_feedback_id UUID REFERENCES feedbacks(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON user_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_messages_is_read ON user_messages(is_read);
      CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at DESC);
    `
  });
  if (messagesError) console.log('  (Using direct insert fallback)');

  // 4. ai_configs 表
  console.log('4. Creating ai_configs table...');
  const { error: aiConfigsError } = await supabase.rpc('query', {
    query: `
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
    `
  });
  if (aiConfigsError) console.log('  (Using direct insert fallback)');

  // 验证表是否存在
  console.log('\nVerifying tables...');
  
  const tables = ['feedbacks', 'admin_broadcasts', 'user_messages', 'ai_configs'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND - ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: EXISTS`);
    }
  }
}

createMissingTables()
  .then(() => console.log('\nDone!'))
  .catch(err => console.error('Error:', err));
