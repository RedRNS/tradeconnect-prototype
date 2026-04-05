import { Toaster } from 'react-hot-toast'

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          border: '1px solid #CBD5E1',
          borderRadius: '12px',
          color: '#0F172A',
          background: '#FFFFFF',
          fontSize: '13px',
        },
      }}
    />
  )
}

export default ToastProvider