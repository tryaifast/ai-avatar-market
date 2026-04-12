// ============================================
// 管理员AI配置管理 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - 获取AI配置
export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 获取所有AI配置
    const { data: configs, error } = await (DB.db.from('ai_configs') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 隐藏完整的API密钥，只显示前8位
    const maskedConfigs = (configs || []).map((config: any) => ({
      ...config,
      api_key: config.api_key ? `${config.api_key.substring(0, 8)}...` : '',
    }));

    return NextResponse.json({
      success: true,
      configs: maskedConfigs,
    });
  } catch (error: any) {
    console.error('Get AI config error:', error);
    return NextResponse.json(
      { error: error.message || '获取配置失败' },
      { status: 500 }
    );
  }
}

// POST - 创建/更新AI配置
export async function POST(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { id, provider, apiKey, apiUrl, model, maxTokens, temperature, isActive, usageLimit } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: '请填写提供商和API密钥' }, { status: 400 });
    }

    const configData = {
      provider,
      api_key: apiKey,
      api_url: apiUrl || null,
      model: model || 'kimi-latest',
      max_tokens: maxTokens || 2048,
      temperature: temperature || 0.7,
      is_active: isActive !== false,
      usage_limit: usageLimit || 1000000,
    };

    let result;
    if (id) {
      // 更新现有配置
      const { data, error } = await (DB.db.from('ai_configs') as any)
        .update(configData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // 创建新配置
      const { data, error } = await (DB.db.from('ai_configs') as any)
        .insert(configData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: id ? '配置更新成功' : '配置创建成功',
      config: {
        ...result,
        api_key: result.api_key ? `${result.api_key.substring(0, 8)}...` : '',
      },
    });
  } catch (error: any) {
    console.error('Save AI config error:', error);
    return NextResponse.json(
      { error: error.message || '保存配置失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除AI配置
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少配置ID' }, { status: 400 });
    }

    const { error } = await (DB.db.from('ai_configs') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '配置已删除',
    });
  } catch (error: any) {
    console.error('Delete AI config error:', error);
    return NextResponse.json(
      { error: error.message || '删除配置失败' },
      { status: 500 }
    );
  }
}
