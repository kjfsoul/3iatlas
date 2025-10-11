'use client';

import { useEffect } from 'react';

/**
 * Runtime Error Handler for Browser Extension Conflicts
 * Handles common browser extension errors that don't affect app functionality
 */
export const useRuntimeErrorHandler = () => {
  useEffect(() => {
    // Handle runtime.lastError from browser extensions
    const handleRuntimeError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check for common browser extension errors
      if (error?.message?.includes('runtime.lastError') || 
          error?.message?.includes('Could not establish connection') ||
          error?.message?.includes('Receiving end does not exist')) {
        
        console.warn('[RuntimeErrorHandler] Browser extension error (non-critical):', error.message);
        
        // Prevent the error from bubbling up
        event.preventDefault();
        event.stopPropagation();
        
        return false;
      }
      
      // Check for custom element redefinition errors
      if (error?.message?.includes('custom element') && 
          error?.message?.includes('has already been defined')) {
        
        console.warn('[RuntimeErrorHandler] Custom element redefinition (non-critical):', error.message);
        
        // Prevent the error from bubbling up
        event.preventDefault();
        event.stopPropagation();
        
        return false;
      }
      
      // Check for webcomponents errors
      if (error?.stack?.includes('webcomponents-ce.js') ||
          error?.stack?.includes('overlay_bundle.js')) {
        
        console.warn('[RuntimeErrorHandler] WebComponents error (non-critical):', error.message);
        
        // Prevent the error from bubbling up
        event.preventDefault();
        event.stopPropagation();
        
        return false;
      }
    };

    // Handle unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      if (reason?.message?.includes('runtime.lastError') ||
          reason?.message?.includes('Could not establish connection') ||
          reason?.message?.includes('Receiving end does not exist')) {
        
        console.warn('[RuntimeErrorHandler] Extension promise rejection (non-critical):', reason.message);
        
        // Prevent the rejection from being logged as an error
        event.preventDefault();
        
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleRuntimeError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleRuntimeError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

/**
 * Global error handler for the application
 * Should be called once in the root component
 */
export const initializeErrorHandling = () => {
  // Override console.error to filter out extension errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out common browser extension errors
    if (message.includes('runtime.lastError') ||
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('custom element') && message.includes('has already been defined') ||
        message.includes('webcomponents-ce.js') ||
        message.includes('overlay_bundle.js')) {
      
      // Log as warning instead of error
      console.warn('[Filtered Extension Error]:', ...args);
      return;
    }
    
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (error?.message?.includes('runtime.lastError') ||
        error?.message?.includes('Could not establish connection') ||
        error?.message?.includes('Receiving end does not exist')) {
      
      console.warn('[Global Error Handler] Extension error (non-critical):', error.message);
      event.preventDefault();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    if (reason?.message?.includes('runtime.lastError') ||
        reason?.message?.includes('Could not establish connection') ||
        reason?.message?.includes('Receiving end does not exist')) {
      
      console.warn('[Global Error Handler] Extension promise rejection (non-critical):', reason.message);
      event.preventDefault();
      return false;
    }
  });
};

export default useRuntimeErrorHandler;
