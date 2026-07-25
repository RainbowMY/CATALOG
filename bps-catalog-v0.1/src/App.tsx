import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CatalogUiProvider } from './context/CatalogUiContext'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { AllProductsPage } from './pages/AllProductsPage'
import { CollectionPage } from './pages/CollectionPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export default function App() {
  return (
    <CatalogUiProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<AllProductsPage />} />
            <Route path="collection/:id" element={<CollectionPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </CatalogUiProvider>
  )
}
