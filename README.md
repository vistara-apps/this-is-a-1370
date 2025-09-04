# FilePay - Monetize Your Digital Files

FilePay is a decentralized platform that enables creators to easily sell access to their digital files with secure, time-limited, and revocable download links. Built on Base blockchain with IPFS storage.

![FilePay Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=FilePay+Dashboard)

## 🚀 Features

### Core Features
- **File Upload & Pricing**: Upload digital files and set custom prices
- **Secure IPFS Storage**: Files stored on IPFS via Pinata for decentralized access
- **Time-Limited Access**: Generate secure download links with expiration times
- **Download Tracking**: Monitor file access and download analytics
- **Base Blockchain Integration**: Payments processed via USDC on Base network
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets

### Advanced Features
- **Smart Contract Security**: Trustless payments with automatic fee distribution
- **Access Control**: Configurable download limits and time restrictions
- **Analytics Dashboard**: Comprehensive insights into file performance
- **Multi-Payment Options**: Crypto (USDC) and traditional payment methods
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Blockchain**: Base Network, Wagmi, RainbowKit
- **Storage**: Pinata IPFS
- **Smart Contracts**: Solidity, OpenZeppelin
- **Payments**: USDC, Stripe (fallback)
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Pinata account for IPFS storage
- A WalletConnect project ID
- Base network testnet tokens for development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-1370.git
cd this-is-a-1370
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Pinata IPFS Configuration
VITE_PINATA_JWT=your_pinata_jwt_token_here

# Smart Contract Addresses (Base Network)
VITE_FILEPAY_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Configuration

### Pinata IPFS Setup

1. Create a [Pinata](https://pinata.cloud) account
2. Generate an API key and JWT token
3. Add your credentials to the `.env` file

### Smart Contract Deployment

The FilePay smart contract needs to be deployed to Base network:

```bash
# Install Hardhat (if not already installed)
npm install -g hardhat

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network base-sepolia

# Deploy to Base Mainnet (production)
npx hardhat run scripts/deploy.js --network base-mainnet
```

### WalletConnect Configuration

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID to the `.env` file

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AccessLink.jsx   # Secure download link component
│   ├── FileCard.jsx     # File display component
│   ├── FileUpload.jsx   # File upload interface
│   ├── PaymentButton.jsx # Payment processing component
│   └── Sidebar.jsx      # Navigation sidebar
├── contracts/           # Smart contracts
│   └── FilePay.sol      # Main payment contract
├── context/             # React context providers
│   └── FileContext.jsx  # File state management
├── hooks/               # Custom React hooks
│   ├── useContract.js   # Blockchain interaction hooks
│   └── usePaymentContext.js # Payment processing hooks
├── pages/               # Application pages
│   ├── Analytics.jsx    # Analytics dashboard
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Files.jsx        # File management
│   ├── Marketplace.jsx  # File marketplace
│   └── Upload.jsx       # File upload page
├── services/            # External service integrations
│   └── api.js           # API service layer
└── App.jsx              # Main application component
```

## 🔐 Security Features

### Smart Contract Security
- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Role-based permissions with Ownable
- **Pausable Contract**: Emergency stop functionality
- **Fee Validation**: Configurable platform fees with limits

### File Security
- **IPFS Storage**: Decentralized file storage
- **Signed URLs**: Time-limited access links
- **Download Limits**: Configurable access restrictions
- **Wallet Verification**: Blockchain-based access control

## 💰 Payment Flow

1. **File Registration**: Creator uploads file and sets price
2. **Blockchain Registration**: File registered on smart contract
3. **Payment Creation**: Buyer initiates payment transaction
4. **USDC Transfer**: Funds transferred to smart contract
5. **Payment Completion**: Funds distributed to creator (minus fees)
6. **Access Generation**: Secure download link created
7. **File Download**: Time-limited access to file

## 📊 Analytics

FilePay provides comprehensive analytics including:

- **Revenue Tracking**: Total earnings and payment history
- **Download Analytics**: File access patterns and popular content
- **Performance Metrics**: Conversion rates and user engagement
- **Geographic Data**: Download locations and user demographics

## 🌐 Deployment

### Frontend Deployment

Build the application for production:

```bash
npm run build
```

Deploy to your preferred hosting service (Vercel, Netlify, etc.):

```bash
# Example: Deploy to Vercel
npm install -g vercel
vercel --prod
```

### Smart Contract Deployment

Deploy contracts to Base mainnet:

```bash
npx hardhat run scripts/deploy.js --network base-mainnet
```

Update your `.env` file with the deployed contract addresses.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run smart contract tests
npx hardhat test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.filepay.app](https://docs.filepay.app)
- **Discord**: [Join our community](https://discord.gg/filepay)
- **Email**: support@filepay.app
- **GitHub Issues**: [Report bugs](https://github.com/vistara-apps/this-is-a-1370/issues)

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Basic file upload and payment processing
- ✅ IPFS integration with Pinata
- ✅ Base blockchain integration
- ✅ Secure download links

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics dashboard
- 🔄 Bulk file operations
- 🔄 Creator subscription tiers
- 🔄 Mobile app development

### Phase 3 (Q3 2024)
- 📋 Multi-chain support (Ethereum, Polygon)
- 📋 NFT integration for exclusive content
- 📋 Creator collaboration tools
- 📋 Advanced access control features

## 🙏 Acknowledgments

- [Base](https://base.org) for the blockchain infrastructure
- [Pinata](https://pinata.cloud) for IPFS storage solutions
- [OpenZeppelin](https://openzeppelin.com) for smart contract security
- [RainbowKit](https://rainbowkit.com) for wallet integration
- [Tailwind CSS](https://tailwindcss.com) for the design system

---

**Built with ❤️ by the FilePay team**
