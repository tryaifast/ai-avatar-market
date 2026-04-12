/**
 * 确保 feedback_schema.sql 中的3张表存在
 * 运行方式：npx ts-node scripts/ensure-feedback-tables.ts
 * 或直接在 Supabase SQL Editor 中执行 supabase/feedback_schema.sql
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const db = createClient(supabaseUrl, serviceRoleKey);

async function ensureTables() {
  console.log('检查 feedback 相关表是否存在...\n');

  // 检查 feedbacks 表
  const { error: fbError } = await db.from('feedbacks').select('id').limit(1);
  if (fbError) {
    console.log('❌ feedbacks 表不存在或无法访问:', fbError.message);
    console.log('   → 请在 Supabase SQL Editor 中执行 supabase/feedback_schema.sql\n');
  } else {
    console.log('✅ feedbacks 表正常\n');
  }

  // 检查 admin_broadcasts 表
  const { error: abError } = await db.from('admin_broadcasts').select('id').limit(1);
  if (abError) {
    console.log('❌ admin_broadcasts 表不存在或无法访问:', abError.message);
    console.log('   → 请在 Supabase SQL Editor 中执行 supabase/feedback_schema.sql\n');
  } else {
    console.log('✅ admin_broadcasts 表正常\n');
  }

  // 检查 user_messages 表
  const { error: umError } = await db.from('user_messages').select('id').limit(1);
  if (umError) {
    console.log('❌ user_messages 表不存在或无法访问:', umError.message);
    console.log('   → 请在 Supabase SQL Editor 中执行 supabase/feedback_schema.sql\n');
  } else {
    console.log('✅ user_messages 表正常\n');
  }

  // 检查 ai_configs 表
  const { error: aiError } = await db.from('ai_configs').select('id').limit(1);
  if (aiError) {
    console.log('❌ ai_configs 表不存在或无法访问:', aiError.message);
    console.log('   → 请在 Supabase SQL Editor 中执行 supabase/ai_config_schema.sql\n');
  } else {
    console.log('✅ ai_configs 表正常\n');
  }
}

ensureTables().catch(console.error);
