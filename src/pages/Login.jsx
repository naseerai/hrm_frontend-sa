import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    const result = await authService.login(values.email, values.password);
    
    if (result.success) {
      message.success('Welcome back!');
      if (onLogin) onLogin();
    } else {
      message.error(result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    // Theme Configuration for Glass/Dark Mode look
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff', // Professional Corporate Blue
          colorText: '#ffffff',
          colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
          colorBgContainer: 'rgba(255, 255, 255, 0.08)',
          colorBorder: 'rgba(255, 255, 255, 0.15)',
        },
        components: {
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            activeBorderColor: '#1677ff',
            hoverBorderColor: '#1677ff',
            colorText: '#ffffff',
            paddingBlock: 12,
            borderRadius: 8,
          },
          Button: {
            controlHeight: 48,
            borderRadius: 8,
            defaultBorderColor: 'rgba(255, 255, 255, 0.2)',
            defaultBg: 'rgba(255, 255, 255, 0.05)',
            defaultColor: '#ffffff',
          }
        }
      }}
    >
      <div className="login-container">
        <style>
          {`
            /* FULL SCREEN FIX */
            .login-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              /* Professional Office Background */
              background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop');
              background-size: cover;
              background-position: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }

            /* Professional Gradient Overlay (Navy/Black) */
            .login-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.85) 100%);
              backdrop-filter: blur(3px);
              z-index: 1;
            }
            
            .content-wrapper {
              position: relative;
              z-index: 2;
              width: 100%;
              max-width: 1200px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 40px;
              box-sizing: border-box;
            }

            .left-branding {
              flex: 1;
              color: white;
              padding-right: 60px;
              display: none;
            }

            .right-form {
              flex: 1;
              max-width: 440px;
              width: 100%;
              margin: 0 auto;
            }

            /* Refined Glass Card for Enterprise look */
            .glass-card {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              padding: 48px 40px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .accent-text {
              color: #60a5fa; /* Light Blue Accent */
              font-weight: 600;
            }

            @media (min-width: 992px) {
              .left-branding {
                display: block;
              }
              .right-form {
                margin: 0; /* Align right on desktop */
              }
            }
          `}
        </style>

        <div className="content-wrapper">
          {/* Left Side: Professional HRM Branding */}
          <div className="left-branding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
              {/* <div style={{ width: 40, height: 40, background: '#1677ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GlobalOutlined style={{ fontSize: 24, color: 'white' }} />
              </div> */}
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '1px' }}>HRM PORTAL</span>
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, color: 'white' }}>
              Streamline Your <br />
              <span className="accent-text">Workforce</span>
            </h1>
            
            <p style={{ fontSize: '1.2rem', opacity: 0.85, fontWeight: 400, marginBottom: 32, lineHeight: 1.6, maxWidth: 500 }}>
              Seamlessly manage employee records, payroll, performance, and recruitment in one unified platform.
            </p>

            <div style={{ display: 'flex', gap: 40 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>10k+</h3>
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Employees Managed</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>99.9%</h3>
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>System Uptime</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="right-form">
            <div className="glass-card">
              <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ color: 'white', margin: '0 0 8px 0', fontWeight: 600 }}>
                   Login
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Please enter your  credentials
                </Text>
              </div>

              <Form
                layout="vertical"
                onFinish={handleFinish}
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Corporate email is required' }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} 
                    placeholder="Corporate Email" 
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Password is required' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} 
                    placeholder="Password" 
                  />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
                    Need Help?
                  </Text>
                  <a style={{ color: '#60a5fa', fontSize: 13, fontWeight: 500 }}>
                    Reset Password
                  </a>
                </div>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block
                    loading={loading}
                    style={{ 
                      background: '#1677ff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 4px 14px 0 rgba(22, 119, 255, 0.4)'
                    }}
                  >
                    SIGN IN
                  </Button>
                </Form.Item>

                <Button 
                  block 
                  ghost
                  style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    borderColor: 'rgba(255,255,255,0.2)',
                    fontSize: 14
                  }}
                >
                  Single Sign-On (SSO)
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;