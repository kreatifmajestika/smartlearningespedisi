import MaterialEditor from '../../components/Teacher/MaterialEditor'
import { getDatabase, ref, push } from 'firebase/database'

export default function TambahMateri() {
  const handleSave = async (materialData) => {
    try {
      const db = getDatabase()
      const materialsRef = ref(db, 'materials')
      await push(materialsRef, {
        title: materialData.title,
        description: materialData.description,
        content: materialData.content,
        attachments: materialData.attachments,
        createdAt: new Date().toISOString()
      })
      alert('Materi berhasil disimpan!')
    } catch (error) {
      console.error('Gagal menyimpan materi:', error)
      alert('Gagal menyimpan materi')
    }
  }

  return (
    <div className="smart-learning-expedis">
      <MaterialEditor onSave={handleSave} />
    </div>
  )
}