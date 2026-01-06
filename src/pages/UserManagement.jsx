import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Row, Col, Empty, Tooltip, Upload 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, MailOutlined, MobileOutlined, ReloadOutlined, 
  KeyOutlined, FilterOutlined, UploadOutlined, IdcardOutlined 
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

  // --- FIXED FETCH FUNCTION ---
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      console.log("Users API Response:", res); // Debug log

      // FIX: Handle nested data structure { data: [...], total_count: ... }
      if (res.success) {
          if (res.data && Array.isArray(res.data.data)) {
              setAllUsers(res.data.data); // Correct path for your response
          } else if (Array.isArray(res.data)) {
              setAllUsers(res.data); // Fallback
          } else {
              setAllUsers([]);
          }
      } else {
          setAllUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setAllUsers([]);
    }
    setLoading(false);
  };

  const fetchTeamLeads = async () => {
      try {
          const res = await userService.getTeamLeads();
          if (res.success) {
              // Same fix for Team Leads if needed
              const leads = res.data?.data || (Array.isArray(res.data) ? res.data : []);
              setTeamLeads(leads);
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
        // Safe check for role
        const targetRole = user.role ? user.role.trim().toLowerCase() : '';
        let isAllowed = false;
        
        if (myRole === 'superadmin') isAllowed = true;
        // Adjusted logic to include 'developer' if that's what backend sends (based on your JSON)
        else if (myRole === 'admin') isAllowed = ['hr', 'recruiter', 'employee', 'developer'].some(r => targetRole.includes(r));
        else if (myRole === 'hr') isAllowed = ['recruiter', 'employee', 'developer'].some(r => targetRole.includes(r));
        
        if (!isAllowed) return false;
        if (roleFilter !== 'all') return targetRole.includes(roleFilter);
        return true;
    });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2; 
    if (!isLt2M) message.error('Image must smaller than 2MB!');
    return isJpgOrPng && isLt2M ? false : Upload.LIST_IGNORE;
  };

  const handleFinish = async (values) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('employ_id', values.employ_id);
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('office_mail', values.office_mail);
    formData.append('role', values.role);
    formData.append('mobile', values.mobile);
    formData.append('created_by', myEmpId || 'dev');

    if (values.role === 'recruiter' && values.designation) {
        formData.append('designation', values.designation);
    }
    if (values.role === 'recruiter' && values.designation === 'team_member' && values.team_lead_id) {
        formData.append('team_lead_id', values.team_lead_id);
    }

    if (values.profile_picture && values.profile_picture.length > 0) {
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
    } else {
        form.resetFields();
    }
    setIsModalOpen(true);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const columns = [
    {
      title: 'Emp ID', dataIndex: 'employ_id', key: 'employ_id', width: 120,
      render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name', width: 200,
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}><UserOutlined style={{ color: '#1677ff' }} /><Text strong>{text}</Text></div>
    },
    { title: 'Office Mail', dataIndex: 'office_mail', key: 'office_mail', width: 250, ellipsis: true, responsive: ['md'] },
    { title: 'Role', dataIndex: 'role', key: 'role', width: 150,
      render: (role) => {
        // Added trim and lowercase to handle " developer" (space issue in backend)
        const r = role ? role.trim().toLowerCase() : '';
        let color = r === 'superadmin' ? 'gold' : r === 'admin' ? 'purple' : r === 'hr' ? 'green' : 'cyan';
        return <Tag color={color}>{r.toUpperCase()}</Tag>;
      }
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation', width: 180,
      render: (desig) => desig ? <Tag>{desig.replace('_', ' ').toUpperCase()}</Tag> : '-'
    },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', width: 150 },
    {
      title: 'Action', key: 'action', fixed: 'right', width: 120,
      render: (_, record) => (
        <Space>
            <Tooltip title="Edit"><Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} /></Tooltip>
            <Tooltip title="Reset Password"><Button icon={<KeyOutlined />} size="small" style={{ color: '#faad14', borderColor: '#faad14' }} onClick={() => handleResetPassword(record.id)} /></Tooltip>
            <Tooltip title="Delete"><Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} /></Tooltip>
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
        <Table 
            columns={columns} 
            dataSource={getFilteredUsers()} 
            rowKey="id" 
            loading={loading} 
            pagination={{ pageSize: 8 }} 
            scroll={{ x: 1300 }} 
            locale={{ emptyText: <Empty description="No users found" /> }} 
        />
      </Card>

      {/* MODAL code remains same as previous ... (No changes needed in Modal) */}
      <Modal
        title={editingUser ? "Edit User" : "Create New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item></Col>
                <Col span={12}><Form.Item name="employ_id" label="Employee ID" rules={[{ required: true }]}><Input prefix={<IdcardOutlined />} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="email" label="Personal Email" rules={[{ required: true }]}><Input prefix={<MailOutlined />} /></Form.Item></Col>
                <Col span={12}><Form.Item name="office_mail" label="Office Email"><Input prefix={<MailOutlined />} /></Form.Item></Col>
            </Row>
            <Form.Item name="mobile" label="Mobile Number"rules={[{ required: true }]}><Input prefix={<MobileOutlined />} /></Form.Item>
            
            <Form.Item name="profile_picture" label="Profile Picture" rules={[{ required: true }]}valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload beforeUpload={beforeUpload} listType="picture" maxCount={1} accept="image/png, image/jpeg">
                    <Button icon={<UploadOutlined />}>Click to Upload (Max 2MB)</Button>
                </Upload>
            </Form.Item>

            <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
                <Select placeholder="Select Role">
                    {getCreatableRoles().map(role => <Option key={role} value={role}>{role.toUpperCase()}</Option>)}
                </Select>
            </Form.Item>

            {selectedRole === 'recruiter' && (
                <Form.Item name="designation" label="Designation"><Select><Option value="team_lead">Team Leader</Option><Option value="team_member">Team Member</Option></Select></Form.Item>
            )}

            {selectedRole === 'recruiter' && selectedDesignation === 'team_member' && (
                <Form.Item name="team_lead_id" label="Assign Team Lead">
                    <Select placeholder="Select Team Lead" loading={teamLeads.length === 0}>
                        {teamLeads.map(lead => <Option key={lead.id} value={lead.id}>{lead.name} ({lead.employ_id})</Option>)}
                    </Select>
                </Form.Item>
            )}

            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 10 }}>{editingUser ? "Update User" : "Create User"}</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;