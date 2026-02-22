import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ManageAdmins from './pages/admin/ManageAdmins';
import Checkout from './pages/checkout/Checkout';
import OrderSuccess from './pages/order/OrderSuccess';
import AuthSelection from './pages/auth/AuthSelection';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OrderDetails from "./pages/order/OrderDetails";
import MyOrders from "./pages/order/MyOrders";
import Wishlist from "./pages/Wishlist";
function App() {
    const [cart, setCart] = React.useState([]);

    const addToCart = (product, size = null) => {
        setCart([...cart, { ...product, selectedSize: size }]);
        alert(`${product.name}${size ? ` (${size})` : ''} added to cart!`);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const clearCart = () => {
        if (window.confirm("Are you sure you want to cancel your order and clear the cart?")) {
            setCart([]);
        }
    };

    return (
        <Layout cartCount={cart.length}>
            <Routes>
                <Route path="/" element={<Home addToCart={addToCart} />} />
                <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth-selection" element={<AuthSelection />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account/orders/:id" element={<OrderDetails />} />
                <Route path="/account/orders" element={<MyOrders />} />
                <Route path="/account/wishlist" element={<Wishlist addToCart={addToCart} />} />
                {/* Protected Routes for Customers */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
                    <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                </Route>

                {/* Protected Routes for Admin only */}
                <Route element={<ProtectedAdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products/add" element={<AddProduct />} />
                        <Route path="products/edit/:id" element={<EditProduct />} />
                        <Route path="manage-admins" element={<ManageAdmins />} />
                    </Route>
                </Route>
            </Routes>
        </Layout>
    )
}

export default App;
