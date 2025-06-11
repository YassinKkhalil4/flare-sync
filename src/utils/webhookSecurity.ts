
import { createHmac, timingSafeEqual } from 'crypto';

export class WebhookSecurity {
  /**
   * Verify Stripe webhook signature
   */
  static verifyStripeSignature(
    payload: string,
    signature: string,
    secret: string,
    tolerance: number = 300 // 5 minutes
  ): boolean {
    try {
      const elements = signature.split(',');
      const signatureElements: { [key: string]: string } = {};
      
      for (const element of elements) {
        const [key, value] = element.split('=');
        signatureElements[key] = value;
      }
      
      const timestamp = parseInt(signatureElements.t, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check timestamp tolerance
      if (currentTime - timestamp > tolerance) {
        console.error('Webhook timestamp too old');
        return false;
      }
      
      // Verify signature
      const payloadForSigning = `${timestamp}.${payload}`;
      const expectedSignature = createHmac('sha256', secret)
        .update(payloadForSigning)
        .digest('hex');
      
      const providedSignature = signatureElements.v1;
      
      return timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying Stripe signature:', error);
      return false;
    }
  }
  
  /**
   * Verify Paddle webhook signature
   */
  static verifyPaddleSignature(
    payload: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      // Note: This is a simplified version. In production, you would use
      // the crypto module with RSA verification for Paddle webhooks
      const expectedHash = createHmac('sha256', publicKey)
        .update(payload)
        .digest('hex');
      
      return timingSafeEqual(
        Buffer.from(expectedHash),
        Buffer.from(signature)
      );
    } catch (error) {
      console.error('Error verifying Paddle signature:', error);
      return false;
    }
  }
  
  /**
   * Generic HMAC verification for custom webhooks
   */
  static verifyHmacSignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: 'sha256' | 'sha1' = 'sha256'
  ): boolean {
    try {
      const expectedSignature = createHmac(algorithm, secret)
        .update(payload)
        .digest('hex');
      
      // Handle different signature formats (with or without algorithm prefix)
      const cleanSignature = signature.replace(/^(sha256=|sha1=)/, '');
      
      return timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(cleanSignature)
      );
    } catch (error) {
      console.error('Error verifying HMAC signature:', error);
      return false;
    }
  }
  
  /**
   * Rate limiting for webhook endpoints
   */
  static checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 900000 // 15 minutes
  ): boolean {
    const key = `webhook_rate_limit_${identifier}`;
    const now = Date.now();
    
    // In production, this should use Redis or a database
    // For now, using in-memory storage
    const stored = (global as any)[key];
    
    if (!stored) {
      (global as any)[key] = { count: 1, resetTime: now + windowMs };
      return true;
    }
    
    if (now > stored.resetTime) {
      (global as any)[key] = { count: 1, resetTime: now + windowMs };
      return true;
    }
    
    if (stored.count >= limit) {
      return false;
    }
    
    stored.count++;
    return true;
  }
  
  /**
   * Validate webhook payload structure
   */
  static validatePayloadStructure(
    payload: any,
    requiredFields: string[]
  ): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    
    for (const field of requiredFields) {
      if (!(field in payload)) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  }
}
