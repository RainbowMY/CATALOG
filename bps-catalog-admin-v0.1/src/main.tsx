import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorLink: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
          colorBgLayout: '#f5f7fa',
          colorBorderSecondary: '#eef0f3',
        },
        components: {
          Layout: {
            siderBg: '#ffffff',
            headerBg: '#ffffff',
            bodyBg: '#f5f7fa',
            triggerBg: '#ffffff',
          },
          Menu: {
            itemBorderRadius: 6,
            itemMarginInline: 8,
          },
          Card: {
            paddingLG: 24,
          },
          Table: {
            headerBg: '#fafafa',
          },
        },
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </ConfigProvider>
  </StrictMode>,
)
