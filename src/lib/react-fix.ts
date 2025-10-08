/**
 * React bundling fix
 * This ensures React is properly imported before any other dependencies
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Re-export to ensure single React instance
export { React, ReactDOM };

// Make React globally available for dependencies that expect it
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
}
