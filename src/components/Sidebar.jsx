import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { 
  AppstoreOutlined, TeamOutlined, UserOutlined, FileTextOutlined, RocketOutlined 
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ collapsed, onMenuSelect }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  const menuItems = [
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: 'users', icon: <TeamOutlined />, label: 'User Management' },
    // NEW ITEM
    { key: 'careers', icon: <RocketOutlined />, label: 'Careers & Jobs' },
    
    { key: 'attendance', icon: <FileTextOutlined />, label: 'Attendance' },
    // { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={250}
      style={{ 
        background: currentTheme.colorBgContainer,
        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        height: '100vh',
        position: 'sticky', top: 0, left: 0, zIndex: 1001
      }}
    >
      <div style={{ 
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: currentTheme.colorPrimary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>H</div>
            {!collapsed && <Title level={4} style={{ margin: 0, color: currentTheme.colorText }}>HRM Portal</Title>}
        </div>
      </div>
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        items={menuItems}
        onClick={({ key }) => onMenuSelect(key)}
        style={{ marginTop: 10, background: 'transparent' }}
      />
    </Sider>
  );
};

export default Sidebar;