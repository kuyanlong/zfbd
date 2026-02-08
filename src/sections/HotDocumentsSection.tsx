import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, ChevronRight, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Document } from '@/types';
import { getHotDocuments } from '@/services/document';

const HotDocumentsSection: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await getHotDocuments(10);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">热门法规</h2>
            <p className="text-gray-500">浏览量最高的市场监管法律法规</p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center"
            onClick={() => navigate('/hot')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 文档列表 */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <Card 
                key={doc.id} 
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* 排名 */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                      ${index < 3 ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-600'}
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* 图标 */}
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                      <FileText className="w-5 h-5 text-red-700" />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-red-700 transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {doc.viewCount.toLocaleString()} 次浏览
                        </span>
                        <span>{doc.downloadCount.toLocaleString()} 次下载</span>
                      </div>
                    </div>
                    
                    {/* 趋势图标 */}
                    <TrendingUp className="w-5 h-5 text-red-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无热门文档</p>
          </div>
        )}

        {/* 移动端查看更多按钮 */}
        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/hot')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotDocumentsSection;
