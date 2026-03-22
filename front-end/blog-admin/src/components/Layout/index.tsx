// 主布局组件
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore, useSidebarStore } from '@/store';
import { logout as logoutApi } from '@/api/auth';
import styles from './Layout.module.css';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { user, clearAuth } = useAuthStore();
  const { collapsed, toggleCollapsed } = useSidebarStore();

  // 菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/article',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/category',
      icon: <AppstoreOutlined />,
      label: '分类管理',
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      try {
        await logoutApi();
      } finally {
        clearAuth();
        navigate('/login');
      }
    }
  };

  // 获取当前选中的菜单
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/article')) return ['/article'];
    if (path.startsWith('/category')) return ['/category'];
    if (path.startsWith('/dashboard')) return ['/dashboard'];
    return ['/dashboard'];
  };

  return (
    <Layout className={styles.layout}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={220}
        collapsedWidth={80}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>B</div>
          {!collapsed && <span className={styles.logoText}>Blog Admin</span>}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header className={styles.header} style={{ background: colorBgContainer }}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className={styles.trigger}
            />
          </div>

          <div className={styles.headerRight}>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div className={styles.user}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  className={styles.avatar}
                />
                <span className={styles.username}>{user?.nickname || user?.username || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区 */}
        <Content className={styles.content}>
          <div
            className={styles.contentWrapper}
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;