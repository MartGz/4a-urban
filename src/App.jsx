import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Chatbox from "./components/Chatbox"
import Home from "./pages/Home"
import Catalogo from "./pages/Catalogo"
import Nosotros from "./pages/Nosotros"
import Carrito from "./pages/Carrito"
import Login from "./pages/Login"
import AdminLayout from "./pages/admin/AdminLayout"
import ProductsManager from "./pages/admin/ProductsManager"
import CustomersManager from "./pages/admin/CustomersManager"
import Dashboard from "./pages/admin/Dashboard"
import RolesManager from "./pages/admin/RolesManager"
import StaffManager from "./pages/admin/StaffManager"
import CarouselsManager from "./pages/admin/CarouselsManager"
import GalleryManager from "./pages/admin/GalleryManager"
import MisCompras from "./pages/MisCompras"
import Perfil from "./pages/Perfil"
import SetPassword from "./pages/SetPassword"
import ForgotPassword from "./pages/ForgotPassword"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas con Navbar */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/catalogo" element={<><Navbar /><Catalogo /></>} />
        <Route path="/nosotros" element={<><Navbar /><Nosotros /></>} />
        <Route path="/carrito" element={<><Navbar /><Carrito /></>} />
        <Route path="/mis-compras" element={<><Navbar /><MisCompras /></>} />
        <Route path="/perfil" element={<><Navbar /><Perfil /></>} />

        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/olvide-password" element={<ForgotPassword />} />

        {/* Rutas de Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductsManager />} />
          <Route path="galeria" element={<CarouselsManager />} />
          <Route path="galeria/:carouselId" element={<GalleryManager />} />
          <Route path="clientes" element={<CustomersManager />} />
          <Route path="roles" element={<RolesManager />} />
          <Route path="personal" element={<StaffManager />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>

      {/* Chatbox flotante global */}
      <Chatbox />
    </BrowserRouter>
  )
}

export default App