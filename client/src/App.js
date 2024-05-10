import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddParticipantForm from './components/AddParticipantForm';
import AddProductForm from './components/AddProductForm';
import UpdateProductStage from './components/UpdateProductStage';
import SetProductPriceForm from './components/SetProductPriceForm';
import PurchaseProduct from './components/PurchaseProduct';
import './App.css';  

const App = () => {
   const accessControlManagerAddress = '0x16E7C6b74aA2C4c6F72E474c8a0b441EeB3faA80';
   const productContractAddress = '0x36627B98dC265b97dFB1E35522c338d5CEf4d7F6';

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Supply Chain Management Dashboard</h1>
          <nav className="navigation">
            <ul>
              <li><Link to="/add-participant">Add Participant</Link></li>
              <li><Link to="/add-product">Add Product</Link></li>
              <li><Link to="/update-product-stage">Update Product Stage</Link></li>
              <li><Link to="/set-product-price">Set Product Price</Link></li>
              <li><Link to="/purchase-product">Purchase Product</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/add-participant" element={<AddParticipantForm contractAddress={accessControlManagerAddress} />} />
            <Route path="/add-product" element={<AddProductForm contractAddress={productContractAddress} />} />
            <Route path="/update-product-stage" element={<UpdateProductStage contractAddress={productContractAddress} />} />
            <Route path="/set-product-price" element={<SetProductPriceForm contractAddress={productContractAddress} />} />
            <Route path="/purchase-product" element={<PurchaseProduct contractAddress={productContractAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
