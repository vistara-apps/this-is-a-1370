import React, { useState } from 'react';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { Wallet, CreditCard, Loader2 } from 'lucide-react';

const PaymentButton = ({ amount, onSuccess, variant = 'crypto' }) => {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const { createSession } = usePaymentContext();

  const handlePayment = async () => {
    if (paid) return;
    
    setLoading(true);
    try {
      if (variant === 'crypto') {
        await createSession(`$${amount.toFixed(3)}`);
      } else {
        // Simulate Stripe payment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      setPaid(true);
      onSuccess?.();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <button 
        disabled
        className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
      >
        <span>✓ Purchased</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
        variant === 'crypto'
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : variant === 'crypto' ? (
        <Wallet className="w-4 h-4" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      <span>{loading ? 'Processing...' : 'Buy Now'}</span>
    </button>
  );
};

export default PaymentButton;