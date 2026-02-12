import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';

interface WangEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const WangEditor: React.FC<WangEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  height = 400,
}) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: [],
  };

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    autoFocus: false,
    MENU_CONF: {
      uploadImage: {
        // 禁用图片上传，使用base64
        base64LimitSize: 5 * 1024 * 1024, // 5MB
      },
    },
  };

  // 及时销毁编辑器
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={setEditor}
        onChange={(editor) => onChange(editor.getHtml())}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'hidden' }}
      />
    </div>
  );
};

export default WangEditor;
