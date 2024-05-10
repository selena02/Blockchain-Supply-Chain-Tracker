
import React, { useEffect } from 'react';
import useContract from '../hooks/useContract';

const MyComponent = () => {
  const contract = useContract();

  useEffect(() => {
    const loadData = async () => {
      if (contract) {
        const details = await contract.methods.getParticipantDetails(1).call();
        console.log(details);
      }
    };

    loadData();
  }, [contract]);

  return <div>...</div>;
};

export default MyComponent;
