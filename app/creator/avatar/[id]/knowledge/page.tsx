'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/store';

interface KnowledgeFile {
  id: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

const contentTypeLabels: Record<string, string> = {
  soul: 'SOUL人格',
  memory: '经验记忆',
  document: '专业文档',
  code: '代码文件',
  text: '文本文件'
};

export default function KnowledgePage() {
  const params = useParams();
  const avatarId = params.id as string;
  
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('document');

  const fetchFiles = useCallback(async () => {
    try {
      const res = await authFetch(`/api/avatars/${avatarId}/knowledge`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.knowledge);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', selectedType);

    try {
      const res = await authFetch(`/api/avatars/${avatarId}/knowledge/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        await fetchFiles();
      } else {
        alert('上传失败');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (knowledgeId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      const res = await authFetch(`/api/avatars/${avatarId}/knowledge?knowledgeId=${knowledgeId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchFiles();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">知识库管理</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">上传知识文件</h2>
        <p className="text-gray-600 mb-4">支持：Markdown (.md)、PDF (.pdf)、代码文件、纯文本 (.txt)</p>
        
        <div className="flex gap-4 mb-4">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="soul">SOUL人格</option>
            <option value="memory">经验记忆</option>
            <option value="document">专业文档</option>
            <option value="code">代码文件</option>
            <option value="text">文本文件</option>
          </select>
          
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            <Upload className="w-4 h-4" />
            {isUploading ? '上传中...' : '选择文件'}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUpload}
              accept=".md,.pdf,.txt,.py,.js,.ts,.sql"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-6 border-b">已上传文件 ({files.length})</h2>
        
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无文件，请上传知识库文件
          </div>
        ) : (
          <div className="divide-y">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {contentTypeLabels[file.contentType]} · {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        💡 提示：上传的文件会被向量化处理，对话时会自动检索相关内容
      </div>
    </div>
  );
}
