import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useState } from 'react';

// Feature imports
import { AuthProvider, useAuth, User } from './features/auth';
import { Review } from './features/reviews/types';
import { Product } from './features/products/types';
import { ProductListing, ProductDetail } from './features/products';
import { UserLogin, AuthCallback } from './features/auth';
import { MyPage } from './features/users';
import {
  AdminLogin,
  AdminAuthCallback,
  AdminProductList,
  AdminProductForm,
  AdminReviewManagement,
} from './features/admin';

// Common components
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';

// Protected Route for Users
function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
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
  const { user, admin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <Routes>
      {/* Public User Routes */}
      <Route path="/" element={<ProductListing user={user} />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Protected User Routes */}
      <Route
        path="/mypage"
        element={
          <ProtectedUserRoute>
            <MyPage
              user={user!}
              reviews={reviews}
              setReviews={setReviews}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </ProtectedUserRoute>
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
            <AdminProductList
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedAdminRoute>
            <AdminReviewManagement
              admin={admin!}
              reviews={reviews}
              setReviews={setReviews}
            />
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
