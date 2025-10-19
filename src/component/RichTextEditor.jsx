import React from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {TextStyle} from '@tiptap/extension-text-style'

const extensions = [StarterKit, TextStyle]

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isItalic: ctx.editor.isActive('italic'),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isStrike: ctx.editor.isActive('strike'),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run(),
    }),
  })

  const btn = 'px-2 py-1 text-sm border rounded hover:bg-gray-100'
  const active = 'bg-gray-300 font-semibold'

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={`${btn} ${editorState.isBold ? active : ''}`}
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        className={`${btn} ${editorState.isItalic ? active : ''}`}
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={`${btn} ${editorState.isStrike ? active : ''}`}
      >
        Strike
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btn} ${editorState.isBulletList ? active : ''}`}
      >
        Bullet List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btn} ${editorState.isOrderedList ? active : ''}`}
      >
        Numbered List
      </button>

      <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className={btn}>
        Clear Marks
      </button>

      <button onClick={() => editor.chain().focus().clearNodes().run()} className={btn}>
        Clear Nodes
      </button>

      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} className={btn}>
        Undo
      </button>

      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} className={btn}>
        Redo
      </button>
    </div>
  )
}

const RichTextEditor = () => {
  const editor = useEditor({
    extensions,
    content: `
      <h2>Hi there 👋</h2>
      <p>This is a <strong>basic</strong> example using <em>Tiptap</em> in React.</p>
    `,
  })

  return (
    <div className="border rounded shadow max-w-3xl mx-auto mt-5">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="p-4 min-h-[200px] focus:outline-none" />
    </div>
  )
}

export default RichTextEditor
