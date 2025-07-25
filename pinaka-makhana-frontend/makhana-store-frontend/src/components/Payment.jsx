import React, { useState, useEffect } from 'react';
import { useToast } from './context/ToastContext';
import PaymentService from '../services/payment';

const Payment = ({ orderData, onPaymentSuccess, onPaymentError }) => {
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showUPIInput, setShowUPIInput] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEMI, setSelectedEMI] = useState('3');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setPaymentMethods(PaymentService.getAvailablePaymentMethods());
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      let result;
      
      switch (selectedMethod) {
        case 'razorpay':
          result = await PaymentService.initializeRazorpay(orderData);
          break;
          
        case 'upi':
          if (showUPIInput && upiId) {
            result = await PaymentService.processUPIPayment(orderData, upiId);
          } else {
            result = await PaymentService.initializeRazorpay({
              ...orderData,
              preferredMethod: 'upi'
            });
          }
          break;
          
        case 'phonepe':
          result = await PaymentService.initializePhonePe(orderData);
          break;
          
        case 'googlepay':
          result = await PaymentService.initializeGooglePay(orderData);
          break;
          
        case 'paytm':
          result = await PaymentService.initializePaytm(orderData);
          break;
          
        case 'netbanking':
          result = await PaymentService.initializeNetBanking(orderData, selectedBank);
          break;
          
        case 'cod':
          result = await PaymentService.processCOD(orderData);
          break;
          
        case 'emi':
          result = await PaymentService.initializeEMI(orderData, selectedEMI);
          break;
          
        default:
          throw new Error('Payment method not supported');
      }

      if (result) {
        showSuccess('Payment initiated successfully!');
        onPaymentSuccess(result);
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError(error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (methodId) => {
    setSelectedMethod(methodId);
    setShowUPIInput(false);
    setUpiId('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Payment Method</h3>
      
      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleMethodChange(method.id)}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {method.popular && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Popular
              </span>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{method.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedMethod === method.id
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === method.id && (
                  <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPI ID Input */}
      {selectedMethod === 'upi' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">UPI Payment Options</h4>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="upiOption"
                checked={!showUPIInput}
                onChange={() => setShowUPIInput(false)}
                className="mr-3 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm">Pay with any UPI app (Recommended)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="upiOption"
                checked={showUPIInput}
                onChange={() => setShowUPIInput(true)}
                className="mr-3 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm">Enter UPI ID manually</span>
            </label>
          </div>
          
          {showUPIInput && (
            <div className="mt-3">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter your UPI ID (e.g., name@paytm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Net Banking Bank Selection */}
      {selectedMethod === 'netbanking' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Select Your Bank</h4>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Choose your bank</option>
            {PaymentService.getPopularBanks().map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* EMI Tenure Selection */}
      {selectedMethod === 'emi' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Select EMI Tenure</h4>
          <div className="grid grid-cols-3 gap-3">
            {['3', '6', '9', '12', '18', '24'].map((months) => (
              <label
                key={months}
                className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                  selectedEMI === months
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="emi"
                  value={months}
                  checked={selectedEMI === months}
                  onChange={(e) => setSelectedEMI(e.target.value)}
                  className="sr-only"
                />
                <div className="font-semibold">{months} Months</div>
                <div className="text-sm text-gray-600">
                  ₹{Math.ceil(orderData.amount / parseInt(months))}/month
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* COD Information */}
      {selectedMethod === 'cod' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800">Cash on Delivery</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Pay ₹{orderData.amount} in cash when your order is delivered.
                Additional COD charges may apply.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{(orderData.amount - 50).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>₹50.00</span>
          </div>
          {selectedMethod === 'cod' && (
            <div className="flex justify-between">
              <span>COD Charges:</span>
              <span>₹25.00</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total:</span>
            <span>₹{selectedMethod === 'cod' ? (orderData.amount + 25).toFixed(2) : orderData.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-4 mb-6 p-3 bg-green-50 rounded-lg">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-sm text-green-800">
          🔒 Your payment is secured with 256-bit SSL encryption
        </span>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || (selectedMethod === 'netbanking' && !selectedBank) || (showUPIInput && !upiId)}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          `Pay ₹${selectedMethod === 'cod' ? (orderData.amount + 25).toFixed(2) : orderData.amount.toFixed(2)}`
        )}
      </button>

      {/* Accepted Payment Methods */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">We accept</p>
        <div className="flex justify-center space-x-4 text-2xl">
          <span title="Visa">💳</span>
          <span title="Mastercard">💳</span>
          <span title="RuPay">🇮🇳</span>
          <span title="UPI">📱</span>
          <span title="Net Banking">🏦</span>
          <span title="Wallets">💰</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
