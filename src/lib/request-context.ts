/**
 * @fileoverview Helpers for extracting request metadata used in logging and tracing.
 *
 * Exports getRequestId (reads x-request-id/x-correlation-id headers or generates
 * a nanoid), getClientIP (reads common proxy headers such as x-forwarded-for),
 * and getRequestContext, which bundles both with a timestamp for structured log
 * entries in server actions and API routes.
 */
import { nanoid } from 'nanoid';
import { headers } from 'next/headers';

/**
 * Gets a unique identifier for the current request
 * Tries to use the request ID header if available, otherwise generates a new ID
 */
export async function getRequestId(): Promise<string> {
  // Try to get the request ID from headers if available
  const headersList = await headers();
  const requestId = headersList.get('x-request-id') || headersList.get('x-correlation-id');
  
  if (requestId) {
    return requestId;
  }
  
  // Generate a new request ID if not available in headers
  return nanoid(12);
}

/**
 * Gets the client IP address from request headers
 */
export async function getClientIP(): Promise<string | null> {
  const headersList = await headers();
  
  // Try common headers for client IP
  return headersList.get('x-forwarded-for') || 
         headersList.get('x-real-ip') || 
         headersList.get('cf-connecting-ip') || 
         null;
}

/**
 * Gets a context object with useful information about the current request
 */
export async function getRequestContext() {
  return {
    requestId: await getRequestId(),
    clientIP: await getClientIP(),
    timestamp: new Date().toISOString(),
  };
} 