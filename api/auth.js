/**
 * API Auth Endpoint - Facilita Estudante LITE
 * Intervixus Corp Security Pattern
 * 
 * Validates custom header and fetches config from private blob storage.
 * This protects your Firebase credentials from unauthorized access.
 */

import { get } from '@vercel/blob';

// Configuration
const BLOB_FILE_URL = "https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/config/firebase-config.js";

/**
 * Get the secret key from environment variables
 * Configure this in Vercel Dashboard: Settings > Environment Variables
 * Name: INTERVIXUS_SECRET_KEY
 * Value: Your chosen secret (e.g., Facilita123)
 */
const getSecretKey = () => {
  return process.env.INTERVIXUS_SECRET_KEY;
};

/**
 * Main API handler
 * @param {Object} request - Vercel request object
 * @param {Object} response - Vercel response object
 */
export default async function handler(request, response) {
  // 1. Get the custom header
  const authHeader = request.headers['x-intervixus-auth'];
  const secretKey = getSecretKey();

  // 2. Validate: If header is wrong, block immediately!
  if (!authHeader || authHeader !== secretKey) {
    return response.status(401).json({ 
      error: 'Acesso negado pela Intervixus Corp',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    // 3. Fetch from private blob storage
    const file = await fetch(BLOB_FILE_URL);
    
    if (!file.ok) {
      throw new Error('Failed to fetch from blob storage');
    }
    
    const content = await file.text();

    // 4. Return the Firebase config content
    response.status(200).send(content);
  } catch (error) {
    console.error('Blob fetch error:', error);
    response.status(500).json({ 
      error: 'Erro ao conectar com o inter-cloud',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Alternative: Get config for other files
 * Use this to fetch core/styles.css or other protected files
 * @param {string} filePath - Path to the file in blob storage
 */
export const getConfigFile = async (authHeader, filePath) => {
  const secretKey = getSecretKey();
  
  // Validate header
  if (!authHeader || authHeader !== secretKey) {
    throw new Error('Unauthorized');
  }

  // Map of available files
  const fileUrls = {
    'firebase-config': 'https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/config/firebase-config.js',
    'security-headers': 'https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/Action/security-headers.js',
    'app-logic': 'https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/core/app-logic.js',
    'styles': 'https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/core/styles.css',
    'encryption': 'https://zed3s7uyvqaxtfrp.private.blob.vercel-storage.com/Inter%20cloud/utils/encryption.js'
  };

  const fileUrl = fileUrls[filePath];
  
  if (!fileUrl) {
    throw new Error('File not found');
  }

  const file = await fetch(fileUrl);
  return await file.text();
};
