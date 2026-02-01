import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
// Feature imports
import { AuthProvider, useAuth } from './pages/auth';
import { ProductList, ProductDetail } from './pages/customer/products';
import { CustomerLogin, AuthCallback } from './pages/auth';
import { MyPage } from './pages/customer/users';
import {
  AdminLogin,
  AdminAuthCallback,
  AdminProductManagement,
  AdminProductForm,
  AdminCategoryManagement,
  AdminCategoryForm,
  AdminReviewManagement,
  AdminCustomerManagement,
} from './pages/admin';

// Common components
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';

// Protected Route for Customers
function ProtectedCustomerRoute({ children }: { children: React.ReactNode }) {
  const { customer, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Protected Route for Admins
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!admin || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { customer, admin } = useAuth();

  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/" element={<ProductList customer={customer} />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Protected Customer Routes */}
      <Route
        path="/mypage"
        element={
          <ProtectedCustomerRoute>
            <MyPage />
          </ProtectedCustomerRoute>
        }
      />

      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/auth/callback" element={<AdminAuthCallback />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <AdminProductManagement admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedAdminRoute>
            <AdminReviewManagement admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedAdminRoute>
            <AdminCategoryManagement admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <ProtectedAdminRoute>
            <AdminCategoryForm admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/categories/:id/edit"
        element={
          <ProtectedAdminRoute>
            <AdminCategoryForm admin={admin!} />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedAdminRoute>
            <AdminCustomerManagement admin={admin!} />
          </ProtectedAdminRoute>
        }
      />

      {/* Redirect /admin to /admin/products */}
      <Route path="/admin" element={<Navigate to="/admin/products" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
