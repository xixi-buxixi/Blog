// 文章编辑页
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Space,
  message,
  Spin,
  InputNumber,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '@/components/MarkdownEditor';
import { getArticleDetail, createArticle, updateArticle, Article } from '@/api/article';
import { getCategoryList, Category } from '@/api/category';

const { TextArea } = Input;
const { Option } = Select;

interface ArticleForm {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  categoryId: number | undefined;
  status: 0 | 1;
}

const ArticleEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<ArticleForm>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState('');

  const isEdit = !!id;

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const res = await getCategoryList();
      setCategories(res.data);
    } catch (error) {
      // 错误已处理
    }
  };

  // 加载文章详情
  const loadArticle = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await getArticleDetail(Number(id));
      setArticle(res.data);
      setContent(res.data.content);
      form.setFieldsValue({
        title: res.data.title,
        summary: res.data.summary,
        coverImage: res.data.coverImage,
        categoryId: res.data.categoryId,
        status: res.data.status,
      });
    } catch (error) {
      message.error('加载文章失败');
      navigate('/article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  // 提交表单
  const handleSubmit = async (values: ArticleForm, status: 0 | 1) => {
    if (!content.trim()) {
      message.error('请输入文章内容');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...values,
        content,
        status,
      };

      if (isEdit) {
        await updateArticle(Number(id), data);
        message.success('文章更新成功');
      } else {
        await createArticle(data);
        message.success('文章创建成功');
      }
      navigate('/article');
    } catch (error) {
      // 错误已处理
    } finally {
      setSubmitting(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = () => {
    form.validateFields().then((values) => {
      handleSubmit(values, 0);
    });
  };

  // 发布文章
  const handlePublish = () => {
    form.validateFields().then((values) => {
      handleSubmit(values, 1);
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      {/* 顶部操作栏 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/article')}>
            返回列表
          </Button>
          <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 16 }}>
            {isEdit ? '编辑文章' : '新建文章'}
          </span>
        </Space>
        <Space style={{ float: 'right' }}>
          <Button onClick={handleSaveDraft} loading={submitting}>
            <SaveOutlined /> 保存草稿
          </Button>
          <Button type="primary" onClick={handlePublish} loading={submitting}>
            <SendOutlined /> 发布文章
          </Button>
        </Space>
      </Card>

      {/* 编辑表单 */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 1 }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          {/* 左侧主内容区 */}
          <div style={{ flex: 1 }}>
            <Card bordered={false}>
              <Form.Item
                name="title"
                label="文章标题"
                rules={[
                  { required: true, message: '请输入文章标题' },
                  { max: 200, message: '标题最多200个字符' },
                ]}
              >
                <Input placeholder="请输入文章标题" size="large" />
              </Form.Item>

              <Form.Item label="文章内容" required>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  height={500}
                  placeholder="请输入 Markdown 格式的文章内容..."
                />
              </Form.Item>

              <Form.Item
                name="summary"
                label="文章摘要"
                rules={[{ max: 500, message: '摘要最多500个字符' }]}
              >
                <TextArea
                  placeholder="请输入文章摘要，不填写将自动生成"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Card>
          </div>

          {/* 右侧设置区 */}
          <div style={{ width: 320 }}>
            <Card bordered={false} title="文章设置">
              <Form.Item
                name="categoryId"
                label="所属分类"
              >
                <Select placeholder="请选择分类" allowClear>
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="coverImage"
                label="封面图片"
              >
                <Input placeholder="输入图片URL地址" />
              </Form.Item>

              <Form.Item
                name="status"
                label="发布状态"
              >
                <Select>
                  <Option value={1}>已发布</Option>
                  <Option value={0}>草稿</Option>
                </Select>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ArticleEdit;