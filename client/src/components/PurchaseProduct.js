import React, { useState, useEffect } from 'react';
import useContract from '../hooks/useProductContract';
import ProductContractABI from '../contracts/ProductContract.json';
import '../style/Forms.css'; 

const PurchaseProduct = ({ contractAddress }) => {
  const productContract = useContract(ProductContractABI.abi, contractAddress);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState(() => {
    const savedPurchases = localStorage.getItem('purchasedProducts');
    return savedPurchases ? JSON.parse(savedPurchases) : [];
  });

  useEffect(() => {
    localStorage.setItem('purchasedProducts', JSON.stringify(purchasedProducts));
  }, [purchasedProducts]);

  const handlePurchase = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      console.log("productID1 = " + productId);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("accounts = " + accounts);
      const allProducts = await productContract.methods.getAllProducts().call();
      console.log('All Products:', allProducts);
      const productDetails = await productContract.methods.products(productId).call();
      console.log("productID = " + productId);
      console.log("pret = " + productDetails.details.price);
      await productContract.methods.purchaseProduct(productId).send({ from: accounts[0], value: productDetails.details.price });
      
      const newPurchase = { id: productId, price: productDetails.details.price };
      setPurchasedProducts([...purchasedProducts, newPurchase]);

      alert('Product purchased successfully!');
      setProductId(''); 
    } catch (error) {
      alert('Error purchasing product: ' + error.message);
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
            onChange={e => setProductId(e.target.value)}
            placeholder="Enter product ID"
            required
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading} className="form-button">
            {loading ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      </form>

      <h3>Purchased Products</h3>
      <ul>
        {purchasedProducts.map((purchase, index) => (
          <li key={index}>
            ID: {purchase.id}, Price: {purchase.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchaseProduct;
