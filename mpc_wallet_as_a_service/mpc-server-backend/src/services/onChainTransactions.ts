// const { ethers } = require("ethers");
import * as ethers from 'ethers';
import { entrypointABI } from './entrypointABI';
import { providers } from './provider';
import { transaction, transactionObject, UserOp } from './types';
import { walletABI } from './walletABI';

export const deployWallet = async (owner: string, salt: string) => {
  const { signer } = providers();

  const entrypointAddress = '0xc9B2DFE2318Ad7Ce7F290EA0D1aAD0354A874467';

  const entrypointContract = new ethers.Contract(
    entrypointAddress,
    entrypointABI,
    signer,
  );
  console.log('OwnerMPC::::::::::::', owner);
  const tx = await entrypointContract.createWallet(
    entrypointAddress,
    owner,
    salt,
  );
  console.log('Executed Wallet and send ether::::::', tx);
  // entrypointContract.on('Deployed', async (arg1, arg2) => {
  //   address = arg1;
  //   console.log('Deployed wallet was emitted with args:', arg1, arg2);
  //   return address;
  // });
  const value = await getValueFromContractEvent(entrypointContract, 'Deployed');
  console.log(value);
  return { address: value };
};

export const submitTransaction = async (
  owner: string,
  amount:number,
  trannsactData: transaction,
  r: string,
  s: string,
  v: number,
) => {
  const { provider } = providers();
  trannsactData.value = ethers.utils.parseEther(`${amount}`);
  const rV = `0x${r}`;
  const sV = `0x${s}`;
  const vV = ethers.utils.hexlify(v);
  let nonce = ethers.utils.hexlify(await provider.getTransactionCount(owner));
  while (nonce.length > 2 && nonce.slice(2, 4) === '00') {
    nonce = '0x' + nonce.slice(4);
  }
  console.log("transactionObject::::",trannsactData);
  
  const signedTransaction = ethers.utils.RLP.encode([
    nonce,
    ethers.utils.hexlify(trannsactData.gasPrice),
    ethers.utils.hexlify(trannsactData.gasLimit),
    ethers.utils.hexlify(trannsactData.to),
    ethers.utils.hexlify(trannsactData.value),
    ethers.utils.hexlify(trannsactData.data),
    vV,
    rV,
    sV,
  ]);
  const txResult = await provider.sendTransaction(signedTransaction);
  console.log(
    `Transaction sent! Hash:${JSON.stringify(txResult)}:::::: ${txResult.hash}`,
    'Nonce:::',
    nonce,
  );

  const receipt = await provider.waitForTransaction(txResult.hash);
  console.log(`Transaction mined! Block number: ${receipt.blockNumber}`);
  return txResult.hash;
};

function getValueFromContractEvent(contract, eventName) {
  return new Promise((resolve, reject) => {
    contract.on(eventName, (value) => {
      resolve(value);
    });
  });
}

export const getAddress = (pubKey: string) => {
  console.log(pubKey);
  const buffer = JSON.parse(pubKey);
  const hash = Buffer.from(buffer).toString('hex');
  const addr = ethers.utils.computeAddress(`0x${hash}`);
  return addr;
};

export const getBalance = async (account: string) => {
  const { signer } = providers();
  const entrypointAddress = '0xc9B2DFE2318Ad7Ce7F290EA0D1aAD0354A874467';
  const entrypointContract = new ethers.Contract(
    entrypointAddress,
    entrypointABI,
    signer,
  );
  const bal = await entrypointContract.getBalanceOf(account);
  console.log('Funded Wallet ::::::', bal);
  return bal;
};

export const fundWallet = async (addr: string) => {
  const { signer } = providers();
  const entrypointAddress = '0xc9B2DFE2318Ad7Ce7F290EA0D1aAD0354A874467';
  const entrypointContract = new ethers.Contract(
    entrypointAddress,
    entrypointABI,
    signer,
  );
  const tx = await entrypointContract.fundWallet(addr);
  console.log('Funded Wallet ::::::', tx.hash);
  return tx.hash;
};

export const executeUserOperation = async (userOp: UserOp) => {
  const { signer } = providers();
  const entrypointAddress = '0xc9B2DFE2318Ad7Ce7F290EA0D1aAD0354A874467';
  const entrypointContract = new ethers.Contract(
    entrypointAddress,
    entrypointABI,
    signer,
  );
  userOp.amount = ethers.utils.parseEther(`${userOp.amount}`);
  const tx = await entrypointContract.handleOps(userOp);
  console.log('Executed Wallet and sent ether::::::', tx.hash);
  return tx.hash;
};

export const getHash = async (from: string, amount:number, transactionData: transaction) => {
  console.log('Data:::', typeof transactionData, transactionData);
  // const {from, to, amount} = JSON.parse(str);
  // const data = Buffer.from(str).toString('hex')
  // console.log(data);
  // const hashed = ethers.utils.keccak256(`0x${data}`);
  transactionData.value = ethers.utils.parseEther(`${amount}`);
  const hash = await getRawTransaction(from, transactionData);
  return hash;
};

const getRawTransaction = async (
  owner: string,
  transactionData: transaction,
) => {
  const { provider } = providers();
  // const transaction = {
  //   nonce: await provider.getTransactionCount(owner), // The nonce of the transaction
  //   gasPrice: ethers.utils.parseUnits("300", "gwei"), // Gas price in gwei
  //   gasLimit: ethers.utils.hexlify(21000), // Gas limit
  //   to: receiver, // The receiver's Ethereum address
  //   value: ethers.utils.parseEther(`${amount}`), // Sending 1 Ether
  //   data: "0x",
  // };
  console.log('transactionData:::::::::::::', transactionData);
  let nonce = ethers.utils.hexlify(await provider.getTransactionCount(owner));
  while (nonce.length > 2 && nonce.slice(2, 4) === '00') {
    nonce = '0x' + nonce.slice(4);
  }
  const transactionBuffer = ethers.utils.RLP.encode([
    nonce,
    ethers.utils.hexlify(transactionData.gasPrice),
    ethers.utils.hexlify(transactionData.gasLimit),
    ethers.utils.hexlify(transactionData.to),
    ethers.utils.hexlify(transactionData.value),
    ethers.utils.hexlify(transactionData.data),
  ]);

  // const privateKey = "addd74c3d818f60f7ff450f8a2904d46ef7e6ad0344a8ae3ef98adaf426b9e54";
  const messageHash = ethers.utils.keccak256(transactionBuffer);
  console.log('MessageHas::::::::', messageHash);
  return messageHash;
};

export const getCallData = (to: string, value: number) => {
  const walletInterface = new ethers.utils.Interface(walletABI);
  const args = [to, value];
  return walletInterface.encodeFunctionData('executeOp', args);
};

export const getOwner = async () => {
  const { signer } = providers();
  const walletAddress = '0xA1beE97e6D3050beAC16f585D8d1F60a4bBF5626';

  const walletContract = new ethers.Contract(walletAddress, walletABI, signer);
  const tx = await walletContract.getOwner();
  console.log('Executed Wallet and send ether::::::', tx);
};
