const AccessControlManager = artifacts.require("AccessControlManager");
const ProductContract = artifacts.require("ProductContract");

module.exports = function (deployer) {
  deployer.deploy(AccessControlManager).then(function () {
    // Use the deployed `AccessControlManager` address to deploy `ProductContract`
    return deployer.deploy(ProductContract, AccessControlManager.address);
  });
};
