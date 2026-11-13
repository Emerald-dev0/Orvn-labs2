import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Youtube,
  Minus,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';

const MenuButton = ({ active, onClick, icon: Icon, title, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      padding: '8px 10px',
      background: active ? '#5B3FD4' : '#F7F8FB',
      color: active ? '#fff' : '#475569',
      border: active ? 'none' : '1px solid #E5E8F0',
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <Icon size={16} />
  </button>
);

const MenuSelect = ({ value, onChange, options, title }) => (
  <select
    value={value}
    onChange={onChange}
    title={title}
    style={{
      padding: '6px 10px',
      background: '#F7F8FB',
      color: '#475569',
      border: '1px solid #E5E8F0',
      borderRadius: 6,
      fontSize: 12,
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      cursor: 'pointer',
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const MenuDivider = () => <div style={{ width: 1, height: 24, background: '#E5E8F0' }} />;

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your post...' }) {
  const [charCount, setCharCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(!value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        paragraph: { keepMarks: true },
        link: false,
        underline: false,
        hardBreak: {
          keepMarks: true,
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      const text = editor.getText();
      setCharCount(text.length);
      setIsEmpty(text.trim().length === 0);
    },
  });

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setCharCount(text.length);
      setIsEmpty(text.trim().length === 0);
    }
  }, [editor]);

  if (!editor) {
    return <div style={{ padding: '20px', color: '#94A3B8' }}>Loading editor...</div>;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      // Basic YouTube regex to get ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const id = (match && match[2].length === 11) ? match[2] : null;

      if (id) {
        const iframe = `<div class="video-container"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`;
        editor.chain().focus().insertContent(iframe).run();
      } else {
        alert('Invalid YouTube URL');
      }
    }
  };

  const addDivider = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  // const insertTable = () => {
  //   editor
  //     .chain()
  //     .focus()
  //     .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
  //     .run();
  // };

  return (
    <div style={{ border: '1px solid #E5E8F0', borderRadius: 12, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: 'clamp(8px, 2vw, 16px)',
          background: '#F7F8FB',
          borderBottom: '1px solid #E5E8F0',
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
        {/* Text Formatting */}
        <MenuButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={Bold}
          title="Bold (Ctrl+B)"
        />
        <MenuButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={Italic}
          title="Italic (Ctrl+I)"
        />
        <MenuButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={UnderlineIcon}
          title="Underline (Ctrl+U)"
        />
        <MenuButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={Strikethrough}
          title="Strikethrough"
        />

        <MenuDivider />

        {/* Headings */}
        <MenuButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          title="Heading 1"
        />
        <MenuButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          title="Heading 2"
        />
        <MenuButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={Heading3}
          title="Heading 3"
        />

        <MenuDivider />

        {/* Lists */}
        <MenuButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          title="Bullet List"
        />
        <MenuButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          title="Numbered List"
        />

        <MenuDivider />

        {/* Alignment */}
        <MenuButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          icon={AlignLeft}
          title="Align Left"
        />
        <MenuButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          icon={AlignCenter}
          title="Align Center"
        />
        <MenuButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          icon={AlignRight}
          title="Align Right"
        />
        <MenuButton
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          icon={AlignJustify}
          title="Justify"
        />

        <MenuDivider />

        {/* Quote & Code */}
        <MenuButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={Quote}
          title="Blockquote"
        />
        <MenuButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icon={Code}
          title="Code Block"
        />

        <MenuDivider />

        {/* Insert Elements */}
        <MenuButton
          onClick={addLink}
          icon={LinkIcon}
          title="Insert Link"
        />
        <MenuButton
          onClick={addImage}
          icon={ImageIcon}
          title="Insert Image"
        />
        <MenuButton
          onClick={addYoutube}
          icon={Youtube}
          title="Insert YouTube Video"
        />
        <MenuButton
          onClick={addDivider}
          icon={Minus}
          title="Insert Divider"
        />
        {/* <MenuButton
          onClick={insertTable}
          icon={Minus}
          title="Insert Table"
        /> */}

        <MenuDivider />

        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo2}
          title="Undo"
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo2}
          title="Redo"
        />

        <MenuDivider />

        {/* Clear Formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          icon={Trash2}
          title="Clear Formatting"
        />
      </div>

      {/* Editor */}
      <div
        style={{
          padding: 'clamp(16px, 3vw, 28px)',
          minHeight: 'clamp(300px, 50vh, 600px)',
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#fafbfc',
          position: 'relative',
        }}
      >
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: 'clamp(16px, 3vw, 28px)',
              left: 'clamp(16px, 3vw, 28px)',
              fontSize: 'clamp(14px, 1.1vw, 16px)',
              color: '#CBD5E1',
              fontStyle: 'italic',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="rich-text-editor-content"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(14px, 1.1vw, 16px)',
            lineHeight: 1.8,
            color: '#0F172A',
          }}
        />
      </div>

      {/* Character Count */}
      <div
        style={{
          padding: 'clamp(10px, 2vw, 16px) clamp(16px, 3vw, 28px)',
          background: '#F7F8FB',
          borderTop: '1px solid #E5E8F0',
          fontSize: 'clamp(11px, 1vw, 13px)',
          color: '#94A3B8',
          textAlign: 'right',
          fontWeight: 500,
        }}
      >
        {charCount} characters
      </div>
    </div>
  );
}
