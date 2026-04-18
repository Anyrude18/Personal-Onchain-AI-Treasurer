import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import App from './App.jsx';
import { wagmiConfig } from './wagmiConfig.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rainbowTheme = darkTheme({
  accentColor: '#7c6ff7',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme} modalSize="compact">
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1d27',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#00c896', secondary: '#1a1d27' },
              },
              error: {
                iconTheme: { primary: '#e05252', secondary: '#1a1d27' },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
