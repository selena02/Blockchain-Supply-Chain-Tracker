import React, { useState, useEffect } from "react";
import Web3 from "web3";
import useContract from "../hooks/useContract";
import AccessControlManagerABI from "../contracts/AccessControlManager.json";
import "../style/AddParticipantForm.css";

const AddParticipantForm = ({ contractAddress }) => {
  const web3 = new Web3(window.ethereum); // Initialize Web3 instance
  const accessControlManager = useContract(
    AccessControlManagerABI.abi,
    contractAddress
  );
  const [participantAddress, setParticipantAddress] = useState("");
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [role, setRole] = useState("");
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem("participants");
    return savedParticipants ? JSON.parse(savedParticipants) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

  useEffect(() => {
    localStorage.setItem("participants", JSON.stringify(participants));
  }, [participants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Reset error message for new submission
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      // Convert role to bytes32 using Web3's utils
      const roleMapping = {
        RAW_MATERIAL_SUPPLIER_ROLE: web3.utils.keccak256(
          "RAW_MATERIAL_SUPPLIER_ROLE"
        ),
        MANUFACTURER_ROLE: web3.utils.keccak256("MANUFACTURER_ROLE"),
        DISTRIBUTOR_ROLE: web3.utils.keccak256("DISTRIBUTOR_ROLE"),
        RETAILER_ROLE: web3.utils.keccak256("RETAILER_ROLE"),
        CLIENT_ROLE: web3.utils.keccak256("CLIENT_ROLE"),
      };

      const bytes32Role = roleMapping[role];
      if (!bytes32Role) {
        throw new Error("Invalid role selected");
      }

      const gasEstimate = await accessControlManager.methods
        .addParticipant(participantAddress, name, place, bytes32Role)
        .estimateGas({ from: account });

      await accessControlManager.methods
        .addParticipant(participantAddress, name, place, bytes32Role)
        .send({ from: account, gas: gasEstimate });

      const newParticipant = { address: participantAddress, name, place, role };
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        newParticipant,
      ]);

      alert("Participant added successfully!");
      setParticipantAddress("");
      setName("");
      setPlace("");
      setRole("");
    } catch (error) {
      setErrorMessage(error.message);
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="RAW_MATERIAL_SUPPLIER_ROLE">
              Raw Material Supplier
            </option>
            <option value="MANUFACTURER_ROLE">Manufacturer</option>
            <option value="DISTRIBUTOR_ROLE">Distributor</option>
            <option value="RETAILER_ROLE">Retailer</option>
            <option value="CLIENT_ROLE">Client</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Participant"}
          </button>
        </div>
      </form>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <h3>Added Participants</h3>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>
            {participant.name} ({participant.role}) - {participant.place} -{" "}
            {participant.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddParticipantForm;
