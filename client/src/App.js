import React, { useState, useEffect } from "react";
import getWeb3 from "./components/getWeb3";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddParticipantForm from "./components/AddParticipantForm";
import AddProductForm from "./components/AddProductForm";
import UpdateProductStage from "./components/UpdateProductStage";
import SetProductPriceForm from "./components/SetProductPriceForm";
import PurchaseProduct from "./components/PurchaseProduct";
import "./App.css";
import {
  accessControlManagerAddress,
  productContractAddress,
} from "./contracts";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccounts(accounts);
        setIsConnected(accounts.length > 0);
      } catch (error) {
        console.error(
          "Failed to load web3, accounts, or contract. Check console for details.",
          error
        );
      }
    };

    initWeb3();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Supply Chain Management Dashboard</h1>
          <nav className="navigation">
            <ul>
              <li>
                <Link to="/add-participant">Add Participant</Link>
              </li>
              <li>
                <Link to="/add-product">Add Product</Link>
              </li>
              <li>
                <Link to="/update-product-stage">Update Product Stage</Link>
              </li>
              <li>
                <Link to="/set-product-price">Set Product Price</Link>
              </li>
              <li>
                <Link to="/purchase-product">Purchase Product</Link>
              </li>
            </ul>
          </nav>
          {isConnected ? (
            <div>Connected Account: {accounts[0]}</div>
          ) : (
            <div>Please connect to MetaMask.</div>
          )}
        </header>
        <main>
          <Routes>
            <Route
              path="/add-participant"
              element={
                <AddParticipantForm
                  contractAddress={accessControlManagerAddress}
                  web3={web3}
                  accounts={accounts}
                />
              }
            />
            <Route
              path="/add-product"
              element={
                <AddProductForm
                  contractAddress={productContractAddress}
                  web3={web3}
                  accounts={accounts}
                />
              }
            />
            <Route
              path="/update-product-stage"
              element={
                <UpdateProductStage
                  contractAddress={productContractAddress}
                  web3={web3}
                  accounts={accounts}
                />
              }
            />
            <Route
              path="/set-product-price"
              element={
                <SetProductPriceForm
                  contractAddress={productContractAddress}
                  web3={web3}
                  accounts={accounts}
                />
              }
            />
            <Route
              path="/purchase-product"
              element={
                <PurchaseProduct
                  contractAddress={productContractAddress}
                  web3={web3}
                  accounts={accounts}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
