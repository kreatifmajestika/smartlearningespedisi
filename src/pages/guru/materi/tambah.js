import MaterialEditor from '../../../components/Teacher/MaterialEditor'

const TambahMateri= () => {
  const handleSave = (materialData) => {
    // Save to Firebase RTDB
    console.log('Saving material:', materialData)
    // Add your Firebase save logic here
  }

  return (
    <div>
      <MaterialEditor onSave={handleSave} />
    </div>
  )
}

export default TambahMateri