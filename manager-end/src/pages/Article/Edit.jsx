import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Card, Space, message, InputNumber, Switch } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import MDEditor from '@uiw/react-md-editor'
import { getArticleDetail, createArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'

const { TextArea } = Input

function ArticleEdit() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [content, setContent] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchArticle()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await getCategoryList()
      setCategories(res || [])
    } catch (e) {
      // ignore
    }
  }

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const res = await getArticleDetail(id)
      form.setFieldsValue({
        title: res.title,
        summary: res.summary,
        categoryId: res.categoryId,
        coverImage: res.coverImage,
        status: res.status
      })
      setContent(res.content || '')
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    if (!content) {
      message.error('请输入文章内容')
      return
    }

    setLoading(true)
    try {
      const data = {
        ...values,
        content
      }
      if (isEdit) {
        await updateArticle(id, data)
        message.success('更新成功')
      } else {
        await createArticle(data)
        message.success('创建成功')
      }
      navigate('/article')
    } catch (e) {
      // error handled
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/article')
  }

  return (
    <Card title={isEdit ? '编辑文章' : '新建文章'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: 1 }}
      >
        <Form.Item
          name="title"
          label="文章标题"
          rules={[{ required: true, message: '请输入文章标题' }]}
        >
          <Input placeholder="请输入文章标题" maxLength={200} />
        </Form.Item>

        <Form.Item name="summary" label="文章摘要">
          <TextArea
            placeholder="请输入文章摘要（可选，不填则自动截取正文）"
            maxLength={500}
            rows={3}
          />
        </Form.Item>

        <Form.Item name="categoryId" label="分类">
          <Select
            placeholder="请选择分类"
            allowClear
            options={categories.map(c => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="coverImage" label="封面图片">
          <Input placeholder="请输入封面图片URL（可选）" />
        </Form.Item>

        <Form.Item label="文章内容" required>
          <MDEditor
            value={content}
            onChange={setContent}
            height={500}
            className="md-editor"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="发布状态"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: '草稿', value: 0 },
              { label: '发布', value: 1 }
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              返回
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ArticleEdit