-- Phase 29: Knowledge Base Schema Migration
-- Created for AI Avatar Market - pgvector support

-- ============================================
-- 1. Create avatar_knowledge table
-- ============================================

CREATE TABLE avatar_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('soul', 'memory', 'document', 'code', 'text')),
    embedding VECTOR(768),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_avatar_knowledge_embedding ON avatar_knowledge USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_avatar_knowledge_avatar ON avatar_knowledge(avatar_id);

-- ============================================
-- 2. Create task_deliverables table
-- ============================================

CREATE TABLE task_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('code', 'document', 'data', 'archive', 'other')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_task_deliverables_task ON task_deliverables(task_id);
CREATE INDEX idx_task_deliverables_expires ON task_deliverables(expires_at);

-- ============================================
-- 3. Create vector similarity search function
-- ============================================

CREATE OR REPLACE FUNCTION match_knowledge(
  p_avatar_id UUID,
  p_embedding VECTOR(768),
  p_match_count INT DEFAULT 5,
  p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  similarity FLOAT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.content,
    k.content_type,
    1 - (k.embedding <=> p_embedding) AS similarity
  FROM avatar_knowledge k
  WHERE k.avatar_id = p_avatar_id
    AND 1 - (k.embedding <=> p_embedding) > p_similarity_threshold
  ORDER BY k.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Add RLS policies
-- ============================================

-- Enable RLS on avatar_knowledge
ALTER TABLE avatar_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator can manage own avatar knowledge" ON avatar_knowledge
  USING (EXISTS (
    SELECT 1 FROM avatars a
    WHERE a.id = avatar_id AND a.creator_id = auth.uid()
  ));

-- Enable RLS on task_deliverables
ALTER TABLE task_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view deliverables" ON task_deliverables
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_id AND (t.client_id = auth.uid() OR t.creator_id = auth.uid())
  ));
