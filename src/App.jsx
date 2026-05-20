import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider }    from './context/LangContext';
import { CartProvider }    from './context/CartContext';
import { AuthProvider }    from './context/AuthContext';
import ProtectedRoute      from './components/ProtectedRoute';
import Navbar              from './components/Navbar';
import Home                from './pages/Home';
import Catalog             from './pages/Catalog';
import Product             from './pages/Product';
import Cart                from './pages/Cart';
import Admin               from './pages/Admin';
import Login               from './pages/Login';
import './index.css';

export default function App() {
  return (
    <LangProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/"              element={<Home />} />
                    <Route path="/catalog"       element={<Catalog />} />
                    <Route path="/product/:id"   element={<Product />} />
                    <Route path="/cart"          element={<Cart />} />
                    <Route path="/admin"         element={
                      <ProtectedRoute><Admin /></ProtectedRoute>
                    } />
                  </Routes>
                </>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </LangProvider>
  );
}
