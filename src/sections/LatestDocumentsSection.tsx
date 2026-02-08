import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Document } from '@/types';
import { getLatestDocuments } from '@/services/document';

const LatestDocumentsSection: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await getLatestDocuments(6);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">最新发布</h2>
            <p className="text-gray-500">及时获取最新出台的市场监管法律法规</p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center"
            onClick={() => navigate('/latest')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 文档列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                      <FileText className="w-5 h-5 text-red-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                        {doc.title}
                      </h3>
                      {doc.subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{doc.subtitle}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {doc.summary || doc.content.substring(0, 100) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(doc.effectiveDate || doc.publishDate)}
                      </span>
                      <span>{doc.viewCount} 次浏览</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {doc.documentNumber || '法规'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无最新文档</p>
          </div>
        )}

        {/* 移动端查看更多按钮 */}
        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/latest')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestDocumentsSection;
