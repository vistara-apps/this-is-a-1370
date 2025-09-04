import React, { useState, useEffect } from 'react';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { useCreatePayment, useCompletePayment, useApproveUSDC, useUSDCInfo } from '../hooks/useContract';
import { apiService, pinataService } from '../services/api';
import { Wallet, CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

const PaymentButton = ({ amount, fileId, fileName, onSuccess, variant = 'crypto' }) => {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  
  const { createSession } = usePaymentContext();
  const { address, isConnected } = useAccount();
  const { createPayment, isLoading: isCreatingPayment } = useCreatePayment();
  const { completePayment, isLoading: isCompletingPayment } = useCompletePayment();
  const { approveUSDC, isLoading: isApproving } = useApproveUSDC();
  const { balance, allowance, hasEnoughBalance, hasEnoughAllowance } = useUSDCInfo(address);

  // Check if approval is needed
  useEffect(() => {
    if (isConnected && amount) {
      setNeedsApproval(!hasEnoughAllowance(amount));
    }
  }, [isConnected, amount, allowance]);

  const handlePayment = async () => {
    if (paid || !isConnected || !fileId) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (variant === 'crypto') {
        // Check balance
        if (!hasEnoughBalance(amount)) {
          throw new Error(`Insufficient USDC balance. You need $${amount.toFixed(3)} USDC.`);
        }

        // Step 1: Approve USDC if needed
        if (needsApproval) {
          setStep('Approving USDC...');
          await approveUSDC(amount);
          setNeedsApproval(false);
        }

        // Step 2: Create payment on blockchain
        setStep('Creating payment...');
        const paymentTx = await createPayment(fileId);
        const paymentId = paymentTx.hash; // This would be the actual payment ID from the contract

        // Step 3: Complete payment
        setStep('Completing payment...');
        await completePayment(paymentId);

        // Step 4: Generate secure download link
        setStep('Generating download link...');
        const downloadData = {
          fileId,
          buyerWalletAddress: address,
          paymentTxHash: paymentTx.hash,
        };
        
        const downloadRecord = await apiService.createDownload(downloadData);
        
        // Get file metadata to generate signed URL
        const fileData = await apiService.getFile(fileId);
        const signedUrl = await pinataService.generateSignedUrl(
          fileData.ipfsHash,
          fileData.accessDuration * 3600 // Convert hours to seconds
        );
        
        setDownloadUrl(signedUrl);
        setPaid(true);
        setStep('Payment completed!');
        
        onSuccess?.(signedUrl, downloadRecord);
        
      } else {
        // Stripe payment fallback
        setStep('Processing payment...');
        await createSession(`$${amount.toFixed(3)}`);
        setPaid(true);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  // Show error if any
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <button
          onClick={() => setError('')}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-dark-text rounded-lg font-medium hover:bg-dark-bg transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show success state
  if (paid) {
    return (
      <div className="space-y-3">
        <button 
          disabled
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>✓ Purchase Complete</span>
        </button>
        {downloadUrl && (
          <button
            onClick={() => window.open(downloadUrl, '_blank')}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-600 transition-all duration-200"
          >
            <Wallet className="w-4 h-4" />
            <span>Download File</span>
          </button>
        )}
      </div>
    );
  }

  // Show wallet connection requirement
  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-orange-400" />
        <p className="text-orange-400 text-sm">Connect wallet to purchase</p>
      </div>
    );
  }

  // Show insufficient balance warning
  if (variant === 'crypto' && !hasEnoughBalance(amount)) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-red-400 text-sm font-medium">Insufficient Balance</p>
            <p className="text-red-300 text-xs">
              You have ${balance.toFixed(3)} USDC, need ${amount.toFixed(3)} USDC
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main payment button
  return (
    <div className="space-y-3">
      {/* Balance info for crypto payments */}
      {variant === 'crypto' && (
        <div className="text-xs text-dark-muted">
          Balance: ${balance.toFixed(3)} USDC
          {needsApproval && (
            <span className="text-orange-400 ml-2">• Approval required</span>
          )}
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={loading || !isConnected}
        className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
          variant === 'crypto'
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{step || 'Processing...'}</span>
          </>
        ) : (
          <>
            {variant === 'crypto' ? (
              <Wallet className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            <span>
              {needsApproval ? 'Approve & Buy' : 'Buy Now'} - ${amount.toFixed(3)}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentButton;
