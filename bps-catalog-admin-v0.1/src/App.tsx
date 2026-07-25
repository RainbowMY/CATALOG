import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { ProductListPage } from './pages/ProductLibrary/ProductListPage'
import { ProductEditPage } from './pages/ProductLibrary/ProductEditPage'
import { SlotListPage } from './pages/ResourceSlots/SlotListPage'
import { SlotEditPage } from './pages/ResourceSlots/SlotEditPage'
import { CategoryTreePage } from './pages/Categories/CategoryTreePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductEditPage />} />
        <Route path="/slots" element={<SlotListPage />} />
        <Route path="/slots/new" element={<SlotEditPage />} />
        <Route path="/slots/:id" element={<SlotEditPage />} />
        <Route path="/categories" element={<CategoryTreePage />} />
      </Route>
    </Routes>
  )
}
