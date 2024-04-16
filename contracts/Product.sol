// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AccessControlManager.sol";
import "./libraries/ProductLib.sol";
import "./libraries/StageLib.sol";


contract ProductContract {
    using ProductLib for ProductLib.Product;
    using StageLib for StageLib.ProductStage;

    AccessControlManager accessControl;
 

    struct Product {
        ProductLib.Product details;
        StageLib.ProductStage stage;
        uint256 supplierId;
        uint256 manufacturerId;
        uint256 distributorId;
        uint256 retailerId;
        uint256 clientId;
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId = 1;

    event ProductStageUpdated(uint256 indexed productId, StageLib.ProductStage stage);
    event ProductPurchased(uint256 indexed productId, uint256 clientId, uint256 amountPaid);

    constructor(address accessControlAddress) {
        accessControl = AccessControlManager(accessControlAddress);
    }

    function addProduct(string memory name, string memory description) external {
        require(accessControl.hasRole(accessControl.DEFAULT_ADMIN_ROLE(), msg.sender), "Only admin can add products");
        products[nextProductId].details.createProduct(nextProductId, name, description);
        products[nextProductId].stage = StageLib.ProductStage.Ordered;
        nextProductId++;
    }

    function setProductPrice(uint256 productId, uint256 price) external {
        require(productId < nextProductId && products[productId].stage == StageLib.ProductStage.Retail, "Product is not at retail stage");
        require(accessControl.hasRole(accessControl.RETAILER_ROLE(), msg.sender), "Only retailers can set the price");
        products[productId].details.setPrice(price);
    }

    function updateProductStage(uint256 productId, StageLib.ProductStage newStage) public {
        require(productId < nextProductId, "Product does not exist");
        require(isValidStageTransition(products[productId].stage, newStage), "Invalid stage transition");
        
        
        Product storage product = products[productId];
        uint256 participantId = accessControl.getParticipantId(msg.sender);

        if (newStage == StageLib.ProductStage.RawMaterialsProcured) {
            require(accessControl.hasRole(accessControl.RAW_MATERIAL_SUPPLIER_ROLE(), msg.sender), "Unauthorized: Only raw material suppliers can update to this stage");
            product.supplierId = participantId;
        } else if (newStage == StageLib.ProductStage.Manufactured) {
            require(accessControl.hasRole(accessControl.MANUFACTURER_ROLE(), msg.sender), "Unauthorized: Only manufacturers can update to this stage");
            product.manufacturerId = participantId;
        } else if (newStage == StageLib.ProductStage.Distributed) {
            require(accessControl.hasRole(accessControl.DISTRIBUTOR_ROLE(), msg.sender), "Unauthorized: Only distributors can update to this stage");
            product.distributorId = participantId;
        } else if (newStage == StageLib.ProductStage.Retail) {
            require(accessControl.hasRole(accessControl.RETAILER_ROLE(), msg.sender), "Unauthorized: Only retailers can update to this stage");
            product.retailerId = participantId;
        }    
       
        product.stage = newStage;
        emit ProductStageUpdated(productId, newStage); 
        
    }

    function isValidStageTransition(StageLib.ProductStage currentStage, StageLib.ProductStage newStage) internal pure returns (bool) {
    if (uint(newStage) == uint(currentStage) + 1) {
        return true;
    }
    return false;
}

    function purchaseProduct(uint256 productId) external payable {

        require(productId < nextProductId, "Product does not exist");
        Product storage product = products[productId];

        require (product.stage == StageLib.ProductStage.Retail, "Product should be in Retail in order to buy");
        require(accessControl.hasRole(accessControl.CLIENT_ROLE(), msg.sender), "Unauthorized: Only clients can purchas products");

        if (product.stage == StageLib.ProductStage.Retail) {
            
            require(msg.value == product.details.price, "Must pay exactly the product price");
            address payable recipient = payable(accessControl.getParticipantAddress(product.retailerId));
            recipient.transfer(msg.value); 
            product.clientId = accessControl.getParticipantId(msg.sender);
            product.stage = StageLib.ProductStage.Sold; 
            emit ProductPurchased(productId, product.clientId, msg.value);
            emit ProductStageUpdated(productId, product.stage);
        }
    }

    function getCurrentStage(uint256 productId) external view returns (StageLib.ProductStage) {
        require(productId < nextProductId, "Product does not exist");
        return products[productId].stage;
    }
}
