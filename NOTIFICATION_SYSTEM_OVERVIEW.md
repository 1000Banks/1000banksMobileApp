# Notification System Overview

## Architecture

The notification system in 1000Banks integrates with Telegram to deliver real-time trading signals to users.

### Components

1. **Frontend Components**:
   - `AppHeader.tsx`: Displays notification bell with unread count badge
   - `notifications.tsx`: Lists all notifications with read/unread status
   - `TelegramSubscription.tsx`: Subscription widget on Trading page

2. **Backend Services**:
   - `firebase.ts`: Core notification methods (create, read, mark as read)
   - `telegram.ts`: Telegram bot integration and message polling

3. **Admin Panel**:
   - `admin-settings.tsx`: Telegram configuration in settings tab

## Data Flow

```
1. Admin configures Telegram channel in Admin Settings
   ↓
2. Bot starts polling Telegram API every 5 seconds
   ↓
3. New message detected in Telegram channel
   ↓
4. Message saved to Firebase 'telegramMessages' collection
   ↓
5. Notification created for each subscribed user
   ↓
6. Real-time listeners update notification badges
   ↓
7. Users see notifications in app
```

## Firebase Collections

### `telegramChannels`
Stores Telegram channel configurations:
```javascript
{
  id: string,              // Chat ID
  name: string,            // Display name
  chatId: string,          // Telegram chat ID
  botToken: string,        // Bot token (encrypted recommended)
  isActive: boolean,       // Whether polling is active
  subscriptionType: 'free' | 'paid',
  subscriptionPrice: number,
  description: string,
  createdAt: timestamp
}
```

### `channelSubscriptions`
Tracks user subscriptions:
```javascript
{
  id: string,
  userId: string,          // Firebase user ID
  channelId: string,       // Telegram channel ID
  subscribedAt: timestamp,
  expiresAt?: timestamp,   // For paid subscriptions
  isPaid: boolean,
  amountPaid?: number
}
```

### `notifications`
User notifications:
```javascript
{
  id: string,
  userId: string,
  title: string,
  message: string,
  timestamp: timestamp,
  read: boolean,
  type: 'trading' | 'order' | 'system',
  channelId?: string       // Links to Telegram channel
}
```

### `telegramMessages`
Archive of Telegram messages:
```javascript
{
  id: string,
  channelId: string,
  text: string,
  timestamp: timestamp,
  fromUser?: string,       // Telegram username
  messageId: number        // Telegram message ID
}
```

## Security Rules

Key security principles:
- Users can only read their own notifications
- Only admins can modify Telegram channels
- Subscription creation requires authentication
- Message polling runs server-side only

## Features

### For Users
- Real-time notification badges
- Push notifications (when implemented)
- Notification history with timestamps
- Mark as read functionality
- Free and paid subscription options

### For Admins
- Configure multiple Telegram channels
- Set subscription pricing
- Monitor active subscriptions
- View message delivery stats

## Best Practices

1. **Performance**:
   - Use Firebase listeners for real-time updates
   - Batch notification creation for multiple users
   - Implement pagination for notification history

2. **Security**:
   - Encrypt bot tokens in database
   - Validate subscription status before showing messages
   - Rate limit notification creation

3. **User Experience**:
   - Clear unread indicators
   - Smooth subscription flow
   - Helpful error messages
   - Offline support considerations

## Future Enhancements

1. **Push Notifications**: 
   - Integrate with FCM for mobile push
   - Web push for browser notifications

2. **Analytics**:
   - Track notification open rates
   - Monitor subscription conversion
   - Channel performance metrics

3. **Advanced Features**:
   - Multiple channel support
   - Notification preferences
   - Custom notification sounds
   - Rich media support (images, files)

## Troubleshooting

Common issues and solutions:

1. **Notifications not appearing**:
   - Check Firebase rules
   - Verify subscription status
   - Ensure bot has admin rights

2. **Polling not working**:
   - Validate bot token
   - Check network connectivity
   - Review error logs

3. **Badge count incorrect**:
   - Clear app cache
   - Check listener registration
   - Verify query filters

## Testing Checklist

- [ ] Admin can configure Telegram settings
- [ ] Bot successfully polls messages
- [ ] Notifications created for subscribed users
- [ ] Badge count updates in real-time
- [ ] Notifications mark as read correctly
- [ ] Subscription flow works (free & paid)
- [ ] Proper error handling throughout