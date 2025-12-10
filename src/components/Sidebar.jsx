import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined,
  SettingOutlined,
  BgColorsOutlined,
  UserAddOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ collapsed, onMenuSelect }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'employees', icon: <TeamOutlined />, label: 'All Employees' },
    { key: 'recruitment', icon: <UserAddOutlined />, label: 'Recruitment' },
    { key: 'attendance', icon: <ScheduleOutlined />, label: 'Attendance' },
    { type: 'divider' },
    { key: 'settings', icon: <SettingOutlined />, label: 'System Settings' },
    { key: 'theme', icon: <BgColorsOutlined />, label: 'Appearance' }
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={260}
      style={{ 
        // Background Context nundi vastundi
        background: currentTheme.colorBgContainer,
        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 1001
      }}
    >
      <div style={{ 
        height: 70, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 24px',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
      }}>
        {collapsed ? (
           <div style={{ width: 32, height: 32, background: currentTheme.colorPrimary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>H</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: currentTheme.colorPrimary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>H</div>
            {/* Title Color Fix: Dark mode lo White, Light mode lo Black */}
            <Title level={4} style={{ margin: 0, color: currentTheme.colorText, fontSize: 18 }}>
              HRM Portal
            </Title>
          </div>
        )}
      </div>
      
      {/* IMPORTANT FIX: theme prop added */}
      <Menu
        theme={isDarkMode ? 'dark' : 'light'} 
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        items={menuItems}
        onClick={({ key }) => onMenuSelect(key)}
        style={{ 
          borderRight: 0, 
          background: 'transparent', // Transparent to show Sider background
          marginTop: 10,
          padding: '0 8px',
          color: currentTheme.colorText // Fallback color
        }}
      />
    </Sider>
  );
};

export default Sidebar;