import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ContextProviders } from './contexts';
import './index.css';
import 'antd/dist/antd.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <RecoilRoot>
    <Router>
      <ContextProviders>
        <App />
      </ContextProviders>
    </Router>
  </RecoilRoot>
);