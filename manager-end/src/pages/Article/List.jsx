import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Popconfirm, message, Input, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getArticleList, deleteArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import dayjs from 'dayjs'

const { Search } = Input

function ArticleList() {
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    categoryId: undefined
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [pagination.current, pagination.pageSize])

  const fetchCategories = async () => {
    try {
      const res = await getCategoryList()
      setCategories(res || [])
    } catch (e) {
      // ignore
    }
  }

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await getArticleList({
        page: pagination.current,
        size: pagination.pageSize,
        ...searchParams
      })
      setArticles(res.records || [])
      setPagination(prev => ({ ...prev, total: res.total || 0 }))
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id)
      message.success('删除成功')
      fetchArticles()
    } catch (e) {
      // error handled
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchArticles()
  }

  const handleTableChange = (pag) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize
    }))
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'orange'}>
          {status === 1 ? '已发布' : '草稿'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/article/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索文章标题"
          allowClear
          style={{ width: 250 }}
          value={searchParams.keyword}
          onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
          onSearch={handleSearch}
        />
        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 150 }}
          value={searchParams.categoryId}
          onChange={(value) => setSearchParams(prev => ({ ...prev, categoryId: value }))}
          options={categories.map(c => ({ label: c.name, value: c.id }))}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/article/add')}>
          新建文章
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={articles}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        onChange={handleTableChange}
      />
    </div>
  )
}

export default ArticleList