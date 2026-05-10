// 主入口文件
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6', // SYS.LOG primary
          colorBgBase: '#09090b', // SYS.LOG bg
          colorBgContainer: '#121214',
          colorBgElevated: '#1c1c1f',
          colorTextBase: '#e4e4e7',
          colorTextSecondary: '#a1a1aa',
          colorBorder: '#27272a',
          colorBorderSecondary: '#18181b',
          borderRadius: 4,
          fontFamily: "'Inter', 'JetBrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        },
        components: {
          Layout: {
            headerBg: '#09090b',
            siderBg: '#09090b',
            bodyBg: '#09090b',
          },
          Card: {
            colorBorderSecondary: '#27272a',
          },
          Menu: {
            colorItemBg: '#09090b',
            colorSubItemBg: '#09090b',
          }
        }
      }}
    >
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);