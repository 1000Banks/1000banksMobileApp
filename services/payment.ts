import firebaseService from './firebase';

// Payment configuration - these should be set in environment variables
const PAYMENT_CONFIG = {
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: 'YOUR OWN KEY',
  STRIPE_SECRET_KEY: 'YOUR OWN KEY',
  
  // PayPal Configuration
  PAYPAL_CLIENT_ID: '',
  PAYPAL_CLIENT_SECRET: '',
  
  // Square Configuration
  SQUARE_APP_ID: '',
  SQUARE_LOCATION_ID: '',
  
  // Environment
  ENVIRONMENT: 'development',
};

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'square' | 'apple_pay' | 'google_pay';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    type: 'product' | 'course';
  }>;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  error?: string;
  paymentMethod?: string;
}

class PaymentService {
  private availablePaymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      type: 'stripe',
      name: 'Credit/Debit Card',
      icon: 'card',
      enabled: !!PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY,
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      enabled: !!PAYMENT_CONFIG.PAYPAL_CLIENT_ID,
    },
    {
      id: 'apple_pay',
      type: 'apple_pay',
      name: 'Apple Pay',
      icon: 'logo-apple',
      enabled: false, // Will be enabled based on device capability
    },
    {
      id: 'google_pay',
      type: 'google_pay',
      name: 'Google Pay',
      icon: 'logo-google',
      enabled: false, // Will be enabled based on device capability
    },
  ];

  getAvailablePaymentMethods(): PaymentMethod[] {
    return this.availablePaymentMethods.filter(method => method.enabled);
  }

  async processPayment(
    paymentMethod: PaymentMethod,
    paymentRequest: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      console.log('Processing payment:', { paymentMethod: paymentMethod.type, amount: paymentRequest.amount });

      switch (paymentMethod.type) {
        case 'stripe':
          return await this.processStripePayment(paymentRequest);
        case 'paypal':
          return await this.processPayPalPayment(paymentRequest);
        case 'apple_pay':
          return await this.processApplePayPayment(paymentRequest);
        case 'google_pay':
          return await this.processGooglePayPayment(paymentRequest);
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod.type}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  private async processStripePayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create payment intent on your backend server
      // In a real app, this should be a call to your backend API
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYMENT_CONFIG.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(paymentRequest.amount * 100).toString(), // Convert to cents
          currency: paymentRequest.currency.toLowerCase(),
          description: paymentRequest.description,
          'metadata[customer_email]': paymentRequest.customerEmail || '',
          'metadata[customer_name]': paymentRequest.customerName || '',
          'metadata[items]': JSON.stringify(paymentRequest.items),
          'automatic_payment_methods[enabled]': 'true',
          'automatic_payment_methods[allow_redirects]': 'never',
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create payment intent');
      }

      const paymentIntent = await response.json();

      // For test mode, automatically confirm the payment
      // In production, you would use the Stripe SDK to collect card details
      if (PAYMENT_CONFIG.ENVIRONMENT === 'development' || PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY.includes('test')) {
        // Confirm the payment intent with test card
        const confirmResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/confirm`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PAYMENT_CONFIG.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_data[type]': 'card',
            'payment_method_data[card][token]': 'tok_visa', // Test token for successful payment
          }).toString(),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error?.message || 'Failed to confirm payment');
        }

        const confirmedPayment = await confirmResponse.json();

        return {
          success: confirmedPayment.status === 'succeeded',
          paymentId: confirmedPayment.id,
          transactionId: confirmedPayment.charges?.data[0]?.id || confirmedPayment.id,
          paymentMethod: 'stripe',
        };
      }

      // In production, you would return the client secret to the frontend
      // and use the Stripe SDK to complete the payment
      return {
        success: false,
        error: 'Production payment flow not implemented',
      };

    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment failed',
      };
    }
  }

  private async processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    // This would integrate with react-native-paypal
    // For now, return a mock success for demo purposes
    
    if (PAYMENT_CONFIG.ENVIRONMENT === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        paymentId: `paypal_${Date.now()}`,
        transactionId: `pp_${Math.random().toString(36).substr(2, 9)}`,
        paymentMethod: 'paypal',
      };
    }

    throw new Error('PayPal integration not implemented');
  }

  private async processApplePayPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    // This would integrate with react-native-payments or @react-native-async-storage/async-storage
    throw new Error('Apple Pay integration not implemented');
  }

  private async processGooglePayPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    // This would integrate with react-native-google-pay
    throw new Error('Google Pay integration not implemented');
  }

  async createPurchaseRecord(
    paymentResult: PaymentResult,
    paymentRequest: PaymentRequest
  ): Promise<string> {
    if (!paymentResult.success) {
      throw new Error('Cannot create purchase record for failed payment');
    }

    const cartItems = paymentRequest.items.map(item => ({
      id: item.id,
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      type: item.type,
      quantity: item.quantity,
    }));

    const purchaseId = await firebaseService.createPurchase(cartItems, paymentResult.paymentMethod);
    
    // Update purchase with payment details
    await firebaseService.updatePurchaseStatus(purchaseId, 'completed');

    // Enroll user in courses
    for (const item of paymentRequest.items) {
      if (item.type === 'course') {
        try {
          await firebaseService.enrollInCourse(item.id);
          console.log(`User enrolled in course: ${item.id}`);
        } catch (error) {
          console.error(`Failed to enroll in course ${item.id}:`, error);
        }
      }
    }

    return purchaseId;
  }

  validatePaymentRequest(paymentRequest: PaymentRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    if (!paymentRequest.currency) {
      errors.push('Currency is required');
    }

    if (!paymentRequest.items || paymentRequest.items.length === 0) {
      errors.push('No items in payment request');
    }

    if (!paymentRequest.description) {
      errors.push('Payment description is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


export default new PaymentService();