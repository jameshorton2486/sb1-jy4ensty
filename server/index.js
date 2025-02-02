import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust first proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Rate limiting with proper IP extraction
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator to handle various IP sources
  keyGenerator: (req) => {
    return req.ip || 
           req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.'
    });
  }
});

app.use(limiter);

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Data encryption function
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.ENCRYPTION_KEY
  ).toString();
};

// Data decryption function
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Validate and sanitize document generation request
const validateDocRequest = [
  body('mappings').isArray().notEmpty(),
  body('csvData').isArray().notEmpty(),
  body('templateId').isString().notEmpty()
];

// Document generation endpoint
app.post('/api/generate-documents', 
  verifyToken,
  validateDocRequest,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { mappings, csvData, templateId } = req.body;
      
      // Decrypt sensitive data if needed
      const decryptedData = decryptData(csvData);

      // Initialize Google Docs API client
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: req.user.accessToken });
      
      const docs = google.docs({ version: 'v1', auth });
      
      // Process documents in batches to avoid rate limits
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < decryptedData.length; i += batchSize) {
        const batch = decryptedData.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (row) => {
          try {
            // Create a copy of the template
            const copy = await docs.documents.copy({
              documentId: templateId,
              requestBody: {
                name: `Generated Document - ${row[mappings.name] || 'Untitled'}`
              }
            });

            // Replace placeholders with data
            const requests = mappings.map(mapping => ({
              replaceAllText: {
                containsText: {
                  text: mapping.placeholder,
                  matchCase: true
                },
                replaceText: row[mapping.csvColumn] || ''
              }
            }));

            await docs.documents.batchUpdate({
              documentId: copy.data.documentId,
              requestBody: { requests }
            });

            return {
              success: true,
              documentId: copy.data.documentId,
              name: copy.data.title
            };
          } catch (error) {
            console.error('Document generation error:', error);
            return {
              success: false,
              error: 'Failed to generate document'
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});