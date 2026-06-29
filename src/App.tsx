import { Layout } from './components/Layout'
import { FileUpload } from './components/FileUpload'
import { SettingsForm } from './components/SettingsForm'
import { CalibrationSection } from './components/CalibrationSection'
import { StatusPanel } from './components/StatusPanel'
import { useImpositionStore } from './store/imposition'

function App() {
  const step = useImpositionStore((s) => s.step)

  return (
    <Layout>
      {/* Upload step */}
      {step === 'upload' && <FileUpload />}

      {/* Settings + status (shown once file is loaded) */}
      {(step === 'settings' || step === 'composing' || step === 'done' || step === 'error') && (
        <>
          <SettingsForm />
          <CalibrationSection />
          <StatusPanel />
        </>
      )}
    </Layout>
  )
}

export default App
