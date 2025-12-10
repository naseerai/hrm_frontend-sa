import React from 'react';
import { Card, Typography, Space, ColorPicker, Switch, Button, Divider } from 'antd';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const ThemeSettings = () => {
  const { 
    isDarkMode, 
    lightTheme, 
    darkTheme, 
    toggleTheme, 
    updateLightTheme, 
    updateDarkTheme,
    resetThemes,
    currentTheme 
  } = useTheme();

  const handleColorChange = (colorKey, color, isLight) => {
    const hexColor = typeof color === 'string' ? color : color.toHexString();
    
    if (isLight) {
      updateLightTheme({ ...lightTheme, [colorKey]: hexColor });
    } else {
      updateDarkTheme({ ...darkTheme, [colorKey]: hexColor });
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 12, 
          // Card background change based on theme
          background: currentTheme.colorBgContainer,
          border: isDarkMode ? '1px solid #303030' : 'none'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          {/* Main Title Color Fixed */}
          <Title level={3} style={{ margin: 0, color: currentTheme.colorText }}>
            Appearance
          </Title>
          <Text style={{ color: currentTheme.colorTextSecondary }}>
            Customize the look and feel of your portal
          </Text>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Dark Mode Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <Text strong style={{ fontSize: 16, color: currentTheme.colorText }}>
                Dark Mode
              </Text>
              <br />
              <Text style={{ color: currentTheme.colorTextSecondary }}>
                Switch between light and dark themes
              </Text>
            </div>
            <Switch checked={isDarkMode} onChange={toggleTheme} />
          </div>

          <Divider style={{ borderColor: isDarkMode ? '#424242' : '#e8e8e8' }} />

          {/* Light Theme Settings */}
          <div>
            <Title level={5} style={{ color: currentTheme.colorText, marginBottom: 16 }}>
              Light Theme Colors
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: currentTheme.colorText }}>Brand Color</Text>
                <ColorPicker 
                  value={lightTheme.colorPrimary}
                  onChange={(c) => handleColorChange('colorPrimary', c, true)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: currentTheme.colorText }}>Container Background</Text>
                <ColorPicker 
                  value={lightTheme.colorBgContainer}
                  onChange={(c) => handleColorChange('colorBgContainer', c, true)}
                />
              </div>
            </Space>
          </div>

          <Divider style={{ borderColor: isDarkMode ? '#424242' : '#e8e8e8' }} />

          {/* Dark Theme Settings */}
          <div>
            <Title level={5} style={{ color: currentTheme.colorText, marginBottom: 16 }}>
              Dark Theme Colors
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: currentTheme.colorText }}>Brand Color</Text>
                <ColorPicker 
                  value={darkTheme.colorPrimary}
                  onChange={(c) => handleColorChange('colorPrimary', c, false)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: currentTheme.colorText }}>Container Background</Text>
                <ColorPicker 
                  value={darkTheme.colorBgContainer}
                  onChange={(c) => handleColorChange('colorBgContainer', c, false)}
                />
              </div>
            </Space>
          </div>

          <Divider style={{ borderColor: isDarkMode ? '#424242' : '#e8e8e8' }} />

          <Button block danger onClick={resetThemes}>
            Reset to Defaults
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ThemeSettings;