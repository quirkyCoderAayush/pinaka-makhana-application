// Payment Gateway Integration for India
// Supporting Razorpay, Paytm, PhonePe, Google Pay, and other popular Indian payment methods

class PaymentService {
  constructor() {
    this.razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_key';
    this.paytmMerchantId = process.env.REACT_APP_PAYTM_MERCHANT_ID || 'test_merchant';
  }

  // Razorpay Integration (Most popular in India)
  async initializeRazorpay(orderData) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      script.onload = () => {
        const options = {
          key: this.razorpayKeyId,
          amount: orderData.amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Pinaka Makhana Store',
          description: 'Premium Makhana Purchase',
          image: '/logo192.png',
          order_id: orderData.razorpayOrderId,
          handler: (response) => {
            resolve({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              method: 'razorpay'
            });
          },
          prefill: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            contact: orderData.customerPhone
          },
          notes: {
            address: orderData.shippingAddress
          },
          theme: {
            color: '#ef4444'
          },
          method: {
            netbanking: true,
            card: true,
            wallet: true,
            upi: true,
            paylater: true
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          reject({
            error: response.error,
            method: 'razorpay'
          });
        });
        rzp.open();
      };
      document.body.appendChild(script);
    });
  }

  // UPI Payment Integration
  async processUPIPayment(orderData, upiId) {
    const upiUrl = `upi://pay?pa=${upiId}&pn=Pinaka Makhana Store&am=${orderData.amount}&cu=INR&tn=Order ${orderData.orderId}`;
    
    // For web, we'll use Razorpay UPI
    return this.initializeRazorpay({
      ...orderData,
      preferredMethod: 'upi'
    });
  }

  // PhonePe Integration
  async initializePhonePe(orderData) {
    try {
      // This would typically involve server-side integration
      const response = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: orderData.amount,
          orderId: orderData.orderId,
          customerDetails: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            phone: orderData.customerPhone
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to PhonePe payment page
        window.location.href = data.paymentUrl;
        return { method: 'phonepe', redirectUrl: data.paymentUrl };
      } else {
        throw new Error('PhonePe initialization failed');
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      throw error;
    }
  }

  // Google Pay Integration
  async initializeGooglePay(orderData) {
    if (!window.google) {
      throw new Error('Google Pay not available');
    }

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA', 'RUPAY']
        }
      }, {
        type: 'UPI',
        parameters: {
          payeeVpa: 'merchant@upi',
          payeeName: 'Pinaka Makhana Store',
          referenceUrl: 'https://pinakamakhana.com'
        }
      }],
      merchantInfo: {
        merchantId: '12345678901234567890',
        merchantName: 'Pinaka Makhana Store'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: orderData.amount.toString(),
        currencyCode: 'INR'
      }
    };

    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST' // Change to 'PRODUCTION' for live
    });

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      return {
        method: 'googlepay',
        paymentData: paymentData
      };
    } catch (error) {
      throw new Error('Google Pay payment failed');
    }
  }

  // Paytm Integration
  async initializePaytm(orderData) {
    try {
      const response = await fetch('/api/payment/paytm/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          amount: orderData.amount,
          customerId: orderData.customerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Initialize Paytm checkout
        const config = {
          root: '',
          flow: 'DEFAULT',
          data: {
            orderId: data.orderId,
            token: data.token,
            tokenType: 'TXN_TOKEN',
            amount: orderData.amount
          },
          handler: {
            notifyMerchant: (eventName, data) => {
              if (eventName === 'APP_CLOSED') {
                console.log('Paytm payment cancelled');
              }
            }
          }
        };

        if (window.Paytm && window.Paytm.CheckoutJS) {
          window.Paytm.CheckoutJS.init(config).then(() => {
            window.Paytm.CheckoutJS.invoke();
          });
        }
        
        return { method: 'paytm', config };
      } else {
        throw new Error('Paytm initialization failed');
      }
    } catch (error) {
      console.error('Paytm payment error:', error);
      throw error;
    }
  }

  // Net Banking Integration
  async initializeNetBanking(orderData, bankCode) {
    // This will use Razorpay's net banking option
    return this.initializeRazorpay({
      ...orderData,
      preferredMethod: 'netbanking',
      bankCode: bankCode
    });
  }

  // Wallet Integration (Paytm, PhonePe, Amazon Pay, etc.)
  async initializeWallet(orderData, walletType) {
    switch (walletType) {
      case 'paytm':
        return this.initializePaytm(orderData);
      case 'phonepe':
        return this.initializePhonePe(orderData);
      case 'amazonpay':
        return this.initializeRazorpay({
          ...orderData,
          preferredMethod: 'wallet',
          wallet: 'amazonpay'
        });
      default:
        return this.initializeRazorpay({
          ...orderData,
          preferredMethod: 'wallet'
        });
    }
  }

  // Cash on Delivery
  async processCOD(orderData) {
    try {
      const response = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          method: 'cod',
          orderId: data.orderId,
          status: 'confirmed'
        };
      } else {
        throw new Error('COD order placement failed');
      }
    } catch (error) {
      console.error('COD error:', error);
      throw error;
    }
  }

  // EMI Integration
  async initializeEMI(orderData, emiTenure) {
    return this.initializeRazorpay({
      ...orderData,
      preferredMethod: 'emi',
      emiTenure: emiTenure
    });
  }

  // Payment verification
  async verifyPayment(paymentData) {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Cards, UPI, NetBanking',
        description: 'Secure payment via Razorpay',
        icon: '💳',
        popular: true
      },
      {
        id: 'upi',
        name: 'UPI Payment',
        description: 'Pay using any UPI app',
        icon: '📱',
        popular: true
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        description: 'Pay with PhonePe wallet',
        icon: '📲',
        popular: true
      },
      {
        id: 'googlepay',
        name: 'Google Pay',
        description: 'Quick Google Pay checkout',
        icon: '🎯',
        popular: true
      },
      {
        id: 'paytm',
        name: 'Paytm Wallet',
        description: 'Pay with Paytm wallet',
        icon: '💰',
        popular: false
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Direct bank transfer',
        icon: '🏦',
        popular: false
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: '💵',
        popular: true
      },
      {
        id: 'emi',
        name: 'EMI Options',
        description: 'Easy monthly installments',
        icon: '📊',
        popular: false
      }
    ];
  }

  // Get popular banks for net banking
  getPopularBanks() {
    return [
      { code: 'SBIN', name: 'State Bank of India' },
      { code: 'HDFC', name: 'HDFC Bank' },
      { code: 'ICIC', name: 'ICICI Bank' },
      { code: 'AXIB', name: 'Axis Bank' },
      { code: 'PUNB', name: 'Punjab National Bank' },
      { code: 'BBKM', name: 'Bank of Baroda' },
      { code: 'CNRB', name: 'Canara Bank' },
      { code: 'IDFB', name: 'IDFC First Bank' }
    ];
  }
}

export default new PaymentService();
