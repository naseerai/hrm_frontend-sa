import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Row, Col, Empty, Tooltip, Upload 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, MailOutlined, MobileOutlined, ReloadOutlined, 
  KeyOutlined, FilterOutlined, UploadOutlined 
} from '@ant-design/icons';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Watch Form Values
  const selectedRole = Form.useWatch('role', form);
  const selectedDesignation = Form.useWatch('designation', form);

  const myRole = authService.getRole()?.toLowerCase() || '';
  const myEmpId = authService.getEmployeeId();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedDesignation === 'team_member') {
        fetchTeamLeads();
    }
  }, [selectedDesignation]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        setAllUsers(res.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    setLoading(false);
  };

  const fetchTeamLeads = async () => {
      try {
          const res = await userService.getTeamLeads();
          if (res.success && Array.isArray(res.data)) {
              setTeamLeads(res.data);
          }
      } catch (error) {
          console.error("Failed to fetch leads", error);
      }
  };

  const getFilterOptions = () => {
    if (myRole === 'superadmin') return ['admin', 'hr', 'recruiter'];
    if (myRole === 'admin') return ['hr', 'recruiter'];
    if (myRole === 'hr') return ['recruiter'];
    return [];
  };

  const getCreatableRoles = () => {
    if (myRole === 'superadmin') return ['admin', 'hr', 'recruiter'];
    if (myRole === 'admin') return ['hr', 'recruiter'];
    if (myRole === 'hr') return ['recruiter'];
    return [];
  };

  const getFilteredUsers = () => {
    if (!allUsers.length) return [];
    return allUsers.filter(user => {
        const targetRole = user.role?.toLowerCase() || '';
        let isAllowed = false;
        if (myRole === 'superadmin') isAllowed = true;
        else if (myRole === 'admin') isAllowed = ['hr', 'recruiter', 'employee'].includes(targetRole);
        else if (myRole === 'hr') isAllowed = ['recruiter', 'employee'].includes(targetRole);
        
        if (!isAllowed) return false;
        if (roleFilter !== 'all') return targetRole === roleFilter;
        return true;
    });
  };

  // --- NEW: VALIDATE IMAGE TYPE (JPG/PNG ONLY) ---
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2; // 2MB limit
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M ? false : Upload.LIST_IGNORE; // Prevent auto upload
  };

  // --- UPDATED: HANDLE FORM SUBMIT WITH FORMDATA ---
  const handleFinish = async (values) => {
    setLoading(true);

    // 1. Create FormData Object
    const formData = new FormData();
    
    // 2. Append Standard Fields
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('office_mail', values.office_mail);
    formData.append('role', values.role);
    formData.append('mobile', values.mobile);
    formData.append('created_by', myEmpId || 'dev');

    // 3. Append Optional Fields
    if (values.role === 'recruiter' && values.designation) {
        formData.append('designation', values.designation);
    }
    if (values.role === 'recruiter' && values.designation === 'team_member' && values.team_lead_id) {
        formData.append('team_lead_id', values.team_lead_id);
    }

    // 4. Append Profile Picture (If selected)
    // Ant Design Upload gives array in values.profile_picture
    if (values.profile_picture && values.profile_picture.length > 0) {
        // originFileObj contains the raw file
        formData.append('profile_picture', values.profile_picture[0].originFileObj);
    }

    let result;
    try {
        if (editingUser) {
            result = await userService.updateUser(editingUser.id, formData);
        } else {
            result = await userService.createUser(formData);
        }

        if (result.success) {
            message.success(editingUser ? "User updated" : "User created successfully");
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchAllUsers();
        } else {
            message.error(result.error || "Operation failed");
        }
    } catch (err) {
        message.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleDelete = async (userId) => {
    Modal.confirm({
      title: 'Delete User?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          message.success("User deleted");
          fetchAllUsers();
        } else {
          message.error("Failed to delete");
        }
      }
    });
  };

  const handleResetPassword = async (userId) => {
    Modal.confirm({
      title: 'Reset Password?',
      content: 'User will be forced to set a new password on next login.',
      okText: 'Yes, Reset',
      okType: 'primary',
      onOk: async () => {
        const result = await userService.resetUserPassword(userId);
        if (result.success) message.success("Password reset successfully");
        else message.error("Failed to reset");
      }
    });
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
        form.setFieldsValue(user);
        // Note: We don't prepopulate image in edit mode usually, 
        // user uploads new one if they want to change.
    } else {
        form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Helper for Upload Component
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const columns = [
    {
      title: 'Emp ID', dataIndex: 'employ_id', key: 'employ_id',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (text) => <Space><UserOutlined style={{ color: '#1890ff' }} /><Text strong>{text}</Text></Space>
    },
    { title: 'Office Mail', dataIndex: 'office_mail', key: 'office_mail', responsive: ['md'] },
    { title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => {
        let color = role === 'superadmin' ? 'gold' : role === 'admin' ? 'purple' : role === 'hr' ? 'green' : 'cyan';
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      }
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation',
      render: (desig) => desig ? <Tag>{desig.replace('_', ' ').toUpperCase()}</Tag> : '-'
    },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <Space>
            <Tooltip title="Edit">
                <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
            </Tooltip>
            <Tooltip title="Reset Password">
                <Button icon={<KeyOutlined />} size="small" style={{ color: '#faad14', borderColor: '#faad14' }} onClick={() => handleResetPassword(record.id)} />
            </Tooltip>
            <Tooltip title="Delete">
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
            </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
            <Title level={3} style={{ margin: 0 }}>User Management</Title>
            <Text type="secondary">Manage system access (Logged in as: <b>{myRole.toUpperCase()}</b>)</Text>
        </div>
        
        <Space>
            <Select defaultValue="all" style={{ width: 160 }} onChange={setRoleFilter} suffixIcon={<FilterOutlined />}>
                <Option value="all">Show All</Option>
                {getFilterOptions().map(role => (
                    <Option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</Option>
                ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchAllUsers} loading={loading}>Refresh</Button>
            {getCreatableRoles().length > 0 && (
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                    Add New User
                </Button>
            )}
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table columns={columns} dataSource={getFilteredUsers()} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: <Empty description="No users found" /> }} />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Create New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>
            
            <Row gutter={16}>
                <Col span={12}>
                     <Form.Item name="email" label="Personal Email" rules={[{ required: true, type: 'email' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Personal Email" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                     <Form.Item name="office_mail" label="Office Email" rules={[{ required: true, type: 'email' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Office Email" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true }]}>
                <Input prefix={<MobileOutlined />} placeholder="Mobile Number" />
            </Form.Item>

            {/* --- NEW: PROFILE PICTURE UPLOAD --- */}
            <Form.Item 
                name="profile_picture" 
                label="Profile Picture (JPG/PNG)" 
                valuePropName="fileList" 
                getValueFromEvent={normFile}
            >
                <Upload 
                    beforeUpload={beforeUpload} 
                    listType="picture" 
                    maxCount={1}
                    accept="image/png, image/jpeg"
                >
                    <Button icon={<UploadOutlined />}>Click to Upload (Max 2MB)</Button>
                </Upload>
            </Form.Item>

            <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
                <Select placeholder="Select Role">
                    {getCreatableRoles().map(role => (
                        <Option key={role} value={role}>
                            {role === 'recruiter' ? 'Recruiter' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            {selectedRole === 'recruiter' && (
                <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                    <Select placeholder="Select Designation">
                        <Option value="team_leader">Team Leader</Option>
                        <Option value="team_member">Team Member</Option>
                    </Select>
                </Form.Item>
            )}

            {selectedRole === 'recruiter' && selectedDesignation === 'team_member' && (
                <Form.Item name="team_lead_id" label="Assign Team Lead" rules={[{ required: true }]}>
                    <Select placeholder="Select Team Lead" loading={teamLeads.length === 0}>
                        {teamLeads.map(lead => (
                            <Option key={lead.id} value={lead.id}>{lead.name} ({lead.employ_id})</Option>
                        ))}
                    </Select>
                </Form.Item>
            )}

            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 10 }}>
                {editingUser ? "Update User" : "Create User"}
            </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;