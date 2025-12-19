import React from 'react';
import { Card, Avatar, Typography, Row, Col, Tag, Divider, Descriptions } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, BankOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = ({ user }) => {
  if (!user) return null;

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <Title level={3} style={{ marginBottom: 24 }}>My Profile</Title>
      
      <Row gutter={[24, 24]}>
        {/* LEFT SIDE: ID CARD STYLE */}
        <Col xs={24} md={8}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              textAlign: 'center',
              height: '100%' 
            }}
          >
            <div style={{ marginBottom: 20 }}>
                <Avatar 
                    size={100} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1677ff', fontSize: 40 }}
                />
            </div>
            <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
                {user.role ? user.role.toUpperCase() : 'USER'}
            </Text>
            
            <div style={{ marginTop: 15 }}>
                <Tag color={user.active ? "success" : "error"}>
                    {user.active ? "ACTIVE EMPLOYEE" : "INACTIVE"}
                </Tag>
            </div>

            <Divider />
            
            <div style={{ textAlign: 'left', padding: '0 10px' }}>
                <p><IdcardOutlined /> <b>Emp ID:</b> {user.employ_id}</p>
                <p><BankOutlined /> <b>Joined:</b> {dayjs(user.createdat).format('DD MMM, YYYY')}</p>
            </div>
          </Card>
        </Col>

        {/* RIGHT SIDE: DETAILED INFO */}
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ borderRadius: 12, height: '100%' }}>
            <Title level={4}>Personal & Work Details</Title>
            <Divider style={{ margin: '12px 0 24px 0' }} />

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
              <Descriptions.Item label="Designation">
                {user.designation ? user.designation.replace('_', ' ').toUpperCase() : 'Not Assigned'}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Space><MailOutlined /> Personal Email</Space>}>
                {user.email}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Space><MailOutlined /> Office Email</Space>}>
                {user.office_mail}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Space><PhoneOutlined /> Mobile Number</Space>}>
                {user.mobile}
              </Descriptions.Item>

              <Descriptions.Item label="Account Status">
                {user.firstlogin ? "Pending Password Change" : "Verified"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Helper for icon spacing
const Space = ({ children }) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{children}</span>;

export default Profile;