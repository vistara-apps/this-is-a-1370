# FilePay API Documentation

This document outlines the complete API requirements for the FilePay backend service.

## Overview

The FilePay API provides endpoints for managing creators, files, downloads, and analytics. It integrates with Pinata IPFS for file storage and Base blockchain for payment verification.

## Base URL

```
Production: https://api.filepay.app
Development: http://localhost:3001/api
```

## Authentication

All API requests require authentication via wallet signature or API key.

### Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Wallet-Address: <wallet_address>
X-Signature: <wallet_signature>
```

## Data Models

### Creator

```typescript
interface Creator {
  id: string;
  walletAddress: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  totalEarnings: number;
  totalFiles: number;
  totalDownloads: number;
  createdAt: string;
  updatedAt: string;
}
```

### File

```typescript
interface File {
  id: string;
  creatorId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  price: number;
  accessDuration: number; // in hours
  maxDownloads: number;
  downloadCount: number;
  earnings: number;
  storageUrl: string;
  ipfsHash: string;
  thumbnailUrl?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Download

```typescript
interface Download {
  id: string;
  fileId: string;
  buyerWalletAddress: string;
  paymentTxHash: string;
  downloadUrl: string;
  downloadedAt?: string;
  expiresAt: string;
  remainingDownloads: number;
  isActive: boolean;
  createdAt: string;
}
```

## API Endpoints

### Creators

#### Create Creator

```http
POST /creators
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "email": "creator@example.com",
  "displayName": "Creator Name",
  "bio": "Creator bio"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "creator_id",
    "walletAddress": "0x...",
    "email": "creator@example.com",
    "displayName": "Creator Name",
    "bio": "Creator bio",
    "totalEarnings": 0,
    "totalFiles": 0,
    "totalDownloads": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Creator

```http
GET /creators/{walletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "creator_id",
    "walletAddress": "0x...",
    "displayName": "Creator Name",
    "totalEarnings": 150.25,
    "totalFiles": 12,
    "totalDownloads": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Creator

```http
PUT /creators/{creatorId}
```

**Request Body:**
```json
{
  "displayName": "New Name",
  "bio": "Updated bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Files

#### Create File

```http
POST /files
```

**Request Body:**
```json
{
  "id": "file_id",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "description": "Important document",
  "price": 0.05,
  "accessDuration": 24,
  "maxDownloads": 100,
  "storageUrl": "https://gateway.pinata.cloud/ipfs/...",
  "ipfsHash": "QmHash...",
  "tags": ["document", "pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_id",
    "creatorId": "creator_id",
    "fileName": "document.pdf",
    "price": 0.05,
    "downloadCount": 0,
    "earnings": 0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Files

```http
GET /files?creatorId={creatorId}&page=1&limit=20&sortBy=createdAt&order=desc
```

**Query Parameters:**
- `creatorId` (optional): Filter by creator
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): Sort field (createdAt, price, downloadCount)
- `order` (optional): Sort order (asc, desc)
- `search` (optional): Search in file names and descriptions
- `tags` (optional): Filter by tags (comma-separated)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_id",
        "fileName": "document.pdf",
        "price": 0.05,
        "downloadCount": 23,
        "earnings": 1.15,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### Get File

```http
GET /files/{fileId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_id",
    "creatorId": "creator_id",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "description": "Important document",
    "price": 0.05,
    "accessDuration": 24,
    "maxDownloads": 100,
    "downloadCount": 23,
    "earnings": 1.15,
    "storageUrl": "https://gateway.pinata.cloud/ipfs/...",
    "ipfsHash": "QmHash...",
    "tags": ["document", "pdf"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update File

```http
PUT /files/{fileId}
```

**Request Body:**
```json
{
  "description": "Updated description",
  "price": 0.08,
  "maxDownloads": 150,
  "tags": ["document", "pdf", "updated"],
  "isActive": true
}
```

#### Delete File

```http
DELETE /files/{fileId}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Downloads

#### Create Download

```http
POST /downloads
```

**Request Body:**
```json
{
  "fileId": "file_id",
  "buyerWalletAddress": "0x...",
  "paymentTxHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "download_id",
    "fileId": "file_id",
    "buyerWalletAddress": "0x...",
    "paymentTxHash": "0x...",
    "downloadUrl": "https://gateway.pinata.cloud/ipfs/...?signature=...",
    "expiresAt": "2024-01-02T00:00:00Z",
    "remainingDownloads": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Downloads

```http
GET /downloads?fileId={fileId}&buyerWalletAddress={address}
```

**Query Parameters:**
- `fileId` (optional): Filter by file
- `buyerWalletAddress` (optional): Filter by buyer
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Get Creator Downloads

```http
GET /downloads/creator/{creatorId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloads": [
      {
        "id": "download_id",
        "fileId": "file_id",
        "fileName": "document.pdf",
        "buyerWalletAddress": "0x...",
        "amount": 0.05,
        "downloadedAt": "2024-01-01T12:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156
    }
  }
}
```

#### Verify Download Access

```http
GET /downloads/{downloadId}/verify
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "remainingDownloads": 3,
    "expiresAt": "2024-01-02T00:00:00Z",
    "downloadUrl": "https://gateway.pinata.cloud/ipfs/...?signature=..."
  }
}
```

#### Track Download

```http
POST /downloads/{downloadId}/track
```

**Request Body:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "downloadedAt": "2024-01-01T12:00:00Z"
}
```

### Analytics

#### Get Creator Analytics

```http
GET /analytics/{creatorId}?range=30d&metrics=earnings,downloads,views
```

**Query Parameters:**
- `range`: Time range (7d, 30d, 90d, 1y, all)
- `metrics`: Comma-separated metrics to include
- `groupBy`: Group results by (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 245.67,
      "totalDownloads": 89,
      "totalViews": 234,
      "conversionRate": 38.03,
      "averagePrice": 2.76
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "earnings": 12.50,
        "downloads": 5,
        "views": 13
      }
    ],
    "topFiles": [
      {
        "fileId": "file_id",
        "fileName": "popular-file.pdf",
        "earnings": 45.20,
        "downloads": 16
      }
    ]
  }
}
```

#### Get File Analytics

```http
GET /analytics/file/{fileId}?range=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 23.45,
      "totalDownloads": 12,
      "totalViews": 45,
      "conversionRate": 26.67
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "earnings": 2.50,
        "downloads": 1,
        "views": 4
      }
    ],
    "demographics": {
      "countries": [
        {"country": "US", "downloads": 8},
        {"country": "UK", "downloads": 3},
        {"country": "CA", "downloads": 1}
      ]
    }
  }
}
```

### Blockchain Integration

#### Verify Payment

```http
POST /blockchain/verify-payment
```

**Request Body:**
```json
{
  "txHash": "0x...",
  "expectedAmount": 0.05,
  "expectedRecipient": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "amount": 0.05,
    "from": "0x...",
    "to": "0x...",
    "blockNumber": 12345,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Transaction Status

```http
GET /blockchain/transaction/{txHash}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "0x...",
    "status": "confirmed",
    "blockNumber": 12345,
    "confirmations": 6,
    "gasUsed": "21000",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `PAYMENT_VERIFICATION_FAILED`: Blockchain payment verification failed
- `FILE_UPLOAD_FAILED`: IPFS upload failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate limited:

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **File upload endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

FilePay supports webhooks for real-time notifications:

### Webhook Events

- `file.created`: New file uploaded
- `download.created`: New download initiated
- `payment.completed`: Payment successfully processed
- `file.deleted`: File removed

### Webhook Payload

```json
{
  "event": "download.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "downloadId": "download_id",
    "fileId": "file_id",
    "buyerWalletAddress": "0x...",
    "amount": 0.05
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { FilePayAPI } from '@filepay/sdk';

const api = new FilePayAPI({
  baseURL: 'https://api.filepay.app',
  apiKey: 'your-api-key'
});

// Upload file
const file = await api.files.create({
  fileName: 'document.pdf',
  price: 0.05,
  accessDuration: 24,
  maxDownloads: 100
});

// Get analytics
const analytics = await api.analytics.getCreator('creator_id', {
  range: '30d'
});
```

### Python

```python
from filepay import FilePayAPI

api = FilePayAPI(
    base_url='https://api.filepay.app',
    api_key='your-api-key'
)

# Create download
download = api.downloads.create(
    file_id='file_id',
    buyer_wallet_address='0x...',
    payment_tx_hash='0x...'
)
```

## Testing

### Test Environment

```
Base URL: https://api-staging.filepay.app
Test USDC: 0x... (Base Sepolia)
```

### Test Data

Use these test wallet addresses and transaction hashes for testing:

```
Test Creator: 0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2
Test Buyer: 0x8ba1f109551bD432803012645Hac136c30C6756
Test TX Hash: 0x1234567890abcdef...
```

## Support

- **Documentation**: [docs.filepay.app](https://docs.filepay.app)
- **API Status**: [status.filepay.app](https://status.filepay.app)
- **Support Email**: api-support@filepay.app
- **Discord**: [Join our developer community](https://discord.gg/filepay-dev)
