import AccessControlManager from './contracts/AccessControlManager.json';
import ProductContract from './contracts/ProductContract.json';

export const accessControlManagerABI = AccessControlManager.abi;
export const productContractABI = ProductContract.abi;

const networkId = '5777'; 

export const accessControlManagerAddress = AccessControlManager.networks[networkId].address;
export const productContractAddress = ProductContract.networks[networkId].address;
