// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/ParticipantLib.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccessControlManager is AccessControl {
    using ParticipantLib for ParticipantLib.Data;

    bytes32 public constant RAW_MATERIAL_SUPPLIER_ROLE = keccak256("RAW_MATERIAL_SUPPLIER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");

    ParticipantLib.Data private participantData;

    event ParticipantAdded(uint256 indexed id, address indexed participantAddress, bytes32 role);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        participantData.nextId = 1;
    }

    function addParticipant(address participantAddress, string memory name, string memory place, bytes32 role) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Access Denied: Only admins can perform this action");
        require(isRoleValid(role), "Invalid role: valid roles are RAW_MATERIAL_SUPPLIER, MANUFACTURER, DISTRIBUTOR, RETAILER, CLIENT");
        require(participantAddress != address(0), "Invalid address: address is zero");
        require(participantData.participantIds[participantAddress] == 0, "Participant already exists");

        uint256 id = participantData.addParticipant(participantAddress, name, place, role);
        _grantRole(role, participantAddress);
        emit ParticipantAdded(id, participantAddress, role);
    }

    function getParticipantId(address participantAddress) public view returns (uint256) {
        return participantData.getParticipantId(participantAddress);
    }

    function getParticipantAddress(uint256 id) public view returns (address) {
        return participantData.getParticipantAddress(id);
    }

    function getParticipantDetails(uint256 id) external view returns (ParticipantLib.Participant memory) {
        return participantData.getParticipant(id);
    }

    function isRoleValid(bytes32 role) private pure returns (bool) {
        return role == RAW_MATERIAL_SUPPLIER_ROLE || 
               role == MANUFACTURER_ROLE ||
               role == DISTRIBUTOR_ROLE || 
               role == RETAILER_ROLE ||
               role == CLIENT_ROLE;
    }
}
