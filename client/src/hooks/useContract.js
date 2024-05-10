import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { accessControlManagerABI, accessControlManagerAddress } from '../contracts';

const useContract = () => {
  const [contract, setContract] = useState();

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const myContract = new web3.eth.Contract(accessControlManagerABI, accessControlManagerAddress);
    setContract(myContract);
  }, []);

  return contract;
};

export default useContract;
