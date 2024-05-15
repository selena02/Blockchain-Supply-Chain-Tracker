const AccessControlManager = artifacts.require("AccessControlManager");
const ProductContract = artifacts.require("ProductContract");

contract("ProductContract Tests", (accounts) => {
  let accessControl;
  let productContract;
  const [
    admin,
    supplier,
    manufacturer,
    distributor,
    retailer,
    client,
    unauthorized,
  ] = accounts;
  const productPrice = web3.utils.toWei("1", "ether");

  before(async () => {
    accessControl = await AccessControlManager.new({ from: admin });
    productContract = await ProductContract.new(accessControl.address, {
      from: admin,
    });

    // Setup roles
    await accessControl.addParticipant(
      supplier,
      "Supplier",
      "Supply Land",
      await accessControl.RAW_MATERIAL_SUPPLIER_ROLE(),
      { from: admin }
    );
    await accessControl.addParticipant(
      manufacturer,
      "Manufacturer",
      "Factory Place",
      await accessControl.MANUFACTURER_ROLE(),
      { from: admin }
    );
    await accessControl.addParticipant(
      distributor,
      "Distributor",
      "Distribution Hub",
      await accessControl.DISTRIBUTOR_ROLE(),
      { from: admin }
    );
    await accessControl.addParticipant(
      retailer,
      "Retailer",
      "Retail Park",
      await accessControl.RETAILER_ROLE(),
      { from: admin }
    );
    await accessControl.addParticipant(
      client,
      "Client",
      "Clientville",
      await accessControl.CLIENT_ROLE(),
      { from: admin }
    );
  });

  it("should prevent unauthorized roles from adding products", async () => {
    try {
      await productContract.addProduct("Unauthorized Product", "Unauthorized", {
        from: unauthorized,
      });
      assert.fail("Unauthorized role should not be able to add products");
    } catch (error) {
      assert(
        error.message.includes("Only admin can add products"),
        "Error message should indicate permission denial"
      );
    }
  });

  it("should prevent invalid stage updates", async () => {
    await productContract.addProduct(
      "Another Test Product",
      "For invalid stage testing",
      { from: admin }
    );
    await productContract.updateProductStage(1, 1, { from: supplier }); // Assuming this updates it to the first valid stage after 'Ordered'

    try {
      // Try to skip directly to a later stage without going through necessary intermediate stages
      await productContract.updateProductStage(1, 3, { from: distributor }); // Skipping to 'Distributed' without 'Manufactured'
      assert.fail(
        "Should not update to Distributed without being Manufactured first"
      );
    } catch (error) {
      assert(
        error.message.includes("Invalid stage transition"),
        "Error message should indicate stage update issue"
      );
    }
  });

  it("should only allow purchasing at the correct stage and price", async () => {
    await productContract.addProduct(
      "Another Test Product",
      "For purchasing at correct stage",
      { from: admin }
    );
    await productContract.updateProductStage(2, 1, { from: supplier });
    await productContract.updateProductStage(2, 2, { from: manufacturer });
    await productContract.updateProductStage(2, 3, { from: distributor });
    await productContract.updateProductStage(2, 4, { from: retailer });
    await productContract.setProductPrice(2, productPrice, { from: retailer });

    try {
      await productContract.purchaseProduct(2, {
        from: client,
        value: web3.utils.toWei("0.5", "ether"),
      });
      assert.fail("Should not allow purchase with incorrect Ether amount");
    } catch (error) {
      assert(
        error.message.includes("Must pay exactly the product price"),
        "Error message should indicate incorrect payment amount"
      );
    }
  });

  it("should handle product sales correctly, transferring funds and updating state", async () => {
    const initialRetailerBalance = web3.utils.toBN(
      await web3.eth.getBalance(retailer)
    );
    await productContract.purchaseProduct(2, {
      from: client,
      value: productPrice,
    });

    const finalRetailerBalance = web3.utils.toBN(
      await web3.eth.getBalance(retailer)
    );
    assert(
      finalRetailerBalance
        .sub(initialRetailerBalance)
        .eq(web3.utils.toBN(productPrice)),
      "Retailer should receive correct amount"
    );

    const product = await productContract.products(2);
    assert.equal(product.stage.toString(), "5", "Product should be sold");
  });

  it("should reject updates for non-existent product IDs", async () => {
    // Assuming nextProductId will be incremented to 3 after the last addProduct call in previous tests
    const nonExistentProductId = 100;

    try {
      await productContract.updateProductStage(nonExistentProductId, 1, {
        from: supplier,
      }); // Assuming stage 1 is valid here
      assert.fail("Should not update non-existent product");
    } catch (error) {
      assert(
        error.message.includes("Product does not exist"),
        "Error message should indicate that the product does not exist"
      );
    }
  });
});
