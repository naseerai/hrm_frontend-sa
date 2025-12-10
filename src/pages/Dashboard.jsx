import React, { useState } from 'react';
import { Layout, Card, Typography, Row, Col, Table, Tag, Avatar, ConfigProvider, theme } from 'antd';
import { 
  TeamOutlined, 
  UserAddOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ThemeSettings from './ThemeSettings';

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  // Theme context nundi values tesukuntunnam
  const { currentTheme, isDarkMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // --- DUMMY DATA ---
  const statsData = [
    { title: 'Total Employees', value: 124, prefix: <TeamOutlined />, color: '#1677ff', bg: isDarkMode ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)' },
    { title: 'New Hires', value: 12, prefix: <UserAddOutlined />, color: '#52c41a', bg: isDarkMode ? 'rgba(82, 196, 26, 0.15)' : 'rgba(82, 196, 26, 0.1)' },
    { title: 'On Time Today', value: '92%', prefix: <CheckCircleOutlined />, color: '#722ed1', bg: isDarkMode ? 'rgba(114, 46, 209, 0.15)' : 'rgba(114, 46, 209, 0.1)' },
    { title: 'Pending Requests', value: 5, prefix: <ClockCircleOutlined />, color: '#faad14', bg: isDarkMode ? 'rgba(250, 173, 20, 0.15)' : 'rgba(250, 173, 20, 0.1)' },
  ];

  const employeeColumns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${text}`} />
          <Text strong style={{ whiteSpace: 'nowrap' }}>{text}</Text>
        </div>
      ),
    },
    { title: 'Role', dataIndex: 'role', key: 'role', ellipsis: true },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'orange'}>{status}</Tag>
      )
    },
    { title: 'Department', dataIndex: 'dept', key: 'dept', ellipsis: true },
  ];

  const dummyEmployees = [
    { key: '1', name: 'John Doe', role: 'Frontend Dev', status: 'Active', dept: 'Engineering' },
    { key: '2', name: 'Alice Smith', role: 'UI/UX Designer', status: 'Active', dept: 'Design' },
    { key: '3', name: 'Robert Fox', role: 'Project Manager', status: 'On Leave', dept: 'Product' },
    { key: '4', name: 'Emma Watson', role: 'HR Executive', status: 'Active', dept: 'Human Resources' },
  ];

  const renderContent = () => {
    if (currentPage === 'theme') {
      return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ThemeSettings />
        </div>
      );
    }

    if (currentPage === 'employees') {
      return (
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Title level={3}>All Employees</Title>
          <Table dataSource={dummyEmployees} columns={employeeColumns} pagination={false} scroll={{ x: 800 }} />
        </Card>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard Overview</Title>
          <Text type="secondary">Welcome back, Here is what's happening today.</Text>
        </div>

        <Row gutter={[24, 24]}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              {/* Card Background automatically handled by ConfigProvider now */}
              <Card bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 14 }}>{stat.title}</Text>
                    <Title level={2} style={{ margin: '8px 0 0', fontWeight: 700 }}>{stat.value}</Title>
                  </div>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 12, background: stat.bg, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: 24
                  }}>
                    {stat.prefix}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card title="Recent Recruitments" bordered={false} style={{ borderRadius: 12 }}>
          <Table columns={employeeColumns} dataSource={dummyEmployees} pagination={false} scroll={{ x: 800 }} />
        </Card>
      </div>
    );
  };

  return (
    // IMPORTANT: ConfigProvider wraps everything to inject Dark Mode styles automatically
    <ConfigProvider
      theme={{
        // Algorithm: Automatic Dark Mode calculation for Tables, Cards, etc.
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgContainer: currentTheme.colorBgContainer,
          colorBgLayout: currentTheme.colorBgLayout,
          colorText: currentTheme.colorText,
          colorTextHeading: currentTheme.colorText,
          colorPrimary: currentTheme.colorPrimary,
        },
      }}
    >
      <Layout style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden' 
      }}>
        
        <Sidebar 
          collapsed={collapsed} 
          onMenuSelect={setCurrentPage} 
        />
        
        <Layout style={{ 
          background: currentTheme.colorBgLayout,
          overflowY: 'auto', 
          height: '100vh'
        }}>
          
          <Navbar 
            collapsed={collapsed} 
            onToggle={() => setCollapsed(!collapsed)}
            onLogout={handleLogout}
          />
          
          <Content style={{ 
            margin: '24px',
            padding: 0,
            minHeight: 280,
            maxWidth: '100%'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;