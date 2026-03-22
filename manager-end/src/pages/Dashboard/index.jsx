import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import {
  FileTextOutlined,
  AppstoreOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { getArticleStats } from '@/api/article'

function Dashboard() {
  const [stats, setStats] = useState({
    articleCount: 0,
    categoryCount: 0,
    totalViews: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await getArticleStats()
      setStats(res)
    } catch (e) {
      // 使用默认数据
    }
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="文章总数"
              value={stats.articleCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="分类总数"
              value={stats.categoryCount}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard