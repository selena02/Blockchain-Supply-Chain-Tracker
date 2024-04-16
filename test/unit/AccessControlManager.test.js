const AccessControlManager = artifacts.require("AccessControlManager");

contract("AccessControlManager", (accounts) => {
  let accessControlManager;

  before(async () => {
    accessControlManager = await AccessControlManager.new({
      from: accounts[0],
    });
  });

  it("should have admin role for deploying address", async () => {
    const isAdmin = await accessControlManager.hasRole(
      await accessControlManager.DEFAULT_ADMIN_ROLE(),
      accounts[0]
    );
    assert.isTrue(isAdmin, "Deploying address should have admin role");
  });

  it("should add participant and retrieve details correctly", async () => {
    const participantAddress = accounts[1];
    const name = "Participant";
    const place = "Some Place";
    const role = await accessControlManager.RAW_MATERIAL_SUPPLIER_ROLE();

    await accessControlManager.addParticipant(
      participantAddress,
      name,
      place,
      role
    );

    const participantId = await accessControlManager.getParticipantId(
      participantAddress
    );
    assert.notEqual(
      participantId.toNumber(),
      0,
      "Participant ID should not be zero"
    );

    const participant = await accessControlManager.getParticipantDetails(
      participantId
    );
    assert.equal(
      participant.participantAddress,
      participantAddress,
      "Participant address should match"
    );
    assert.equal(participant.name, name, "Participant name should match");
    assert.equal(participant.place, place, "Participant place should match");
    assert.equal(participant.role, role, "Participant role should match");
  });

  it("should assign role to participant", async () => {
    const participantAddress = accounts[1];
    const role = await accessControlManager.RAW_MATERIAL_SUPPLIER_ROLE();

    const hasRole = await accessControlManager.hasRole(
      role,
      participantAddress
    );
    assert.isTrue(hasRole, "Participant should have assigned role");
  });

  it("should not allow adding participant with duplicate address", async () => {
    const participantAddress = accounts[1];
    const name = "Duplicate Participant";
    const place = "Another Place";
    const role = await accessControlManager.RAW_MATERIAL_SUPPLIER_ROLE();

    try {
      await accessControlManager.addParticipant(
        participantAddress,
        name,
        place,
        role
      );
      assert.fail("Adding participant with duplicate address should fail");
    } catch (error) {
      assert(
        error.message.includes("Participant already exists"),
        "Error message should indicate participant already exists"
      );
    }
  });

  it("should only allow admin to add participant", async () => {
    const participantAddress = accounts[2];
    const name = "Admin Participant";
    const place = "Admin Place";
    const role = await accessControlManager.RAW_MATERIAL_SUPPLIER_ROLE();

    try {
      await accessControlManager.addParticipant(
        participantAddress,
        name,
        place,
        role,
        { from: accounts[1] }
      );
      assert.fail("Non-admin should not be able to add participant");
    } catch (error) {
      assert(
        error.message.includes(
          "Access Denied: Only admins can perform this action"
        ),
        "Error message should indicate access denied"
      );
    }
  });

  it("should handle invalid role assignment gracefully", async () => {
    const participantAddress = accounts[3];
    const name = "Invalid Role Participant";
    const place = "Invalid Role Place";
    const invalidRole = await accessControlManager.DEFAULT_ADMIN_ROLE(); // Using admin role as an invalid role

    try {
      await accessControlManager.addParticipant(
        participantAddress,
        name,
        place,
        invalidRole
      );
      assert.fail("Invalid role assignment should fail");
    } catch (error) {
      assert(
        error.message.includes("Invalid role"),
        "Error message should indicate invalid role"
      );
    }
  });

  it("should retrieve participant details by ID", async () => {
    const participantAddress = accounts[4];
    const name = "ID Participant";
    const place = "ID Place";
    const role = await accessControlManager.MANUFACTURER_ROLE();

    await accessControlManager.addParticipant(
      participantAddress,
      name,
      place,
      role
    );

    const participantId = await accessControlManager.getParticipantId(
      participantAddress
    );
    const participant = await accessControlManager.getParticipantDetails(
      participantId
    );

    assert.equal(
      participant.participantAddress,
      participantAddress,
      "Participant address should match"
    );
    assert.equal(participant.name, name, "Participant name should match");
    assert.equal(participant.place, place, "Participant place should match");
    assert.equal(participant.role, role, "Participant role should match");
  });

  it("should retrieve participant address by ID", async () => {
    const participantAddress = accounts[5];
    const name = "Address Participant";
    const place = "Address Place";
    const role = await accessControlManager.DISTRIBUTOR_ROLE();

    await accessControlManager.addParticipant(
      participantAddress,
      name,
      place,
      role
    );

    const participantId = await accessControlManager.getParticipantId(
      participantAddress
    );
    const retrievedAddress = await accessControlManager.getParticipantAddress(
      participantId
    );

    assert.equal(
      retrievedAddress,
      participantAddress,
      "Retrieved address should match participant address"
    );
  });

  it("should emit ParticipantAdded event when adding participant", async () => {
    const participantAddress = accounts[6];
    const name = "Event Participant";
    const place = "Event Place";
    const role = await accessControlManager.RETAILER_ROLE();

    const tx = await accessControlManager.addParticipant(
      participantAddress,
      name,
      place,
      role
    );
    const participantId = await accessControlManager.getParticipantId(
      participantAddress
    );

    const event = tx.logs.find((log) => log.event === "ParticipantAdded");
    assert.isDefined(event, "ParticipantAdded event should be emitted");
    assert.equal(
      event.args.id.toNumber(),
      participantId.toNumber(),
      "Event should contain correct participant ID"
    );
    assert.equal(
      event.args.participantAddress,
      participantAddress,
      "Event should contain correct participant address"
    );
    assert.equal(event.args.role, role, "Event should contain correct role");
  });

  it("should handle empty name and place gracefully", async () => {
    const participantAddress = accounts[7];
    const name = ""; // Empty name
    const place = ""; // Empty place
    const role = await accessControlManager.CLIENT_ROLE();

    const tx = await accessControlManager.addParticipant(
      participantAddress,
      name,
      place,
      role
    );
    const participantId = await accessControlManager.getParticipantId(
      participantAddress
    );
    const participant = await accessControlManager.getParticipantDetails(
      participantId
    );

    assert.equal(
      participant.participantAddress,
      participantAddress,
      "Participant address should match"
    );
    assert.equal(participant.name, name, "Participant name should be empty");
    assert.equal(participant.place, place, "Participant place should be empty");
    assert.equal(participant.role, role, "Participant role should match");
  });

  it("should handle non-existent participant gracefully", async () => {
    const nonExistentParticipantAddress = accounts[8];

    try {
      await accessControlManager.getParticipantId(
        nonExistentParticipantAddress
      );
      assert.fail("Getting ID of non-existent participant should fail");
    } catch (error) {
      assert(
        error.message.includes("Participant does not exist"),
        "Error message should indicate participant does not exist"
      );
    }

    try {
      await accessControlManager.getParticipantDetails(9999); // Invalid ID
      assert.fail("Getting details of non-existent participant should fail");
    } catch (error) {
      assert(
        error.message.includes("Participant does not exist"),
        "Error message should indicate participant does not exist"
      );
    }

    try {
      await accessControlManager.getParticipantAddress(9999); // Invalid ID
      assert.fail("Getting address of non-existent participant should fail");
    } catch (error) {
      assert(
        error.message.includes("Participant does not exist"),
        "Error message should indicate participant does not exist"
      );
    }
  });
});
