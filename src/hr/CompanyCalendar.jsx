import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, Modal, Form, Input, DatePicker, Select, Tag, Row, Col, message, 
  Popconfirm, Empty, Spin, Space, Calendar, Badge, Tooltip, List, Divider 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, CalendarOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { calendarService } from '../services/calendar.service';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;

const CompanyCalendar = () => {
  const user = authService.getCurrentUser();
  const canEdit = ['admin', 'superadmin', 'hr'].includes(user?.role?.toLowerCase());

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Controls the Calendar View & Year
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [form] = Form.useForm();

  // Fetch holidays when Year changes
  useEffect(() => {
    fetchHolidays(selectedDate.year());
  }, [selectedDate.year()]);

  // 1. API: FETCH HOLIDAYS
  const fetchHolidays = async (year) => {
    setLoading(true);
    try {
      const res = await calendarService.getHolidays(year);
      if (res.success) {
         // Handle both direct array or nested data
         const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
         // Sort by Date
         const sorted = data.sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
         setHolidays(sorted);
      } else {
         setHolidays([]);
      }
    } catch (error) {
      console.error(error);
      setHolidays([]);
    }
    setLoading(false);
  };

  // 2. FILTER: Get Holidays for Selected Month (Right Side List)
  const currentMonthHolidays = holidays.filter(h => 
    dayjs(h.holiday_date).format('MM-YYYY') === selectedDate.format('MM-YYYY')
  );

  // 3. API: CREATE / UPDATE
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (editingHoliday) {
        // --- UPDATE (PATCH) ---
        // Backend expects List: [{ id, ... }]
        const payload = [{
            id: editingHoliday.id,
            description: values.description,
            holiday_type: values.holiday_type,
            name: values.name,
            holiday_date: values.holiday_date.format('YYYY-MM-DD')
        }];
        
        await calendarService.updateHolidays(payload);
        message.success("Holiday Updated");

      } else {
        // --- CREATE (POST) ---
        // Backend expects List: [{ year, ... }]
        const payload = [{
            name: values.name,
            holiday_date: values.holiday_date.format('YYYY-MM-DD'),
            description: values.description,
            holiday_type: values.holiday_type,
            year: values.holiday_date.format('YYYY')
        }];

        await calendarService.addHolidays(payload);
        message.success("Holiday Added");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingHoliday(null);
      fetchHolidays(selectedDate.year()); 
    } catch (error) {
      message.error("Operation failed");
    }
    setLoading(false);
  };

  // 4. API: DELETE
  const handleDelete = async (id) => {
    const result = await calendarService.deleteHolidays([id]);
    if (result.success) {
      message.success("Holiday deleted");
      fetchHolidays(selectedDate.year());
    } else {
      message.error("Failed to delete");
    }
  };

  // --- CALENDAR RENDER LOGIC ---
  const dateCellRender = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const holiday = holidays.find(h => h.holiday_date === dateStr);
    const isCurrentMonth = date.month() === selectedDate.month();
    
    // UI Styling logic
    let bg = 'transparent';
    let dot = null;

    if (isCurrentMonth) {
        if (holiday) {
            bg = '#e6f7ff'; // Light Blue for Holiday
            dot = <Badge status="processing" />; // Blue pulsing dot
        } else if (isWeekend) {
            bg = '#fff1f0'; // Very light red for Weekend
        }
    }

    return (
      <div style={{ height: '100%', padding: '2px', background: bg, borderRadius: 4 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            {dot}
        </div>
      </div>
    );
  };

  const openModal = (holiday = null) => {
    setEditingHoliday(holiday);
    if (holiday) {
      form.setFieldsValue({ ...holiday, holiday_date: dayjs(holiday.holiday_date) });
    } else {
      form.resetFields();
      form.setFieldValue('holiday_date', selectedDate);
    }
    setIsModalOpen(true);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
            <Title level={3} style={{ margin: 0 }}>Company Calendar</Title>
            <Text type="secondary">Holidays for {selectedDate.format('YYYY')}</Text>
        </div>
        
        {/* ACTION BUTTONS */}
        <Space>
             <div style={{ background: '#fff', padding: '5px 10px', borderRadius: 8, border: '1px solid #d9d9d9' }}>
                <Space>
                    <Badge color="#1677ff" text="Holiday" />
                    <Divider type="vertical" />
                    <Badge color="#ff4d4f" text="Weekend" />
                </Space>
             </div>
            {canEdit && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                    Add Holiday
                </Button>
            )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        
        {/* LEFT SIDE: MINI CALENDAR */}
        <Col xs={24} md={10} lg={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Calendar 
                    fullscreen={false} 
                    dateCellRender={dateCellRender}
                    value={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                />
            </Card>
        </Col>

        {/* RIGHT SIDE: HOLIDAYS LIST */}
        <Col xs={24} md={14} lg={16}>
            <Card 
                title={<span style={{ color: '#1677ff' }}><CalendarOutlined /> Holidays in {selectedDate.format('MMMM')}</span>} 
                bordered={false} 
                style={{ borderRadius: 12, height: '100%', minHeight: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                {loading ? <div style={{textAlign:'center', padding: 50}}><Spin /></div> : (
                    currentMonthHolidays.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={currentMonthHolidays}
                            renderItem={item => (
                                <List.Item
                                    actions={canEdit ? [
                                        <Button type="text" icon={<EditOutlined />} onClick={() => openModal(item)} />,
                                        <Popconfirm title="Delete?" onConfirm={() => handleDelete(item.id)}>
                                            <Button type="text" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    ] : []}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ 
                                                width: 60, height: 60, background: '#f0f5ff', borderRadius: 8, 
                                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                                border: '1px solid #adc6ff'
                                            }}>
                                                <Text strong style={{ color: '#1677ff', fontSize: 18, lineHeight: 1 }}>{dayjs(item.holiday_date).format('DD')}</Text>
                                                <Text type="secondary" style={{ fontSize: 10 }}>{dayjs(item.holiday_date).format('ddd')}</Text>
                                            </div>
                                        }
                                        title={<Text strong style={{ fontSize: 16 }}>{item.name}</Text>}
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Tag color={item.holiday_type?.includes('Gazetted') ? 'blue' : 'cyan'}>{item.holiday_type}</Tag>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.description || 'No description'}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description={`No holidays in ${selectedDate.format('MMMM')}`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )
                )}
            </Card>
        </Col>
      </Row>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal
        title={editingHoliday ? "Edit Holiday" : "Add New Holiday"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
            <Form.Item name="name" label="Holiday Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Independence Day" />
            </Form.Item>
            
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="holiday_date" label="Date" rules={[{ required: true, message: 'Required' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="holiday_type" label="Type" rules={[{ required: true, message: 'Required' }]}>
                        <Select>
                            <Option value="Gazetted Holiday">Gazetted Holiday</Option>
                            <Option value="Observance">Observance</Option>
                            <Option value="Restricted Holiday">Restricted Holiday</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Optional details..." />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}>
                {editingHoliday ? "Update Holiday" : "Add Holiday"}
            </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyCalendar;