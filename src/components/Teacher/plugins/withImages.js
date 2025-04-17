// withImages.js
import { Transforms } from 'slate'

export const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => element.type === 'image'

  editor.insertImage = (url) => {
    const image = { type: 'image', url, children: [{ text: '' }] }
    Transforms.insertNodes(editor, image)
  }

  return editor
}