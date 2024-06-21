import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import * as History from 'history';
import { ThemeProvider } from '@mui/material';
import { theme } from './assets/theme';
import App from './App';
import createStore from './redux/store/store';

const history = History.createBrowserHistory();
export const store = createStore();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
export const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
