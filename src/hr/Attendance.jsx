import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Typography, Button, Row, Col, Tabs, Tag, Statistic, Modal, Input,message, Spin, Alert, Divider, Progress, Descriptions, Timeline, DatePicker, Table, Empty, Form, TimePicker, Tooltip, Space 
} from 'antd';
import { 
  ClockCircleOutlined, LoginOutlined, LogoutOutlined, CameraOutlined, CheckCircleOutlined, InfoCircleOutlined, TeamOutlined, UserDeleteOutlined, FieldTimeOutlined, UserOutlined, EditOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { authService } from '../services/auth.service';
import { attendanceService } from '../services/attendance.service';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Attendance = () => {
  const { isDarkMode } = useTheme();
  const user = authService.getCurrentUser();
  const role = user?.role?.toLowerCase();

  const isSuperAdmin = role === 'superadmin';
  const isManager = ['admin', 'superadmin', 'hr'].includes(role);
  const showMyAttendance = !isSuperAdmin;

  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'team_attendance' : 'my_attendance');
  const [currentTime, setCurrentTime] = useState(dayjs());
  
  // Employee States
  const [myDate, setMyDate] = useState(dayjs()); 
  const [attendanceStatus, setAttendanceStatus] = useState('loading'); 
  const [attendanceData, setAttendanceData] = useState(null);

  // Team States
  const [teamDate, setTeamDate] = useState(dayjs());
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [actionType, setActionType] = useState(null); 
  
  // Manual Check-in States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm] = Form.useForm();

  // Update Attendance States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState(null);
  const [updateForm] = Form.useForm();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'my_attendance' && showMyAttendance) {
        fetchMyAttendance(myDate);
    } else if (activeTab === 'team_attendance' && isManager) {
        fetchTeamAnalysis(teamDate);
    }
  }, [activeTab]);

  // --- API CALLS ---
  const fetchMyAttendance = async (date) => {
      const dateStr = date.format('YYYY-MM-DD');
      try {
          const res = await attendanceService.getTodayStatus(user.id, dateStr);
          if (res.success && res.data && res.data.attendance) {
              setAttendanceData(res.data.attendance);
              setAttendanceStatus(res.data.attendance.check_out_time ? 'completed' : 'checked_in');
          } else {
              setAttendanceStatus('not_checked_in');
              setAttendanceData(null);
          }
      } catch (error) { setAttendanceStatus('not_checked_in'); }
  };

  const fetchTeamAnalysis = async (date) => {
      setTeamLoading(true);
      const dateStr = date.format('YYYY-MM-DD');
      try {
          const res = await attendanceService.getTeamAnalysis(dateStr);
          if (res.success) {
              setTeamAnalysis(res.data);
          } else {
              setTeamAnalysis(null);
          }
      } catch (error) { console.error(error); }
      setTeamLoading(false);
  };

  // --- MANUAL CHECK-IN LOGIC ---
  const openManualCheckIn = (employee) => {
      setSelectedEmployee(employee);
      // Default: Current Time
      manualForm.setFieldsValue({ check_in_time: dayjs() });
      setIsManualModalOpen(true);
  };

  const handleManualSubmit = async (values) => {
      setManualLoading(true);
      try {
          const timePart = values.check_in_time;
          // Combine teamDate date with selected time
          const finalDateTime = teamDate
              .hour(timePart.hour())
              .minute(timePart.minute())
              .second(0)
              .format('YYYY-MM-DDTHH:mm:ss');

          const res = await attendanceService.markCheckIn(selectedEmployee.user_id, finalDateTime);
          
          if (res.success) {
              message.success(`Check-in successful`);
              setIsManualModalOpen(false);
              fetchTeamAnalysis(teamDate); 
          } else {
              message.error(res.error || "Failed");
          }
      } catch (error) { message.error("Error"); }
      setManualLoading(false);
  };

  // --- UPDATE ATTENDANCE LOGIC (FIXED TIME PICKER) ---
  const openUpdateModal = (record) => {
      setUpdatingRecord(record);
      
      // Safe Date Parsing
      let attendanceDate = dayjs(record.attendance_date || teamDate);
      if (!attendanceDate.isValid()) attendanceDate = dayjs();

      // Safe Time Parsing (If null/invalid, default to current time for easier picking)
      let checkInVal = record.check_in_time ? dayjs(record.check_in_time) : null;
      if (checkInVal && !checkInVal.isValid()) checkInVal = null;

      let checkOutVal = record.check_out_time ? dayjs(record.check_out_time) : null;
      if (checkOutVal && !checkOutVal.isValid()) checkOutVal = null;

      updateForm.setFieldsValue({ 
          attendance_date: attendanceDate,
          new_check_in_time: checkInVal,
          new_check_out_time: checkOutVal,
          hr_comments: ''
      });
      setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (values) => {
      setManualLoading(true); 
      try {
          const attDate = values.attendance_date;
          
          const payload = {
              user_id: updatingRecord.user_id,
              attendance_date: attDate.format('YYYY-MM-DD'),
              hr_user_id: user.id,
              hr_comments: values.hr_comments
          };

          let hasUpdate = false;
          
          // Send Check-in only if selected
          if (values.new_check_in_time) {
             payload.new_check_in_time = attDate
                .hour(values.new_check_in_time.hour())
                .minute(values.new_check_in_time.minute())
                .second(0)
                .format('YYYY-MM-DDTHH:mm:ss');
             hasUpdate = true;
          }
          
          // Send Check-out only if selected
          if (values.new_check_out_time) {
             payload.new_check_out_time = attDate
                .hour(values.new_check_out_time.hour())
                .minute(values.new_check_out_time.minute())
                .second(0)
                .format('YYYY-MM-DDTHH:mm:ss');
             hasUpdate = true;
          }

          if (!hasUpdate) {
              message.warning("Please update at least one time field.");
              setManualLoading(false);
              return;
          }

          const res = await attendanceService.updateAttendance(payload);

          if (res.success) {
              message.success("Attendance updated successfully");
              setIsUpdateModalOpen(false);
              fetchTeamAnalysis(teamDate);
          } else {
              message.error(res.error || "Update failed");
          }
      } catch (error) {
          message.error("Error updating");
      }
      setManualLoading(false);
  };

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    try {
      const constraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) { message.error("Camera access denied."); }
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
  };

  const handleOpenAction = (type) => {
    setActionType(type);
    setIsCameraOpen(true);
    setTimeout(startCamera, 300);
  };

  const handleCloseAction = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCameraLoading(false);
  };

  const handleCaptureAndSubmit = async () => {
    if (!videoRef.current) return;
    setCameraLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        try {
            const validRes = await attendanceService.validateImage(user.id, file);
            if (validRes.success && validRes.data && validRes.data.matched === true) {
                message.success("Verified!");
                const timestamp = dayjs().format('YYYY-MM-DDTHH:mm:ss');
                let markRes = actionType === 'in' 
                    ? await attendanceService.markCheckIn(user.id, timestamp)
                    : await attendanceService.markCheckOut(user.id, timestamp);

                if (markRes.success) {
                    message.success(`Checked ${actionType === 'in' ? 'In' : 'Out'} Successfully!`);
                    handleCloseAction();
                    fetchMyAttendance(myDate); 
                } else {
                    message.error("Marking failed: " + markRes.error);
                }
            } else {
                message.error(validRes.data?.error || "Face not matched.");
            }
        } catch (error) { message.error("Process Error"); }
        setCameraLoading(false);
    }, 'image/jpeg', 0.8);
  };

  // --- UI RENDERERS ---
  const renderMyAttendance = () => {
    const isToday = myDate.isSame(dayjs(), 'day');
    const totalWorkingMins = attendanceData?.working_hours_in_minutes || 0;
    const workProgress = Math.min(Math.round((totalWorkingMins / 540) * 100), 100);
    const isLate = attendanceData?.late_checkin_minutes > 0;
    const hasLOP = attendanceData?.loss_of_pay_minutes > 0;
    const statusColor = hasLOP ? '#ff4d4f' : (isLate ? '#faad14' : '#52c41a');

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                   <Title level={4} style={{margin: 0}}>Date: {myDate.format('DD MMM YYYY')}</Title>
                   {!isToday && <Tag color="orange">History View</Tag>}
                </div>
                <div style={{display:'flex', gap: 10, alignItems:'center'}}>
                   <Text strong>Select Date:</Text>
                   <DatePicker value={myDate} onChange={(d) => { setMyDate(d); fetchMyAttendance(d); }} allowClear={false} />
                   <Button icon={<ClockCircleOutlined />} onClick={() => { setMyDate(dayjs()); fetchMyAttendance(dayjs()); }}>Today</Button>
                </div>
            </div>

            {isToday ? (
                attendanceStatus === 'loading' ? <div style={{textAlign:'center'}}><Spin size="large"/></div> : (
                <Row gutter={[24, 24]} justify="center">
                    <Col>
                        {attendanceStatus === 'not_checked_in' && (
                            <div style={circleStyle(isDarkMode ? '#1f1f1f' : '#f6ffed', '#52c41a')} onClick={() => handleOpenAction('in')}>
                                <LoginOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 10 }} />
                                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>Check In</Title>
                            </div>
                        )}
                        {attendanceStatus === 'checked_in' && (
                            <div style={circleStyle(isDarkMode ? '#2a1215' : '#fff1f0', '#ff4d4f')} onClick={() => handleOpenAction('out')}>
                                <LogoutOutlined style={{ fontSize: 40, color: '#ff4d4f', marginBottom: 10 }} />
                                <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Check Out</Title>
                                <Text type="secondary">In: {dayjs(attendanceData?.check_in_time).format('hh:mm A')}</Text>
                            </div>
                        )}
                        {attendanceStatus === 'completed' && (
                             <div style={{...circleStyle(isDarkMode ? '#111b26' : '#f0f5ff', '#1677ff'), cursor: 'default'}}>
                                <CheckCircleOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 10 }} />
                                <Title level={4} style={{ margin: 0, color: '#1677ff' }}>Completed</Title>
                                <Text type="secondary">Done for today</Text>
                            </div>
                        )}
                    </Col>
                </Row>
                )
            ) : (
                <div style={{textAlign: 'center', marginBottom: 30, padding: 20, background: isDarkMode ? '#1f1f1f' : '#f5f5f5', borderRadius: 12}}>
                    <Title level={4} style={{margin:0}}>Attendance Record</Title>
                    <Text type="secondary">{myDate.format('dddd, DD MMMM YYYY')}</Text>
                </div>
            )}

            {attendanceData && (
                <div style={{ marginTop: 40 }}>
                     {(hasLOP || isLate) && <Alert message={hasLOP ? "Loss of Pay" : "Late Check-in"} type={hasLOP ? "error" : "warning"} showIcon style={{ marginBottom: 20 }} />}
                     <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ height: '100%', borderRadius: 12, textAlign: 'center' }}>
                                <Text strong style={{ display: 'block', marginBottom: 20 }}>Work Duration</Text>
                                <Progress type="circle" percent={workProgress} format={() => `${attendanceData.total_working_hours}h`} strokeColor={statusColor} />
                            </Card>
                        </Col>
                        <Col xs={24} md={16}>
                             <Card bordered={false} style={{ height: '100%', borderRadius: 12 }}>
                                <Descriptions title="Summary" column={2}>
                                    <Descriptions.Item label="Grace">{attendanceData.grace_period_used_minutes} min</Descriptions.Item>
                                    <Descriptions.Item label="LOP">{attendanceData.loss_of_pay_minutes} min</Descriptions.Item>
                                    <Descriptions.Item label="Check In">{dayjs(attendanceData.check_in_time).format('hh:mm A')}</Descriptions.Item>
                                    <Descriptions.Item label="Check Out">{attendanceData.check_out_time ? dayjs(attendanceData.check_out_time).format('hh:mm A') : '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Status"><Tag color={statusColor}>{attendanceData.attendance_status?.toUpperCase()}</Tag></Descriptions.Item>
                                </Descriptions>
                             </Card>
                        </Col>
                     </Row>
                </div>
            )}
            {!attendanceData && !isToday && <Empty description="No attendance record found for this date" />}
        </div>
    );
  };

  const renderTeamAttendance = () => {
    if (!teamAnalysis) return <Empty description="Select a date to view analysis" />;
    const { summary, details } = teamAnalysis;

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name', render: (t) => <Space><UserOutlined /><b>{t}</b></Space> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s==='present'?'green':s==='absent'?'red':'orange'}>{s?.toUpperCase()}</Tag> },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'absent') {
                    return <Tooltip title="Manual Check In"><Button type="primary" size="small" icon={<LoginOutlined />} onClick={() => openManualCheckIn(record)}>Check In</Button></Tooltip>;
                }
                return <Tooltip title="Correct Attendance"><Button type="default" size="small" icon={<EditOutlined />} onClick={() => openUpdateModal(record)}>Update</Button></Tooltip>;
            }
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Text strong>Analysis Date:</Text>
                <DatePicker value={teamDate} onChange={(d) => { setTeamDate(d); fetchTeamAnalysis(d); }} allowClear={false} />
                <Button onClick={() => fetchTeamAnalysis(teamDate)} type="primary" icon={<ClockCircleOutlined />}>Fetch Data</Button>
            </div>

            {teamLoading ? <div style={{textAlign:'center', padding:50}}><Spin size="large"/></div> : (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 12, background: '#e6f7ff', textAlign:'center' }}><Statistic title="Total" value={summary?.total_users || 0} /></Card></Col>
                        <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed', textAlign:'center' }}><Statistic title="Present" value={summary?.presence?.present_count || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                        <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 12, background: '#fff1f0', textAlign:'center' }}><Statistic title="Absent" value={summary?.presence?.absent_count || 0} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
                        <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6', textAlign:'center' }}><Statistic title="Late" value={summary?.punctuality?.late_checkins || 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
                    </Row>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Tabs defaultActiveKey="absent" type="card" items={[
                            { label: `Absent (${details?.absent_users?.length || 0})`, key: 'absent', children: <Table dataSource={details?.absent_users} columns={columns} pagination={false} rowKey="user_id" /> },
                            { label: `Present (${details?.present_users?.length || 0})`, key: 'present', children: <Table dataSource={details?.present_users} columns={columns} pagination={false} rowKey="user_id" /> },
                            { label: `Late (${details?.late_checkins?.length || 0})`, key: 'late', children: <Table dataSource={details?.late_checkins} columns={columns} pagination={false} rowKey="user_id" /> },
                            { label: <span>Still In Office ({details?.still_in_office?.length || 0})</span>, key: 'inoffice', children: <Table dataSource={details?.still_in_office} columns={columns} pagination={false} rowKey="user_id" /> },
                        ]} />
                    </Card>
                </>
            )}
        </div>
    );
  };

  const circleStyle = (bg, border) => ({
      width: 220, height: 220, borderRadius: '50%', margin: '0 auto', background: bg, border: `4px dashed ${border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s'
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Attendance</Title>
            {isManager && <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" items={[{ label: 'My Attendance', key: 'my_attendance' }, { label: 'Team Attendance', key: 'team_attendance' }]} />}
        </div>

        <Card bordered={false} style={{ borderRadius: 12 }}>
            {activeTab === 'my_attendance' ? (showMyAttendance ? renderMyAttendance() : <div>Admin View Only</div>) : renderTeamAttendance()}
        </Card>

        {/* CAMERA MODAL */}
        <Modal title="Verification" open={isCameraOpen} onCancel={handleCloseAction} footer={null} centered width={500} destroyOnClose>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', height: 320, background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {cameraLoading && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Spin size="large" /></div>}
                </div>
                <Button type="primary" icon={<CameraOutlined />} size="large" onClick={handleCaptureAndSubmit} loading={cameraLoading}>Capture</Button>
            </div>
        </Modal>

        {/* MANUAL CHECK-IN MODAL (With Fixes) */}
        <Modal title={`Manual Check-In for ${selectedEmployee?.name}`} open={isManualModalOpen} onCancel={() => setIsManualModalOpen(false)} footer={null} centered zIndex={1000}>
            <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
                <Form.Item name="check_in_time" label="Check-In Time" rules={[{ required: true }]}>
                    <TimePicker 
                        use12Hours format="h:mm a" style={{ width: '100%' }} 
                        getPopupContainer={() => document.body} popupStyle={{ zIndex: 9999 }} needConfirm={false} 
                    />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={manualLoading}>Confirm</Button>
            </Form>
        </Modal>

        {/* UPDATE ATTENDANCE MODAL (With Fixes) */}
        <Modal title="Correct Attendance" open={isUpdateModalOpen} onCancel={() => setIsUpdateModalOpen(false)} footer={null} centered zIndex={1000}>
            <Form form={updateForm} layout="vertical" onFinish={handleUpdateSubmit}>
                <Form.Item name="attendance_date" label="Date"><DatePicker style={{width:'100%'}} disabled/></Form.Item>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="new_check_in_time" label="Check-In Time">
                            <TimePicker 
                                use12Hours format="h:mm a" style={{ width: '100%' }} 
                                getPopupContainer={() => document.body} popupStyle={{ zIndex: 9999 }} needConfirm={false} 
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="new_check_out_time" label="Check-Out Time">
                            <TimePicker 
                                use12Hours format="h:mm a" style={{ width: '100%' }} 
                                getPopupContainer={() => document.body} popupStyle={{ zIndex: 9999 }} needConfirm={false} 
                            />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item name="hr_comments" label="Reason/Comments" rules={[{ required: true }]}><TextArea rows={2}/></Form.Item>
                <Button type="primary" htmlType="submit" block loading={manualLoading}>Update Record</Button>
            </Form>
        </Modal>
    </div>
  );
};

export default Attendance;