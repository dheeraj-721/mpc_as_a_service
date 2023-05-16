import { BigNumber, ethers } from 'ethers';

export class UserOp {
  sender: string;
  message: string;
  to: string;
  amount: BigNumber;
  signature: Signature;
}

export class Signature {
  r: string;
  s: string;
  v: number;
}

export class transactionObject {
  nonce: string; // The nonce of the transaction
  gasPrice: BigNumber; // Gas price in gwei
  gasLimit: string; // Gas limit
  to: string; // The receiver's Ethereum address
  value: BigNumber; // Sending 1 Ether
  data: string;
};

export type transaction = {
  nonce?: number; // The nonce of the transaction
  gasPrice?: BigNumber; // Gas price in gwei
  gasLimit?: string; // Gas limit
  to?: string; // The receiver's Ethereum address
  value?: BigNumber; // Sending 1 Ether
  data?: string;
};


export type transactionObj = {
  nonce: number; // The nonce of the transaction
  gasPrice: BigNumber; // Gas price in gwei
  gasLimit: string; // Gas limit
  to: string; // The receiver's Ethereum address
  value: BigNumber; // Sending 1 Ether
  data: string;
};

export const buildTransaction = (params?: transaction):transactionObj => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  return {
    nonce: params?.nonce ?? 0, // The nonce of the transaction
    gasPrice: ethers.utils.parseUnits(`${params?.gasPrice ?? 100}`, 'gwei'), // Gas price in gwei
    gasLimit: ethers.utils.hexlify(params?.gasLimit ?? 21000), // Gas limit
    to: params?.to ?? ZERO_ADDRESS, // The receiver's Ethereum address
    value: ethers.utils.parseEther(`${params?.value ?? 0}`), // Sending 1 Ether
    data: params?.data ?? '0x',
  };
};
