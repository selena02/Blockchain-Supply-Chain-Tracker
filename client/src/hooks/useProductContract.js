import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { productContractABI, productContractAddress } from '../contracts';

const useProductContract = () => {
  const [productContract, setProductContract] = useState();

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

    if (web3) {
      const contractInstance = new web3.eth.Contract(productContractABI, productContractAddress);
      setProductContract(contractInstance);
    } else {
      console.error('Failed to load web3, accounts, or contract. Check console for details.');
    }
  }, []); 

  return productContract;
};

export default useProductContract;
