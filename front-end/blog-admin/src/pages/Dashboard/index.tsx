// 仪表盘页面
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Space, Empty } from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getArticleList, Article } from '@/api/article';
import { getCategoryList, Category } from '@/api/category';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [articleCount, setArticleCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        getArticleList({ page: 1, pageSize: 100 }),
        getCategoryList(),
      ]);

      const articles = articlesRes.data.list;
      setArticleCount(articlesRes.data.total);
      setPublishedCount(articles.filter((a) => a.status === 1).length);
      setTotalViews(articles.reduce((sum, a) => sum + (a.viewCount || 0), 0));
      setCategoryCount(categoriesRes.data.length);
      setRecentArticles(articles.slice(0, 5));
    } catch (error) {
      // 错误已处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="文章总数"
              value={articleCount}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="已发布"
              value={publishedCount}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="分类数量"
              value={categoryCount}
              prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="总浏览量"
              value={totalViews}
              prefix={<EyeOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近文章 */}
      <Card
        title="最近文章"
        style={{ marginTop: 24 }}
        extra={<a href="/article">查看全部</a>}
      >
        {recentArticles.length > 0 ? (
          <List
            dataSource={recentArticles}
            renderItem={(item) => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Tag color={item.status === 1 ? 'success' : 'warning'}>
                      {item.status === 1 ? '已发布' : '草稿'}
                    </Tag>
                    {item.categoryName && <Tag color="blue">{item.categoryName}</Tag>}
                  </Space>
                  <Space>
                    <Text type="secondary">
                      <EyeOutlined /> {item.viewCount}
                    </Text>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {dayjs(item.createTime).format('MM-DD HH:mm')}
                    </Text>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无文章" />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;