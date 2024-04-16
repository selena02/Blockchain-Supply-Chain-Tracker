// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library StageLib {
    enum ProductStage {
        Ordered,
        RawMaterialsProcured,
        Manufactured,
        Distributed,
        Retail,
        Sold
    }

    function nextStage(ProductStage currentStage) internal pure returns (ProductStage) {
        require(uint(currentStage) < uint(ProductStage.Sold), "Final stage reached.");
        return ProductStage(uint(currentStage) + 1);
    }
}
