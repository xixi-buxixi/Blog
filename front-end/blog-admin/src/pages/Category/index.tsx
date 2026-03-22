// 分类管理页
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Card,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  CategoryFormData,
} from '@/api/category';

const CategoryManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm<CategoryFormData>();
  const [submitting, setSubmitting] = useState(false);

  // 加载分类列表
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoryList();
      setCategories(res.data);
    } catch (error) {
      // 错误已处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 打开新增/编辑弹窗
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success('分类更新成功');
      } else {
        await createCategory(values);
        message.success('分类创建成功');
      }
      closeModal();
      loadCategories();
    } catch (error) {
      // 错误已处理
    } finally {
      setSubmitting(false);
    }
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('分类删除成功');
      loadCategories();
    } catch (error) {
      // 错误已处理
    }
  };

  // 表格列定义
  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: true,
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            description="删除后无法恢复，该分类下的文章将变为未分类状态"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部工具栏 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新建分类
        </Button>
      </Card>

      {/* 分类列表 */}
      <Card bordered={false}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ sortOrder: 0 }}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '名称最多50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="分类描述"
            rules={[{ max: 200, message: '描述最多200个字符' }]}
          >
            <Input.TextArea
              placeholder="请输入分类描述"
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            tooltip="数字越大越靠前"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManage;