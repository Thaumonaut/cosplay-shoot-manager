import '@testing-library/jest-dom';
import React from 'react';

// Some compiled JSX may reference React at runtime; ensure it's available globally for tests
(globalThis as any).React = React;
