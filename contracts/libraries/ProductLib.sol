// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ProductLib {
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
    }

    function createProduct(Product storage product, uint256 id, string memory name, string memory description) internal {
        product.id = id;
        product.name = name;
        product.description = description;
        product.price = 0; 
    }

    function setPrice(Product storage product, uint256 price) internal {
        product.price = price;
    }
}
