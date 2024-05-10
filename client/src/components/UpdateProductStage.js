import React, { useState, useEffect } from 'react';
import useContract from '../hooks/useProductContract';
import ProductContractABI from '../contracts/ProductContract.json';
import '../style/Forms.css';

const UpdateProductStage = ({ contractAddress }) => {
  const productContract = useContract(ProductContractABI.abi, contractAddress);
  const [productId, setProductId] = useState('');
  const [newStage, setNewStage] = useState('');
  const [updatedProducts, setUpdatedProducts] = useState(() => {
    const savedProducts = localStorage.getItem('updatedProducts');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  useEffect(() => {
    localStorage.setItem('updatedProducts', JSON.stringify(updatedProducts));
  }, [updatedProducts]);

  const handleUpdateStage = async (event) => {
    event.preventDefault();
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];

      const parsedProductId = parseInt(productId, 10);
      const parsedNewStage = parseInt(newStage, 10);

      const receipt = await productContract.methods.updateProductStage(parsedProductId, parsedNewStage)
                        .send({ from: currentAccount });
      console.log("Transaction successful:", receipt);
      alert('Product stage updated successfully!');

      const updatedProduct = { id: productId, stage: newStage };
      setUpdatedProducts(prevProducts => [...prevProducts, updatedProduct]);

      setProductId('');
      setNewStage(''); 
    } catch (error) {
      console.error("Transaction failed:", error);
      alert('Error updating product stage: ' + (error.message || error));
    }
  };
  return (
    <div className="form-container">
      <h2>Update Product Stage</h2>
      <form onSubmit={handleUpdateStage} className="form">
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
          <label htmlFor="newStage">New Stage:</label>
          <select
            id="newStage"
            value={newStage}
            onChange={e => setNewStage(e.target.value)}
            required
          >
            <option value="">Select a stage</option>
            <option value="0">Ordered</option>
            <option value="1">Raw Materials Procured</option>
            <option value="2">Manufactured</option>
            <option value="3">Distributed</option>
            <option value="4">Retail</option>
            <option value="5">Sold</option>
          </select>
        </div>
        <div className="form-group">
          <button type="submit" className="form-button">Update Stage</button>
        </div>
      </form>

      <h3>Updated Products</h3>
      <ul>
        {updatedProducts.map((product, index) => (
          <li key={index}>
            ID: {product.id}, Stage: {product.stage}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpdateProductStage;
