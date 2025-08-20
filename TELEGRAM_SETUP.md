# Telegram Notification Setup Guide

This guide will help you set up Telegram notifications for your 1000Banks app. Users will receive real-time trading signals and notifications from your Telegram channel directly in the app.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating a Telegram Bot](#creating-a-telegram-bot)
3. [Setting Up a Telegram Channel](#setting-up-a-telegram-channel)
4. [Configuring the App](#configuring-the-app)
5. [Testing the Integration](#testing-the-integration)
6. [Subscription Models](#subscription-models)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Admin access to the 1000Banks app
- Telegram account
- Active Telegram channel or group for trading signals

## Creating a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a conversation** with BotFather
3. **Create a new bot** by sending `/newbot`
4. **Choose a name** for your bot (e.g., "1000Banks Trading Signals")
5. **Choose a username** for your bot (must end with 'bot', e.g., `thousand_banks_bot`)
6. **Save the bot token** - You'll receive something like:
   ```
   5892341214:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
   ```
   This is your bot token - keep it secure!

## Setting Up a Telegram Channel

### Option 1: Using a Public Channel
1. **Create a new channel** in Telegram
2. **Make it public** and set a username
3. **Add your bot** as an administrator with these permissions:
   - Post messages
   - Edit messages
   - Delete messages
4. **Get the Chat ID**:
   - Send a message to the channel
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for the chat ID (will be negative, like `-1001234567890`)

### Option 2: Using a Private Channel
1. **Create a new channel** in Telegram
2. **Keep it private**
3. **Add your bot** as an administrator
4. **Get the Chat ID**:
   - Add `@RawDataBot` to your channel temporarily
   - It will send you the channel info including the chat ID
   - Remove `@RawDataBot` after getting the ID

### Option 3: Using a Group
1. **Create a new group** in Telegram
2. **Add your bot** to the group
3. **Make the bot an administrator**
4. **Get the Chat ID** using the same method as channels

## Configuring the App

1. **Login as Admin** to your 1000Banks app

2. **Navigate to Admin Panel** → **Settings** → **Telegram**

3. **Enable Telegram Integration**:
   - Toggle "Enable Telegram Integration" to ON

4. **Enter Channel Details**:
   - **Channel Name**: Display name for your channel (e.g., "1000Banks Trading Signals")
   - **Chat ID**: The chat ID from previous steps (e.g., `-1001234567890`)
   - **Bot Token**: Your bot token from BotFather
   - **Channel Description**: Description shown to users

5. **Configure Subscription Type**:
   - **Free**: All users can subscribe without payment
   - **Paid**: Users must pay monthly subscription fee
     - Set the monthly price in USD

6. **Save Settings**

## Testing the Integration

1. **Send a Test Message**:
   - Go to your Telegram channel/group
   - Send a message like: "Test signal: BTC looking bullish!"

2. **Check App Notifications**:
   - Open the app as a logged-in user
   - Navigate to the Trading page
   - Subscribe to the channel (free or paid)
   - Check the notifications page
   - You should see the test message

3. **Verify Real-time Updates**:
   - Send another message in Telegram
   - The notification should appear in the app within 5-10 seconds

## Subscription Models

### Free Subscription
- Users click "Subscribe for Free"
- Instant access to all channel messages
- No payment required
- Suitable for community building

### Paid Subscription
- Users click "Subscribe Now"
- Redirected to payment page
- Monthly recurring payment
- Access expires after subscription ends
- Suitable for premium trading signals

### Managing Subscriptions
Admins can view and manage subscriptions:
- Check active subscribers count
- View subscription revenue
- Manually add/remove subscribers (coming soon)

## How It Works

1. **Message Flow**:
   ```
   Telegram Channel → Bot Polling → Firebase → App Notifications
   ```

2. **Polling Interval**: 
   - The bot checks for new messages every 5 seconds
   - Messages are instantly saved to Firebase
   - Subscribed users receive push notifications

3. **Message Types Supported**:
   - Text messages
   - Messages with emojis
   - Multi-line messages
   - Messages from any channel member

## Best Practices

1. **Security**:
   - Never share your bot token publicly
   - Regularly rotate bot tokens
   - Monitor for unauthorized access

2. **Content Guidelines**:
   - Keep messages concise and actionable
   - Use consistent formatting for signals
   - Include relevant emojis for visual appeal

3. **Example Signal Format**:
   ```
   🚀 LONG SIGNAL: BTC/USDT
   
   Entry: $45,000 - $45,500
   Targets: 
   TP1: $46,000 ✅
   TP2: $47,000 ✅
   TP3: $48,500 ✅
   
   Stop Loss: $44,000 🛑
   
   Risk: Medium
   Timeframe: 4H
   ```

## Troubleshooting

### Bot Not Receiving Messages
1. Ensure bot is added as admin to the channel
2. Check bot token is correct
3. Verify chat ID is correct (should be negative)
4. Try removing and re-adding the bot

### Notifications Not Appearing
1. Check user is subscribed to the channel
2. Verify Firebase rules allow notification access
3. Ensure app has notification permissions
4. Check internet connectivity

### Subscription Issues
1. For paid subscriptions, verify payment integration
2. Check subscription expiry dates in Firebase
3. Ensure proper error handling for failed payments

### Common Error Messages

- **"Invalid bot token"**: Double-check token from BotFather
- **"Chat not found"**: Verify chat ID and bot is in the channel
- **"Permission denied"**: Check Firebase security rules
- **"Subscription expired"**: User needs to renew paid subscription

## Advanced Configuration

### Multiple Channels
To add multiple channels (coming soon):
1. Each channel needs its own bot
2. Configure each channel separately in admin
3. Users can subscribe to multiple channels

### Custom Notification Types
The system supports different notification types:
- `trading`: Trading signals (default)
- `order`: Order updates
- `system`: System announcements

### API Limits
Telegram Bot API limits:
- 30 messages/second to different users
- 1 message/second to same user
- 20 MB max file size

## Support

For technical issues:
- Check app logs in Admin → Audit Logs
- Review Firebase console for errors
- Contact support with error details

Remember to regularly update your bot token and monitor channel activity for optimal performance.