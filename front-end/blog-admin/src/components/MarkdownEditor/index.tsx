// Markdown 编辑器组件
import { useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  placeholder = '请输入 Markdown 内容...',
}) => {
  return (
    <div className="markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        placeholder={placeholder}
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
};

export default MarkdownEditor;