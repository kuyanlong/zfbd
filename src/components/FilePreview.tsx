import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  fileName?: string;
  fileType?: string;
  fileContent?: string; // base64 encoded content
  onDownload?: () => void;
}

// PDF预览组件 - 使用iframe嵌入
const PDFPreview: React.FC<{ fileContent: string; fileName?: string; onDownload?: () => void }> = ({ 
  fileContent, 
  fileName,
  onDownload 
}) => {
  const [objectUrl, setObjectUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileContent) {
      setError('没有文件内容');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 将base64转换为Blob
      const byteCharacters = atob(fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      setLoading(false);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('PDF转换失败:', err);
      setError('PDF文件格式错误，无法预览');
      setLoading(false);
    }
  }, [fileContent]);

  if (loading) {
    return (
      <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">正在加载PDF文档...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-2">{error}</p>
        {onDownload && (
          <Button onClick={onDownload} className="bg-red-700 hover:bg-red-800 mt-4">
            <Download className="w-4 h-4 mr-2" />
            下载查看原文
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[200px]">{fileName || 'PDF文档'}</p>
          </div>
        </div>
        {onDownload && (
          <Button onClick={onDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
        )}
      </div>
      
      {/* PDF嵌入 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
        <iframe
          src={objectUrl}
          className="w-full"
          style={{ height: '800px', minHeight: '500px' }}
          title="PDF预览"
        />
      </div>
    </div>
  );
};

// Word预览组件
const WordPreview: React.FC<{ fileContent: string; fileName?: string; onDownload?: () => void }> = ({ 
  fileContent, 
  fileName,
  onDownload 
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileContent) {
      setError('没有文件内容');
      setLoading(false);
      return;
    }

    const convertWord = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 将base64转换为ArrayBuffer
        const byteCharacters = atob(fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const arrayBuffer = byteArray.buffer;
        
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (err) {
        console.error('Word转换失败:', err);
        setError('Word文档格式错误，无法预览');
      } finally {
        setLoading(false);
      }
    };
    
    convertWord();
  }, [fileContent]);

  if (loading) {
    return (
      <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">正在加载Word文档...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-2">{error}</p>
        {onDownload && (
          <Button onClick={onDownload} className="bg-red-700 hover:bg-red-800 mt-4">
            <Download className="w-4 h-4 mr-2" />
            下载查看原文
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[200px]">{fileName || 'Word文档'}</p>
          </div>
        </div>
        {onDownload && (
          <Button onClick={onDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
        )}
      </div>
      <div 
        className="border border-gray-200 rounded-lg p-4 bg-white overflow-auto"
        style={{ maxHeight: '800px', minHeight: '400px' }}
      >
        <div 
          className="prose max-w-none word-preview"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
      <style>{`
        .word-preview { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .word-preview h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .word-preview h2 { font-size: 1.3em; font-weight: bold; margin: 0.5em 0; }
        .word-preview h3 { font-size: 1.1em; font-weight: bold; margin: 0.5em 0; }
        .word-preview p { margin: 0.5em 0; line-height: 1.6; }
        .word-preview table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .word-preview td, .word-preview th { border: 1px solid #ddd; padding: 8px; }
        .word-preview ul, .word-preview ol { margin: 0.5em 0; padding-left: 2em; }
        .word-preview img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
};

const FilePreview: React.FC<FilePreviewProps> = ({
  fileName,
  fileType,
  fileContent,
  onDownload,
}) => {
  const isPDF = fileType === 'pdf' || fileName?.toLowerCase().endsWith('.pdf');
  const isWord = fileType === 'word' || fileName?.toLowerCase().endsWith('.doc') || fileName?.toLowerCase().endsWith('.docx');

  // PDF预览
  if (isPDF && fileContent) {
    return (
      <PDFPreview 
        fileContent={fileContent} 
        fileName={fileName} 
        onDownload={onDownload} 
      />
    );
  }

  // Word预览
  if (isWord && fileContent) {
    return (
      <WordPreview 
        fileContent={fileContent} 
        fileName={fileName} 
        onDownload={onDownload} 
      />
    );
  }

  // 无法预览时的回退显示
  return (
    <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">
        {isPDF ? 'PDF文档' : isWord ? 'Word文档' : '文档文件'}
      </p>
      {fileName && (
        <p className="text-sm text-gray-500 mb-4">{fileName}</p>
      )}
      {!fileContent && (
        <p className="text-sm text-orange-500 mb-4">文件内容为空</p>
      )}
      {onDownload && (
        <Button onClick={onDownload} className="bg-red-700 hover:bg-red-800">
          <Download className="w-4 h-4 mr-2" />
          下载查看原文
        </Button>
      )}
    </div>
  );
};

export default FilePreview;
