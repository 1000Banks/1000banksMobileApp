# Payment Gateway Setup Documentation

This document provides comprehensive instructions for setting up payment gateways in the 1000Banks app.

## Overview

The app supports multiple payment methods:
- ✅ Stripe (Credit/Debit Cards)
- ✅ PayPal
- 🚧 Apple Pay (iOS)
- 🚧 Google Pay (Android)

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# PayPal Configuration  
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Square Configuration (Optional)
EXPO_PUBLIC_SQUARE_APP_ID=your_square_app_id_here
EXPO_PUBLIC_SQUARE_LOCATION_ID=your_square_location_id_here

# Environment
NODE_ENV=development
```

## 1. Stripe Setup

### Step 1: Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete your account verification
3. Go to the Dashboard

### Step 2: Get API Keys
1. Navigate to **Developers > API keys**
2. Copy the **Publishable key** (starts with `pk_test_` for test mode)
3. Copy the **Secret key** (starts with `sk_test_` for test mode)
4. Add them to your `.env` file

### Step 3: Install Stripe SDK
```bash
npm install @stripe/stripe-react-native
# or
yarn add @stripe/stripe-react-native
```

### Step 4: Configure Stripe in Your App
Update `services/payment.ts` to implement actual Stripe integration:

```typescript
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// In your payment processing function:
private async processStripePayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  // Create payment intent on your backend
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: paymentRequest.amount * 100, // Convert to cents
      currency: paymentRequest.currency.toLowerCase(),
    }),
  });
  
  const { clientSecret } = await response.json();
  
  // Initialize payment sheet
  const { error } = await initPaymentSheet({
    merchantDisplayName: '1000Banks',
    paymentIntentClientSecret: clientSecret,
  });
  
  if (error) throw new Error(error.message);
  
  // Present payment sheet
  const { error: paymentError } = await presentPaymentSheet();
  
  if (paymentError) {
    throw new Error(paymentError.message);
  }
  
  return {
    success: true,
    paymentId: clientSecret,
    transactionId: clientSecret.split('_secret')[0],
    paymentMethod: 'stripe',
  };
}
```

### Step 5: Create Backend Endpoint (Required)
You need a backend endpoint to create payment intents. Here's an example using Node.js:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        company: '1000Banks',
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 2. PayPal Setup

### Step 1: Create PayPal Developer Account
1. Go to [https://developer.paypal.com](https://developer.paypal.com)
2. Sign up or log in with your PayPal account
3. Go to **My Apps & Credentials**

### Step 2: Create App
1. Click **Create App**
2. Enter app name: "1000Banks Mobile App"
3. Select **Merchant** account
4. Select **Sandbox** for testing
5. Click **Create App**

### Step 3: Get Credentials
1. Copy the **Client ID**
2. Copy the **Client Secret**
3. Add them to your `.env` file

### Step 4: Install PayPal SDK
```bash
npm install react-native-paypal
# or
yarn add react-native-paypal
```

### Step 5: Configure PayPal
Update `services/payment.ts`:

```typescript
import PayPal from 'react-native-paypal';

private async processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  try {
    const payment = await PayPal.paymentRequest({
      clientId: PAYMENT_CONFIG.PAYPAL_CLIENT_ID,
      environment: PAYMENT_CONFIG.ENVIRONMENT === 'production' ? 'production' : 'sandbox',
      intent: 'sale',
      price: paymentRequest.amount.toString(),
      currency: paymentRequest.currency,
      description: paymentRequest.description,
    });
    
    return {
      success: true,
      paymentId: payment.paymentId,
      transactionId: payment.transactionId,
      paymentMethod: 'paypal',
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
```

## 3. Apple Pay Setup (iOS Only)

### Prerequisites
- iOS device or simulator
- Apple Developer Account
- Valid SSL certificate for your domain

### Step 1: Enable Apple Pay Capability
1. In Xcode, go to your project settings
2. Select your target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **Apple Pay**

### Step 2: Configure Merchant ID
1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Merchant IDs**
4. Create a new Merchant ID: `merchant.com.yourcompany.1000banks`

### Step 3: Install Apple Pay SDK
```bash
npm install react-native-payments
# or  
yarn add react-native-payments
```

### Step 4: Configure Apple Pay
```typescript
import { PaymentRequest, canMakePayments, show } from 'react-native-payments';

private async processApplePayPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  const canMakeApplePayPayments = await canMakePayments();
  
  if (!canMakeApplePayPayments) {
    throw new Error('Apple Pay not available on this device');
  }
  
  const request = new PaymentRequest({
    merchantIdentifier: 'merchant.com.yourcompany.1000banks',
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    countryCode: 'US',
    currencyCode: 'USD',
    paymentSummaryItems: [
      {
        label: '1000Banks Purchase',
        amount: { currency: 'USD', value: paymentRequest.amount.toString() },
      },
    ],
  });
  
  const paymentResponse = await show(request);
  
  return {
    success: true,
    paymentId: paymentResponse.paymentToken,
    transactionId: paymentResponse.transactionIdentifier,
    paymentMethod: 'apple_pay',
  };
}
```

## 4. Google Pay Setup (Android Only)

### Step 1: Enable Google Pay in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Pay API**
3. Create credentials for your app

### Step 2: Install Google Pay SDK
```bash
npm install react-native-google-pay
# or
yarn add react-native-google-pay
```

### Step 3: Configure Google Pay
```typescript
import GooglePay from 'react-native-google-pay';

private async processGooglePayPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  const isGooglePayAvailable = await GooglePay.isReadyToPay();
  
  if (!isGooglePayAvailable) {
    throw new Error('Google Pay not available');
  }
  
  const paymentData = await GooglePay.requestPayment({
    totalPriceStatus: 'FINAL',
    totalPrice: paymentRequest.amount.toString(),
    currencyCode: 'USD',
    countryCode: 'US',
    allowedCardNetworks: ['VISA', 'MASTERCARD'],
    allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    merchantName: '1000Banks',
  });
  
  return {
    success: true,
    paymentId: paymentData.paymentMethodData.tokenizationData.token,
    transactionId: Date.now().toString(),
    paymentMethod: 'google_pay',
  };
}
```

## 5. Testing

### Test Cards (Stripe)
```
# Visa
4242 4242 4242 4242

# Mastercard  
5555 5555 5555 4444

# American Express
3782 822463 10005

# Declined Card
4000 0000 0000 0002

# Use any future expiry date and any 3-digit CVC
```

### PayPal Test Account
- Use sandbox credentials
- Create test buyer and seller accounts in PayPal Developer Dashboard

## 6. Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use different keys for development/staging/production
- Store production keys securely (AWS Secrets Manager, etc.)

### Validation
- Always validate payments on your backend
- Verify webhook signatures
- Log all payment attempts for audit purposes

### PCI Compliance
- Never store credit card information
- Use tokenization for recurring payments
- Implement proper SSL/TLS encryption

## 7. Webhook Setup

### Stripe Webhooks
1. Go to Stripe Dashboard > **Developers > Webhooks**
2. Add endpoint: `https://yourapi.com/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook signing secret to environment variables

```javascript
// Webhook handler example
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
    }
    
    res.json({received: true});
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## 8. Production Deployment

### Checklist
- [ ] Replace test API keys with production keys
- [ ] Enable production mode for all payment providers
- [ ] Set up webhook endpoints for production
- [ ] Test all payment flows in production environment
- [ ] Monitor payment success rates
- [ ] Set up alerts for failed payments

### Environment Variables for Production
```bash
# Production Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here

# Production PayPal
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_secret

# Production Environment
NODE_ENV=production
```

## 9. Troubleshooting

### Common Issues

1. **"No payment methods available"**
   - Check environment variables are loaded correctly
   - Verify API keys are valid
   - Ensure payment service is initialized properly

2. **Stripe payments failing**
   - Verify publishable key starts with `pk_test_` or `pk_live_`
   - Check backend payment intent creation
   - Verify webhook endpoint is accessible

3. **PayPal integration errors**
   - Ensure client ID matches the environment (sandbox/production)
   - Check PayPal app settings in developer dashboard
   - Verify redirect URLs are configured correctly

4. **Apple Pay not showing**
   - Check device supports Apple Pay
   - Verify merchant ID configuration
   - Ensure proper certificates are installed

5. **Android build issues with Google Pay**
   - Check gradle configuration
   - Verify Google Play Services are available
   - Ensure proper permissions in AndroidManifest.xml

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Apple Pay Developer Guide](https://developer.apple.com/apple-pay/)
- [Google Pay Developer Guide](https://developers.google.com/pay)

## 10. Monitoring and Analytics

### Payment Metrics to Track
- Payment success rate
- Average transaction amount
- Payment method preferences
- Failed payment reasons
- Chargeback rates

### Recommended Tools
- Stripe Dashboard for payment analytics
- Google Analytics for e-commerce tracking
- Sentry for error monitoring
- Custom dashboard for business metrics

---

**Note**: This is a comprehensive setup guide. Start with Stripe integration as it's the most commonly used and has excellent documentation. Add other payment methods based on your user base and requirements.