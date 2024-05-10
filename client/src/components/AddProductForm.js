import React, { useState, useEffect } from 'react';
import useContract from '../hooks/useProductContract';
import ProductContractABI from '../contracts/ProductContract.json';
import '../style/Forms.css';

const AddProductForm = ({ contractAddress }) => {
  const productContract = useContract(ProductContractABI.abi, contractAddress);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = async (event) => {
    event.preventDefault();
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await productContract.methods.addProduct(name, description).send({ from: accounts[0] });
      
      const newProduct = { id: products.length + 1, name, description };
      setProducts([...products, newProduct]);

      alert('Product added successfully!');
      setName('');
      setDescription('');
    } catch (error) {
      alert('Error adding product: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleAddProduct}>
        <div className="form-group">
          <label>Product Name:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <button type="submit">Add Product</button>
        </div>
      </form>

      <h3>Added Products</h3>
      <ul>
        {products.map(product => (
          <li key={product.productId}>{product.name} - {product.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddProductForm;
