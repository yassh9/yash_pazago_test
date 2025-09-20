# 🌦️ Weather Chat Assistant

A modern, AI-powered weather chat application with advanced features and beautiful UI.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Micro-interactions and transitions throughout the app
- **Weather-Themed Icons**: Cohesive weather-related iconography
- **Glass Morphism**: Modern design with backdrop blur effects

### 🔒 **Security & Performance**
- **Input Sanitization**: XSS protection and content validation
- **Rate Limiting**: Prevents spam and abuse
- **Data Encryption**: Local storage encryption for sensitive data
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimizations**: Debounced inputs, memoized callbacks, and efficient rendering

### 💬 **Enhanced Chat Features**
- **Real-time Typing Indicators**: See when the AI is responding
- **Message Validation**: Input validation with user-friendly error messages
- **Auto-resize Textarea**: Smooth height adjustments while typing
- **Character Counter**: Real-time character count with warnings
- **Share Functionality**: Copy chats to clipboard or use native share API

### 📱 **Progressive Web App (PWA)**
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Installable on desktop and mobile
- **Push Notifications**: (Ready for implementation)
- **Background Sync**: (Ready for implementation)

### 🔧 **Advanced Chat Management**
- **Context API State Management**: Centralized state with React Context
- **Toast Notifications**: Beautiful success/error feedback
- **Chat Search**: Search through all conversations
- **Export Functionality**: Export chats as JSON or TXT
- **Archive System**: Archive old conversations
- **Chat Statistics**: View usage statistics

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 **Project Structure**

```
src/
├── components/          # React components
│   ├── ChatWindow.jsx   # Main chat display
│   ├── MessageInput.jsx # Enhanced input with validation
│   ├── Sidebar.jsx      # Chat list and management
│   ├── ErrorBoundary.jsx # Error handling component
│   └── Toast.jsx        # Notification system
├── context/             # React Context providers
│   └── ChatContext.jsx  # Global chat state management
├── hooks/               # Custom React hooks
│   ├── usePerformance.js # Performance optimization hooks
│   └── useChatManagement.js # Chat management utilities
├── utils/               # Utility functions
│   ├── security.js      # Security and validation utilities
│   ├── storage.js       # LocalStorage helpers
│   └── threadId.js      # ID generation
└── constants.js         # App constants

public/
├── manifest.json        # PWA manifest
├── sw.js               # Service worker
└── icons/              # PWA icons (various sizes)
```

## 🔧 **Technical Features**

### **Security Implementation**
```javascript
// Input sanitization
const sanitized = sanitizeInput(userInput);

// Rate limiting
if (!messageLimiter.isAllowed()) {
  showRateLimitError();
  return;
}

// Data encryption
const encrypted = encryptData(sensitiveData);
localStorage.setItem('data', encrypted);
```

### **Performance Optimizations**
```javascript
// Debounced textarea resize
const debouncedResize = useDebounce(resize, 10);

// Memoized expensive calculations
const sortedChats = useMemo(() => {
  return chats.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
}, [chats]);

// Optimized local storage
const [data, setData] = useLocalStorage('key', initialValue);
```

### **State Management**
```javascript
// Context API usage
const {
  threads,
  selectedThreadId,
  createThread,
  deleteThread,
  addMessage
} = useChat();

// Enhanced chat management
const {
  createNewThread,
  searchThreads,
  exportChat,
  getChatStats
} = useChatManagement();
```

## 🎨 **UI Components**

### **Toast Notifications**
```javascript
const { success, error, warning, info } = useToast();

success('Chat created successfully!');
error('Failed to send message');
warning('Rate limit exceeded');
info('Chat archived');
```

### **Error Boundaries**
- Automatic error catching and graceful fallbacks
- Development mode error details
- User-friendly error messages
- Recovery options

### **Progressive Web App**
- Installable on desktop and mobile
- Offline functionality with service worker
- App-like experience with proper manifest
- Optimized caching strategy

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] Real Weather API Integration
- [ ] WebSocket for real-time features
- [ ] Voice input/output
- [ ] File attachment support
- [ ] Advanced search with filters
- [ ] Chat templates and shortcuts
- [ ] Multi-language support
- [ ] AI conversation analytics

### **Technical Improvements**
- [ ] Unit and integration tests
- [ ] End-to-end testing with Playwright
- [ ] CI/CD pipeline setup
- [ ] Performance monitoring
- [ ] Error tracking and analytics
- [ ] Advanced caching strategies

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with React and modern web technologies
- Styled with Tailwind CSS
- Icons from various emoji sets
- Performance optimizations inspired by React best practices

---

**🌦️ Weather Chat Assistant** - Making weather conversations more engaging and interactive!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
