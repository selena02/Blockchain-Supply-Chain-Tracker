// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ParticipantLib {
    struct Participant {
        uint256 id;
        address participantAddress;
        string name;
        string place;
        bytes32 role;
    }

    struct Data {
        uint256 nextId;
        mapping(uint256 => Participant) participants;
        mapping(address => uint256) participantIds;
    }

    function addParticipant(Data storage data, address participantAddress, string memory name, string memory place, bytes32 role) internal returns (uint256) {
        require(data.participantIds[participantAddress] == 0, "Participant already exists");

        data.participants[data.nextId] = Participant({
            id: data.nextId,
            name: name,
            place: place,
            participantAddress: participantAddress,
            role: role
        });
        data.participantIds[participantAddress] = data.nextId;

        return data.nextId++;
    }

    function getParticipant(Data storage data, uint256 id) internal view returns (Participant memory) {
        require(id < data.nextId && id > 0, "Participant does not exist");
        return data.participants[id];
    }

    function getParticipantId(Data storage data, address participantAddress) internal view returns (uint256) {
        require(data.participantIds[participantAddress] != 0, "Participant does not exist");
        return data.participantIds[participantAddress];
    }

    function getParticipantAddress(Data storage data, uint256 id) internal view returns (address) {
        require(id < data.nextId && id > 0, "Participant does not exist");
        return data.participants[id].participantAddress;
    }
}
