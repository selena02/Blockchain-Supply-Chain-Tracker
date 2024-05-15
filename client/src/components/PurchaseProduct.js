import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useContract from "../hooks/useProductContract";
import ProductContractABI from "../contracts/ProductContract.json";
import Web3 from "web3";
import "../style/Forms.css";

const PurchaseProduct = ({ contractAddress }) => {
  const productContract = useContract(ProductContractABI.abi, contractAddress);
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [purchasedProducts, setPurchasedProducts] = useState(() => {
    const savedPurchases = localStorage.getItem("purchasedProducts");
    return savedPurchases
      ? JSON.parse(savedPurchases).map((purchase) => ({
          ...purchase,
          price: BigInt(purchase.price),
        }))
      : [];
  });

  useEffect(() => {
    const connectMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);
          window.web3 = new Web3(window.ethereum);
        } catch (error) {
          console.error("MetaMask connection error:", error);
        }
      } else {
        alert("Please install MetaMask to use this DApp!");
      }
    };
    connectMetaMask();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "purchasedProducts",
      JSON.stringify(
        purchasedProducts.map((purchase) => ({
          ...purchase,
          price: purchase.price.toString(),
        }))
      )
    );
  }, [purchasedProducts]);

  const handlePurchase = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!account) {
        throw new Error("MetaMask is not connected");
      }

      if (!productId) {
        throw new Error("Product ID is required");
      }

      const productDetails = await productContract.methods
        .products(productId)
        .call();
      console.log("Product Details:", productDetails);

      const productPrice = BigInt(productDetails.details.price);
      console.log("Product Price (BigInt):", productPrice.toString());

      const transaction = await productContract.methods
        .purchaseProduct(productId)
        .send({
          from: account,
          value: productPrice.toString(),
          gas: 3000000, // Optionally set a gas limit to avoid gas estimation issues
        });

      console.log("Transaction:", transaction);

      const newPurchase = { id: productId, price: productPrice };
      setPurchasedProducts([...purchasedProducts, newPurchase]);

      alert("Product purchased successfully!");
      setProductId("");
    } catch (error) {
      console.error("Error purchasing product:", error);
      alert("Error purchasing product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Purchase Product</h2>
      <form onSubmit={handlePurchase} className="form">
        <div className="form-group">
          <label htmlFor="productId">Product ID:</label>
          <input
            type="number"
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            required
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading} className="form-button">
            {loading ? "Processing..." : "Purchase"}
          </button>
        </div>
      </form>

      <h3>Purchased Products</h3>
      <ul>
        {purchasedProducts.map((purchase, index) => (
          <li key={index}>
            ID: {purchase.id}, Price: {purchase.price.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

PurchaseProduct.propTypes = {
  contractAddress: PropTypes.string.isRequired,
};

export default PurchaseProduct;
