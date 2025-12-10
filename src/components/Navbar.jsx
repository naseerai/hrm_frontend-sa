import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Typography, Badge, Input } from 'antd';
import { 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({ collapsed, onToggle, onLogout }) => {
  const { currentTheme, isDarkMode } = useTheme();
  const user = authService.getCurrentUser();

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Account Settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: onLogout }
  ];

  return (
    <Header style={{ 
      padding: '0 24px', 
      background: isDarkMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ 
            fontSize: 16, 
            width: 40, 
            height: 40,
            color: currentTheme.colorText // ICON COLOR FIX
          }}
        />
        
        <Input 
          prefix={<SearchOutlined style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.25)' }} />} 
          placeholder="Search employees..." 
          bordered={false}
          style={{ 
            background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
            borderRadius: 8,
            width: 250,
            color: currentTheme.colorText, // INPUT TEXT COLOR FIX
            display: window.innerWidth > 768 ? 'flex' : 'none'
          }}
        />
      </div>
      
      <Space size={20}>
        {/* ICON COLORS FIX */}
        <Button 
          type="text" 
          icon={<QuestionCircleOutlined />} 
          style={{ color: currentTheme.colorText }} 
        />
        
        <Badge count={5} size="small" offset={[-5, 5]}>
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: 18 }} />} 
            style={{ color: currentTheme.colorText }} 
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'all 0.3s' }}>
            <Avatar 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              icon={<UserOutlined />} 
              style={{ background: currentTheme.colorPrimary, border: '2px solid rgba(255,255,255,0.2)' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              {/* USER NAME COLOR FIX */}
              <Text strong style={{ color: currentTheme.colorText, fontSize: 14 }}>
                {user?.name || 'Admin User'}
              </Text>
              <Text style={{ color: currentTheme.colorTextSecondary, fontSize: 11 }}>
                HR Manager
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;