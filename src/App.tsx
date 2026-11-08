import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { AppProvider } from './lib/store'

export default function App() {
  return <AppProvider><RouterProvider router={router} /></AppProvider>
}
