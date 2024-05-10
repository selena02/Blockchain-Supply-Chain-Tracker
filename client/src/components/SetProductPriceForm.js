import React, { useState, useEffect } from 'react';
import useContract from '../hooks/useProductContract';
import ProductContractABI from '../contracts/ProductContract.json';
import '../style/Forms.css';

const SetProductPriceForm = ({ contractAddress }) => {
  const productContract = useContract(ProductContractABI.abi, contractAddress);
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [pricedProducts, setPricedProducts] = useState(() => {
    const savedProducts = localStorage.getItem('pricedProducts');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  useEffect(() => {
    localStorage.setItem('pricedProducts', JSON.stringify(pricedProducts));
  }, [pricedProducts]);

  const handleSetPrice = async (event) => {
    event.preventDefault();
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await productContract.methods.setProductPrice(productId, price).send({ from: accounts[0] });

      const newPricedProduct = { id: productId, price };
      setPricedProducts([...pricedProducts, newPricedProduct]);

      alert('Price set successfully!');
      setProductId('');  
      setPrice('');      
    } catch (error) {
      alert('Error setting price: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Product Price</h2>
      <form onSubmit={handleSetPrice} className="form">
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
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Set new price"
            required
          />
        </div>
        <div className="form-group">
          <button type="submit" className="form-button">Set Price</button>
        </div>
      </form>

      <h3>Priced Products</h3>
      <ul>
        {pricedProducts.map((product, index) => (
          <li key={index}>
            ID: {product.id}, Price: {product.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SetProductPriceForm;
