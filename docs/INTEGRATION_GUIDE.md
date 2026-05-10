# Bee Chat Integration Guide

Welcome to Bee Chat! This guide will help you integrate the Bee Chat widget into your website and start talking to your customers.

## 1. Get Your API Key
1. Log in to your [Bee Chat Dashboard](https://bee-chat.com/dashboard).
2. Navigate to the **Websites** section.
3. Click **Add Website** and enter your domain (e.g., `cognitioit.ca`).
4. Copy your unique **API Key**.

## 2. Integration Methods

### Option A: JavaScript Snippet (Recommended)
Add the following code snippet before the closing `</body>` tag of your website:

```html
<script>
  window.BeeChatConfig = {
    apiKey: 'YOUR_API_KEY_HERE'
  };
</script>
<script src="https://cdn.beechat.com/widget.js" async></script>
```

### Option B: React Component
If you are using React, you can install our widget package:

```bash
npm install @beechat/react-widget
```

Usage:
```jsx
import { ChatWidget } from '@beechat/react-widget';

function App() {
  return (
    <div>
      <ChatWidget apiKey="YOUR_API_KEY_HERE" />
    </div>
  );
}
```

## 3. Customization
You can customize the widget appearance from the **Settings** tab in your dashboard:
- Primary Color
- Widget Position (Left/Right)
- Welcome Message
- Agent Avatars
- Sound Notifications

## 4. Features
- **Real-time Messaging**: Instant communication with visitors.
- **AI Chatbot**: Enable the AI to handle common queries automatically.
- **File Sharing**: Send and receive screenshots or documents.
- **Visitor Tracking**: See which pages your visitors are currently viewing.
- **Mobile Friendly**: Works perfectly on all screen sizes.

## 5. Support
If you need any help, contact our support hive at `support@cognitioit.ca`.
