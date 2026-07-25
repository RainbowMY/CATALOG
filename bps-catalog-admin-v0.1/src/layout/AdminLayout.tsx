import { Avatar, Badge, Input, Breadcrumb } from 'antd'
import {
  AppstoreOutlined,
  FileTextOutlined,
  InboxOutlined,
  SendOutlined,
  DollarCircleOutlined,
  SlidersOutlined,
  BarChartOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  LayoutOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, NavLink } from 'react-router-dom'

/** OPS 一级壳层（仅样式，无交互） */
const OPS_RAIL = [
  { key: 'workbench', icon: <AppstoreOutlined />, label: '工作台' },
  { key: 'oms', icon: <FileTextOutlined />, label: 'Oms' },
  { key: 'pims', icon: <InboxOutlined />, label: '产品库' },
  { key: 'ads', icon: <SendOutlined />, label: 'Ads' },
  { key: 'fund', icon: <DollarCircleOutlined />, label: 'Fund' },
  { key: 'bps', icon: <SlidersOutlined />, label: 'BPS' },
  { key: 'report', icon: <BarChartOutlined />, label: 'Report' },
  { key: 'system', icon: <ClusterOutlined />, label: '系统管理' },
]

const CATALOG_MENU = [
  { key: '/products', label: '商品库', icon: <DatabaseOutlined /> },
  { key: '/slots', label: '资源位', icon: <LayoutOutlined /> },
  { key: '/categories', label: '分类', icon: <AppstoreOutlined /> },
]

const BREADCRUMB_MAP: Record<string, string> = {
  '/products': '商品库',
  '/slots': '资源位',
  '/categories': '分类',
}

export function AdminLayout() {
  const location = useLocation()
  const activeKey = '/' + location.pathname.split('/')[1]
  const breadcrumbName = BREADCRUMB_MAP[activeKey] ?? ''

  return (
    <div className="admin-shell">
      {/* 一级图标轨 */}
      <aside className="ops-primary-rail" aria-hidden>
        <div className="ops-logo" />
        <div className="ops-primary-list">
          {OPS_RAIL.map((m) => (
            <div
              key={m.key}
              className={`ops-primary-item${m.key === 'bps' ? ' is-active' : ''}`}
            >
              <span className="ops-primary-icon">{m.icon}</span>
              <span className="ops-primary-label">{m.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* 二级菜单 */}
      <aside className="ops-secondary-rail">
        <div className="ops-secondary-title">BPS</div>
        <nav className="ops-secondary-menu">
          {CATALOG_MENU.map((m) => (
            <NavLink
              key={m.key}
              to={m.key}
              className={({ isActive }) =>
                `ops-secondary-item${isActive || activeKey === m.key ? ' is-active' : ''}`
              }
            >
              <span className="ops-secondary-icon">{m.icon}</span>
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 右侧：顶栏 + 内容 */}
      <div className="admin-main">
        <header className="admin-header">
          <Breadcrumb
            items={[
              { title: 'BPS' },
              { title: 'Catalog' },
              ...(breadcrumbName ? [{ title: breadcrumbName }] : []),
            ]}
          />
          <div className="admin-header-right">
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索"
              className="admin-header-search"
              size="middle"
              allowClear
            />
            <MoonOutlined className="admin-header-icon" />
            <Badge dot>
              <BellOutlined className="admin-header-icon" />
            </Badge>
            <QuestionCircleOutlined className="admin-header-icon" />
            <Avatar size={28} style={{ background: '#1677ff' }}>运</Avatar>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
