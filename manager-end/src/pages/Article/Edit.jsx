import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Card, Space, message, Modal } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, FileWordOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import MDEditor from '@uiw/react-md-editor'
import TurndownService from 'turndown'
import axios from 'axios'
import { getArticleDetail, createArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getToken } from '@/utils/auth'

// 配置 Turndown 服务
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**',
  emDelimiter: '*',
})

// 大内容阈值 - 超过此值使用简单编辑器
const LARGE_CONTENT_THRESHOLD = 20000

const { TextArea } = Input

function ArticleEdit() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [categories, setCategories] = useState([])
  const [content, setContent] = useState('')
  const [isLargeContent, setIsLargeContent] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchArticle()
    }
  }, [id])

  // 监听内容变化，自动切换编辑器模式
  useEffect(() => {
    setIsLargeContent(content.length > LARGE_CONTENT_THRESHOLD)
  }, [content])

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

  // 处理粘贴事件（富文本转 Markdown）
  const handlePaste = useCallback((e) => {
    const clipboardData = e.clipboardData
    if (!clipboardData) return

    const htmlData = clipboardData.getData('text/html')
    if (htmlData) {
      e.preventDefault()
      try {
        const markdown = turndownService.turndown(htmlData)
        const textarea = editorRef.current?.querySelector('textarea')
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newValue = content.substring(0, start) + markdown + content.substring(end)
          setContent(newValue)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + markdown.length
            textarea.focus()
          }, 0)
        } else {
          setContent(content + markdown)
        }
      } catch (error) {
        console.error('Failed to convert HTML to Markdown:', error)
        const textData = clipboardData.getData('text/plain')
        setContent(content + textData)
      }
    }
  }, [content])

  // 设置编辑器 ref 并监听粘贴事件
  const setEditorRef = useCallback((ref) => {
    if (editorRef.current) {
      editorRef.current.removeEventListener('paste', handlePaste)
    }
    if (ref) {
      ref.addEventListener('paste', handlePaste)
    }
    editorRef.current = ref
  }, [handlePaste])

  // 上传文件到后端解析
  const handleFileImport = async (file) => {
    const fileName = file.name.toLowerCase()

    if (!fileName.endsWith('.docx')) {
      message.error('仅支持 .docx 格式文件')
      return
    }

    // 检查文件大小（限制 20MB）
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('文件过大，请选择小于 20MB 的文件')
      return
    }

    setImporting(true)
    const hideLoading = message.loading('正在解析 Word 文件，请耐心等待...', 0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 使用独立的axios实例，设置更长的超时时间
      const response = await axios.post('/api/v1/word/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getToken()}`
        },
        timeout: 60000 // 60秒超时
      })

      // 解析响应
      const res = response.data
      if (res.code !== 200) {
        throw new Error(res.message || '解析失败')
      }
      const markdown = res.data || ''

      if (!markdown.trim()) {
        message.warning('文件内容为空或无法解析')
        return
      }

      const newContent = content ? `${content}\n\n${markdown}` : markdown
      const newLength = newContent.length

      // 延迟设置内容，避免阻塞UI
      setTimeout(() => {
        setContent(newContent)
        if (newLength > LARGE_CONTENT_THRESHOLD) {
          message.success(`导入成功！内容较长(${Math.round(newLength/1000)}KB)，已切换到轻量编辑模式`)
        } else {
          message.success('文件导入成功！')
        }
      }, 100)
    } catch (error) {
      console.error('File import error:', error)
      if (error.code === 'ECONNABORTED') {
        message.error('解析超时，请尝试较小的文件')
      } else {
        message.error(error.response?.data?.message || error.message || '文件解析失败，请检查文件格式')
      }
    } finally {
      hideLoading()
      setImporting(false)
    }
  }

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileImport(file)
      e.target.value = ''
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

  // 渲染编辑器
  const renderEditor = () => {
    if (isLargeContent) {
      // 大内容：使用简单textarea，避免渲染卡顿
      return (
        <div>
          <div style={{
            marginBottom: 8,
            padding: '8px 12px',
            background: '#fff7e6',
            borderRadius: '6px',
            border: '1px solid #ffd591',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#d46b08', fontSize: 13 }}>
              <EditOutlined /> 轻量编辑模式（内容较长，已禁用实时预览以提升性能）
            </span>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreviewVisible(true)}
            >
              预览
            </Button>
          </div>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入 Markdown 格式的文章内容"
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: 13,
              lineHeight: 1.6
            }}
            rows={25}
          />
        </div>
      )
    }

    // 普通内容：使用MDEditor
    return (
      <div ref={setEditorRef} data-color-mode="light">
        <MDEditor
          value={content}
          onChange={setContent}
          height={500}
          preview="live"
          className="md-editor"
        />
      </div>
    )
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
          {/* 工具栏 */}
          <div style={{
            marginBottom: 8,
            padding: '8px 12px',
            background: '#f5f5f5',
            borderRadius: '6px',
            borderBottom: '1px solid #e8e8e8'
          }}>
            <Space>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
              <Button
                icon={<FileWordOutlined />}
                onClick={triggerFileInput}
                loading={importing}
                size="small"
              >
                导入 Word
              </Button>
            </Space>
            <span style={{ marginLeft: 16, fontSize: 12, color: '#999' }}>
              支持粘贴富文本或导入 .docx 文件（限20MB）
            </span>
          </div>

          {/* 编辑器 */}
          {renderEditor()}
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

      {/* 预览弹窗 */}
      <Modal
        title="文章预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <div data-color-mode="light" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <MDEditor.Markdown source={content} style={{ padding: 16 }} />
        </div>
      </Modal>
    </Card>
  )
}

export default ArticleEdit