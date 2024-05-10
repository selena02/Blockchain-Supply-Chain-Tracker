import React, { useState, useEffect } from 'react';
import web3 from 'web3';
import useContract from '../hooks/useContract';
import AccessControlManagerABI from '../contracts/AccessControlManager.json';
import '../style/AddParticipantForm.css'; 

const AddParticipantForm = ({ contractAddress }) => {
  const accessControlManager = useContract(AccessControlManagerABI.abi, contractAddress);
  const [participantAddress, setParticipantAddress] = useState('');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [role, setRole] = useState('');
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem('participants');
    return savedParticipants ? JSON.parse(savedParticipants) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const bytes32Role = web3.utils.asciiToHex(role);
      const paddedRole = bytes32Role.padEnd(66, '0');
      console.log(account);
      await accessControlManager.methods.addParticipant(participantAddress, name, place, paddedRole).send({from: account});

      const newParticipant = { address: participantAddress, name, place, role };
      setParticipants(prevParticipants => [...prevParticipants, newParticipant]);

      alert('Participant added successfully!');
      setParticipantAddress('');
      setName('');
      setPlace('');
      setRole('');
    } catch (error) {
      alert(`Failed to add participant: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-participant-form">
      <h2>Add New Participant</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            value={participantAddress}
            onChange={(e) => setParticipantAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
        </div>
        <div className="form-group">
          <label>Place:</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="City/Country"
            required
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="RAW_MATERIAL_SUPPLIER_ROLE">Raw Material Supplier</option>
            <option value="MANUFACTURER_ROLE">Manufacturer</option>
            <option value="DISTRIBUTOR_ROLE">Distributor</option>
            <option value="RETAILER_ROLE">Retailer</option>
            <option value="CLIENT_ROLE">Client</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Participant'}
          </button>
        </div>
      </form>

      <h3>Added Participants</h3>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>
            {participant.name} ({participant.role}) - {participant.place} - {participant.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddParticipantForm;
