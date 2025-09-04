import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';

// Contract addresses (update with deployed addresses)
const FILEPAY_CONTRACT_ADDRESS = import.meta.env.VITE_FILEPAY_CONTRACT_ADDRESS || '0x...';
const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

// Contract ABIs
const FILEPAY_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "fileId", "type": "string"}, {"internalType": "uint256", "name": "price", "type": "uint256"}],
    "name": "registerFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "fileId", "type": "string"}],
    "name": "createPayment",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "paymentId", "type": "bytes32"}],
    "name": "completePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "paymentId", "type": "bytes32"}],
    "name": "getPayment",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "fileId", "type": "string"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "address", "name": "buyer", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "completed", "type": "bool"}
        ],
        "internalType": "struct FilePay.FilePayment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "paymentId", "type": "bytes32"}],
    "name": "isPaymentValid",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "fileCreators",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "filePrices",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDC_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useFilePayContract = () => {
  return {
    address: FILEPAY_CONTRACT_ADDRESS,
    abi: FILEPAY_ABI,
  };
};

export const useUSDCContract = () => {
  return {
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
  };
};

// Hook for registering a file on the blockchain
export const useRegisterFile = () => {
  const { writeContract, data, error, isPending } = useWriteContract();

  const registerFile = async (fileId, priceInUSD) => {
    // Convert USD price to USDC units (6 decimals)
    const priceInUSDC = parseUnits(priceInUSD.toString(), 6);
    
    return writeContract({
      address: FILEPAY_CONTRACT_ADDRESS,
      abi: FILEPAY_ABI,
      functionName: 'registerFile',
      args: [fileId, priceInUSDC],
    });
  };

  return {
    registerFile,
    data,
    error,
    isLoading: isPending,
  };
};

// Hook for creating a payment
export const useCreatePayment = () => {
  const { writeContract, data, error, isPending } = useWriteContract();

  const createPayment = async (fileId) => {
    return writeContract({
      address: FILEPAY_CONTRACT_ADDRESS,
      abi: FILEPAY_ABI,
      functionName: 'createPayment',
      args: [fileId],
    });
  };

  return {
    createPayment,
    data,
    error,
    isLoading: isPending,
  };
};

// Hook for completing a payment
export const useCompletePayment = () => {
  const { writeContract, data, error, isPending } = useWriteContract();

  const completePayment = async (paymentId) => {
    return writeContract({
      address: FILEPAY_CONTRACT_ADDRESS,
      abi: FILEPAY_ABI,
      functionName: 'completePayment',
      args: [paymentId],
    });
  };

  return {
    completePayment,
    data,
    error,
    isLoading: isPending,
  };
};

// Hook for approving USDC spending
export const useApproveUSDC = () => {
  const { writeContract, data, error, isPending } = useWriteContract();

  const approveUSDC = async (amountInUSD) => {
    // Convert USD to USDC units and add some buffer for fees
    const amountInUSDC = parseUnits((amountInUSD * 1.1).toString(), 6); // 10% buffer
    
    return writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [FILEPAY_CONTRACT_ADDRESS, amountInUSDC],
    });
  };

  return {
    approveUSDC,
    data,
    error,
    isLoading: isPending,
  };
};

// Hook for reading file information
export const useFileInfo = (fileId) => {
  const { data: creator } = useReadContract({
    address: FILEPAY_CONTRACT_ADDRESS,
    abi: FILEPAY_ABI,
    functionName: 'fileCreators',
    args: [fileId],
    query: {
      enabled: !!fileId,
    },
  });

  const { data: priceRaw } = useReadContract({
    address: FILEPAY_CONTRACT_ADDRESS,
    abi: FILEPAY_ABI,
    functionName: 'filePrices',
    args: [fileId],
    query: {
      enabled: !!fileId,
    },
  });

  const price = priceRaw ? parseFloat(formatUnits(priceRaw, 6)) : 0;

  return {
    creator,
    price,
    isRegistered: !!creator && creator !== '0x0000000000000000000000000000000000000000',
  };
};

// Hook for reading payment information
export const usePaymentInfo = (paymentId) => {
  const { data: payment, isLoading } = useReadContract({
    address: FILEPAY_CONTRACT_ADDRESS,
    abi: FILEPAY_ABI,
    functionName: 'getPayment',
    args: [paymentId],
    query: {
      enabled: !!paymentId,
    },
  });

  const { data: isValid } = useReadContract({
    address: FILEPAY_CONTRACT_ADDRESS,
    abi: FILEPAY_ABI,
    functionName: 'isPaymentValid',
    args: [paymentId],
    query: {
      enabled: !!paymentId,
    },
  });

  return {
    payment: payment ? {
      fileId: payment.fileId,
      creator: payment.creator,
      buyer: payment.buyer,
      amount: parseFloat(formatUnits(payment.amount, 6)),
      timestamp: Number(payment.timestamp),
      completed: payment.completed,
    } : null,
    isValid,
    isLoading,
  };
};

// Hook for reading USDC balance and allowance
export const useUSDCInfo = (userAddress) => {
  const { data: balance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: allowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [userAddress, FILEPAY_CONTRACT_ADDRESS],
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    balance: balance ? parseFloat(formatUnits(balance, 6)) : 0,
    allowance: allowance ? parseFloat(formatUnits(allowance, 6)) : 0,
    hasEnoughBalance: (amount) => balance ? parseFloat(formatUnits(balance, 6)) >= amount : false,
    hasEnoughAllowance: (amount) => allowance ? parseFloat(formatUnits(allowance, 6)) >= amount : false,
  };
};

// Utility function to generate file ID
export const generateFileId = (fileName, creatorAddress, timestamp) => {
  return `${creatorAddress}-${fileName}-${timestamp}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
};

export default {
  useFilePayContract,
  useUSDCContract,
  useRegisterFile,
  useCreatePayment,
  useCompletePayment,
  useApproveUSDC,
  useFileInfo,
  usePaymentInfo,
  useUSDCInfo,
  generateFileId,
};
