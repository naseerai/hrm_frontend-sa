import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Typography, Badge, Switch } from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
  UserOutlined, LogoutOutlined, IdcardOutlined,
  SunOutlined, MoonOutlined // Added Theme Icons
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({ collapsed, onToggle, onLogout, onViewChange }) => {
  // Added 'toggleTheme' back
  const { currentTheme, isDarkMode, toggleTheme } = useTheme();
  const user = authService.getCurrentUser();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
        onLogout();
    } else if (key === 'profile') {
        onViewChange('profile');
    }
  };

  const userMenuItems = [
    { 
        key: 'profile', 
        icon: <IdcardOutlined />, 
        label: 'My Profile' 
    },
    { type: 'divider' },
    { 
        key: 'logout', 
        icon: <LogoutOutlined />, 
        label: 'Logout', 
        danger: true 
    }
  ];

  return (
    <Header style={{ 
      padding: '0 24px', 
      background: currentTheme.colorBgContainer,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      position: 'sticky', top: 0, zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 16, color: currentTheme.colorText }}
        />
        <Text strong style={{ fontSize: 18, color: currentTheme.colorText }}>
          HRM Dashboard
        </Text>
      </div>
      
      <Space size={20}>
        {/* --- RESTORED THEME SWITCH --- */}
        <Switch 
          checkedChildren={<MoonOutlined />} 
          unCheckedChildren={<SunOutlined />} 
          checked={isDarkMode} 
          onChange={toggleTheme}
          style={{ background: isDarkMode ? '#1677ff' : '#bfbfbf' }}
        />

        <Badge count={0} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: currentTheme.colorText }} />
        </Badge>

        <Dropdown 
            menu={{ items: userMenuItems, onClick: handleMenuClick }} 
            placement="bottomRight"
            trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', padding: '4px 8px' }}>
            <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ color: currentTheme.colorText, fontSize: 14 }}>
                {user?.name || 'User'}
              </Text>
              <Text style={{ color: currentTheme.colorTextSecondary, fontSize: 11 }}>
                {user?.role ? user.role.toUpperCase() : 'ROLE'}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;