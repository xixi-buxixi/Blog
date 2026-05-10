// Markdown 编辑器组件
import { useCallback, useRef, useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import TurndownService from 'turndown';
import * as pdfjsLib from 'pdfjs-dist';
import { Button, message, Space, Input, Alert, Modal, Spin } from 'antd';
import { FileWordOutlined, FilePdfOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import instance from '@/utils/request';

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// 大内容阈值 - 超过此值切换到轻量模式
const LARGE_CONTENT_THRESHOLD = 20000;

const { TextArea } = Input;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

// 配置 Turndown 服务
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**',
  emDelimiter: '*',
});

// 自定义规则：保留图片
turndownService.addRule('image', {
  filter: 'img',
  replacement: (_content, node) => {
    const img = node as HTMLImageElement;
    const alt = img.alt || '';
    const src = img.src || '';
    return src ? `![${alt}](${src})` : '';
  },
});

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  placeholder = '请输入 Markdown 内容...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isLargeContent, setIsLargeContent] = useState(false);

  // 监听内容变化，判断是否需要切换轻量模式
  useEffect(() => {
    setIsLargeContent(value.length > LARGE_CONTENT_THRESHOLD);
  }, [value]);

  // 处理粘贴事件 - 仅在小内容时启用
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (isLargeContent) return; // 大内容时跳过粘贴处理

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData('text/html');

    if (htmlData) {
      e.preventDefault();
      try {
        const markdown = turndownService.turndown(htmlData);
        const textarea = containerRef.current?.querySelector('textarea');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = value.substring(0, start) + markdown + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
            textarea.focus();
          }, 0);
        } else {
          onChange(value + markdown);
        }
      } catch (error) {
        console.error('Failed to convert HTML to Markdown:', error);
        const textData = clipboardData.getData('text/plain');
        onChange(value + textData);
      }
    }
  }, [value, onChange, isLargeContent]);

  // 监听粘贴事件
  const handleRef = useCallback((ref: HTMLDivElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener('paste', handlePaste);
    }
    if (ref) {
      ref.addEventListener('paste', handlePaste);
    }
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = ref;
  }, [handlePaste]);

  // 解析 Word 文件 - 使用后端 API
  const parseWordFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await instance.post('/word/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.code !== 200) {
      throw new Error(response.data.message || '解析失败');
    }

    return response.data.data || '';
  };

  // 解析 PDF 文件
  const parsePdfFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // 提取文本内容
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      if (pageText.trim()) {
        fullText += `## 第 ${i} 页\n\n${pageText}\n\n`;
      }
    }

    return fullText;
  };

  // 处理文件导入
  const handleFileImport = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc');
    const isPdf = fileName.endsWith('.pdf');

    if (!isWord && !isPdf) {
      message.error('仅支持 .doc, .docx, .pdf 格式文件');
      return false;
    }

    setImporting(true);
    const hideLoading = message.loading('正在解析文件，请耐心等待...', 0);

    try {
      let markdown = '';

      if (isWord) {
        markdown = await parseWordFile(file);
      } else if (isPdf) {
        markdown = await parsePdfFile(file);
      }

      if (!markdown.trim()) {
        message.warning('文件内容为空或无法解析');
        return false;
      }

      // 延迟设置内容，避免阻塞UI
      setTimeout(() => {
        const newValue = value ? `${value}\n\n${markdown}` : markdown;
        onChange(newValue);

        if (newValue.length > LARGE_CONTENT_THRESHOLD) {
          message.success(`导入成功！内容较长(${Math.round(newValue.length/1000)}KB)，已切换到轻量编辑模式`);
        } else {
          message.success('文件导入成功！');
        }
      }, 100);

    } catch (error: any) {
      console.error('File import error:', error);
      if (error.code === 'ECONNABORTED') {
        message.error('解析超时，请尝试较小的文件');
      } else {
        message.error(error.response?.data?.message || error.message || '文件解析失败，请检查文件格式');
      }
    } finally {
      hideLoading();
      setImporting(false);
    }

    return false;
  };

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
      e.target.value = '';
    }
  };

  // 渲染轻量模式编辑器（大内容）
  const renderLightweightEditor = () => (
    <div>
      <Alert
        type="warning"
        showIcon
        icon={<EditOutlined />}
        message="轻量编辑模式"
        description={`内容较长(${Math.round(value.length/1000)}KB)，已禁用实时预览以提升性能。点击右侧"预览"按钮查看渲染效果。`}
        action={
          <Button size="small" icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
            预览
          </Button>
        }
        style={{ marginBottom: 8 }}
      />
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
        rows={25}
      />
    </div>
  );

  // 渲染完整编辑器（小内容）
  const renderFullEditor = () => (
    <div ref={handleRef}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        previewOptions={{
          style: {
            fontSize: 14,
            lineHeight: 1.8,
          },
        }}
        textareaProps={{
          placeholder,
          style: { fontSize: 14 },
        }}
      />
    </div>
  );

  return (
    <div className="markdown-editor" data-color-mode="light">
      {/* 工具栏 */}
      <div style={{
        marginBottom: 8,
        padding: '8px 12px',
        background: '#f5f5f5',
        borderRadius: '6px 6px 0 0',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <Space>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.pdf"
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
          <Button
            icon={<FilePdfOutlined />}
            onClick={triggerFileInput}
            loading={importing}
            size="small"
          >
            导入 PDF
          </Button>
        </Space>
        <span style={{ marginLeft: 16, fontSize: 12, color: '#999' }}>
          支持粘贴富文本或导入 Word/PDF 文件
        </span>
        {isLargeContent && (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
            style={{ float: 'right' }}
          >
            预览
          </Button>
        )}
      </div>

      {/* 编辑器内容 */}
      {isLargeContent ? renderLightweightEditor() : renderFullEditor()}

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
          <MDEditor.Markdown source={value} style={{ padding: 16 }} />
        </div>
      </Modal>
    </div>
  );
};

export default MarkdownEditor;