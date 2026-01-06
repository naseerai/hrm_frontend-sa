import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Table, Tabs, Tag, Space, Modal, Form, DatePicker, Input, Select, message, Checkbox, Radio, Typography, Tooltip, Calendar, Badge, Alert, Empty, Spin, List, Divider 
} from 'antd';
import { 
  PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, WalletOutlined, FireOutlined, UserOutlined, EyeOutlined, InfoCircleOutlined, CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { authService } from '../services/auth.service';
import { leaveService } from '../services/leave.service';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const LeaveManagement = () => {
  const user = authService.getCurrentUser();
  const role = user?.role?.toLowerCase();
  
  // Logic: SuperAdmin NO personal views. Others HAVE personal view.
  const isSuperAdmin = role === 'superadmin';
  const isManager = ['admin', 'superadmin', 'hr'].includes(role);
  
  // Default Tab: If SuperAdmin -> Team Leaves, Else -> My Dashboard
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'team_leaves' : 'my_dashboard');
  
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Data States
  const [yearlyStats, setYearlyStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [searchedUserStats, setSearchedUserStats] = useState(null);

  // Apply Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Review & View States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // Leave Review
  const [isPermReviewOpen, setIsPermReviewOpen] = useState(false);   // Permission Review
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const [currentApplication, setCurrentApplication] = useState(null);
  const [viewDetailsData, setViewDetailsData] = useState([]);
  
  // Logic States
  const [reviewDecisions, setReviewDecisions] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [permComment, setPermComment] = useState('');

  // Form Watchers
  const isHalfDay = Form.useWatch('is_half_day', form);
  const leaveSource = Form.useWatch('leave_source', form);

  useEffect(() => {
    // Prevent Personal API calls for SuperAdmin
    if (activeTab === 'my_dashboard' && !isSuperAdmin) {
        fetchMonthlyStats();
        fetchMyHistory();
    } else if (activeTab === 'my_yearly' && !isSuperAdmin) {
        fetchYearlyStats(user.id, 'self');
    } else if (isManager && activeTab === 'team_leaves') {
        fetchTeamLeaves();
    }
  }, [activeTab]);

  // --- API CALLS ---
  const fetchMonthlyStats = async () => {
    try {
        const res = await leaveService.getMonthlyStats(user.id);
        if(res.success) setMonthlyStats(res.data || {});
    } catch (e) { console.error(e); }
  };

  const fetchMyHistory = async () => {
    setLoading(true);
    try {
        const res = await leaveService.getUserLeaveHistory(user.id);
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setMyLeaves(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTeamLeaves = async () => {
    setLoading(true);
    try {
        const res = await leaveService.getAllApplications();
        const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setTeamLeaves(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchYearlyStats = async (userId, type = 'self') => {
    const res = await leaveService.getYearlyStats(userId, dayjs().year());
    if (res.success) {
        const data = res.data?.yearly || res.data || {};
        type === 'self' ? setYearlyStats(data) : setSearchedUserStats(data);
    }
  };

  const handleUserLookup = (value) => {
    if(!value) return;
    fetchYearlyStats(value, 'search');
  };

  // --- APPLY LOGIC (LEAVE + PERMISSION) ---
  const handleApplySubmit = async (values) => {
    setLoading(true);
    try {
        let res;
        
        if (values.leave_source === 'permission') {
            // --- PERMISSION API ---
            const payload = {
                permission_date: values.perm_date.format('YYYY-MM-DD'),
                permission_minutes: Number(values.perm_minutes),
                permission_slot: values.perm_slot,
                permission_used_for: values.description
            };
            res = await leaveService.applyPermission(user.id, payload);
        } else {
            // --- LEAVE API ---
            const startDate = values.dates[0].format('YYYY-MM-DD');
            const endDate = values.dates[1].format('YYYY-MM-DD');
            
            const payload = {
                user_id: user.id,
                start_date: startDate,
                end_date: endDate,
                leave_source: 'regular',
                is_half_day: values.is_half_day || false,
                half_day_date: values.is_half_day && values.half_day_date ? values.half_day_date.format('YYYY-MM-DD') : null,
                half_day_type: values.is_half_day ? values.half_day_type : null,
                description: values.description
            };
            res = await leaveService.applyLeave(payload);
        }
        
        if (res.success) {
            setIsApplyModalOpen(false);
            form.resetFields();
            Modal.success({ title: 'Submitted', content: res.data.message || 'Request Sent' });
            if(!isSuperAdmin) { fetchMyHistory(); fetchMonthlyStats(); }
        } else {
            message.error(res.error || "Failed");
        }
    } catch (e) { message.error("Error"); }
    setLoading(false);
  };

  // --- REVIEW LOGIC ---
  const openReviewModal = (record) => {
      // Check if it is a Permission Request (Usually identified by structure or leave_type)
      // Assuming backend sends 'leave_type': 'permission' or similar field
      // If not, we can check if 'permission_minutes' exists in record
      
      setCurrentApplication(record);

      if (record.leave_type === 'permission' || record.permission_minutes) {
          // Open Permission Review Modal
          setPermComment('');
          setIsPermReviewOpen(true);
      } else {
          // Open Leave Review Modal (Calendar)
          openLeaveReviewModal(record);
      }
  };

  const openLeaveReviewModal = async (record) => {
      setReviewDecisions({});
      setReviewComments({});
      setIsReviewModalOpen(true);
      setModalLoading(true);
      
      const isPending = record.status === 'pending';
      setIsReadOnlyMode(!isPending);

      try {
          if (!isPending) {
              const res = await leaveService.getLeaveApplicationDetails(record.id);
              const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
              const decisions = {};
              data.forEach(item => {
                  let status = item.decision_status?.toLowerCase();
                  if (status === 'approved') status = 'approve';
                  if (status === 'rejected') status = 'reject';
                  decisions[item.date] = status;
              });
              setReviewDecisions(decisions);
          } else {
              const start = dayjs(record.start_date);
              const end = dayjs(record.end_date);
              const diff = end.diff(start, 'day');
              const initial = {};
              for(let i=0; i<=diff; i++) initial[start.add(i, 'day').format('YYYY-MM-DD')] = 'approve';
              setReviewDecisions(initial);
          }
      } catch (e) { message.error("Failed to load details"); }
      setModalLoading(false);
  };

  const handlePermissionReview = async (action) => {
      setLoading(true);
      try {
          // record.id is permission_id
          const res = await leaveService.reviewPermission(user.id, currentApplication.id, action, permComment);
          if (res.success) {
              message.success(`Permission ${action}d`);
              setIsPermReviewOpen(false);
              fetchTeamLeaves();
          } else {
              message.error("Failed");
          }
      } catch(e) { message.error("Error"); }
      setLoading(false);
  };

  const toggleReviewDecision = (date) => {
      if(isReadOnlyMode) return;
      const d = date.format('YYYY-MM-DD');
      if(!reviewDecisions[d]) return;
      setReviewDecisions(p => ({ ...p, [d]: p[d] === 'approve' ? 'reject' : 'approve' }));
  };

  const handleLeaveReviewSubmit = async () => {
      const decisions = Object.keys(reviewDecisions).map(d => ({
          date: d,
          action: reviewDecisions[d],
          comment: reviewComments[d] || (reviewDecisions[d] === 'approve' ? 'Approved' : 'Rejected')
      }));

      setLoading(true);
      try {
          const res = await leaveService.reviewLeave(currentApplication.id, user.id, decisions);
          if(res.success) {
              message.success("Review Submitted");
              setIsReviewModalOpen(false);
              fetchTeamLeaves();
          } else {
              message.error("Failed");
          }
      } catch(e) { message.error("Error"); }
      setLoading(false);
  };

  // --- VIEW DETAILS LOGIC ---
  const handleShowInfo = (record) => {
      setCurrentApplication(record);
      setIsInfoModalOpen(true);
  };
  
  const openProcessedView = async (record) => {
      if (record.leave_type === 'permission' || record.permission_minutes) {
          // For permission, just show info modal or static view (no API for details yet)
          setCurrentApplication(record);
          setIsPermReviewOpen(true); // Re-use modal in read-only way if needed, or separate
      } else {
          setModalLoading(true);
          setIsViewDetailsOpen(true);
          setCurrentApplication(record);
          try {
              const res = await leaveService.getLeaveApplicationDetails(record.id);
              const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
              setViewDetailsData(data);
          } catch (e) { message.error("Failed to load"); }
          setModalLoading(false);
      }
  };

  // --- RENDERERS ---
  const reviewDateCellRender = (date) => {
      const d = date.format('YYYY-MM-DD');
      const s = reviewDecisions[d];
      if(!s) return null;
      return <div style={{height:'100%', background: s==='approve'?'#f6ffed':'#fff1f0', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {s==='approve'?<CheckCircleOutlined style={{color:'green'}}/>:<CloseCircleOutlined style={{color:'red'}}/>}
      </div>;
  };

  const StatCard = ({ title, value, subtext, icon, color }) => (
    <Card bordered={false} style={{ borderRadius: 12, height: '100%', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ padding: 10, background: `${color}15`, borderRadius: '50%', color: color, fontSize: 24 }}>{icon}</div>
            <div>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{title}</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#262626' }}>{value}</div>
                {subtext && <div style={{ fontSize: 12, color: color }}>{subtext}</div>}
            </div>
        </div>
    </Card>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Leave & Permissions</Title>
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" 
                items={[
                    // Hide My Dashboard/Yearly for SuperAdmin
                    ...(!isSuperAdmin ? [{ label: 'My Dashboard', key: 'my_dashboard' }, { label: 'My Yearly History', key: 'my_yearly' }] : []),
                    ...(isManager ? [{ label: 'Team Requests', key: 'team_leaves' }] : [])
                ]} //, { label: 'Employee Lookup', key: 'emp_lookup' }
            />
        </div>

        {/* --- 1. MY DASHBOARD --- */}
        {activeTab === 'my_dashboard' && !isSuperAdmin && (
            <>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={8}><StatCard title="Grace Minutes" value={`${monthlyStats.grace_minutes_remaining || 0}m`} subtext="Allowed: 60m" icon={<ClockCircleOutlined />} color="#faad14" /></Col>
                    <Col xs={24} sm={12} lg={8}><StatCard title="Permissions" value={`${monthlyStats.permission_minutes_remaining || 0}m`} subtext="Allowed: 60m" icon={<CheckCircleOutlined />} color="#1677ff" /></Col>
                    <Col xs={24} sm={12} lg={8}><StatCard title="Paid Leaves Avail." value={monthlyStats.paid_leaves_available || 0} subtext="For this month" icon={<WalletOutlined />} color="#52c41a" /></Col>
                </Row>
                
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setIsApplyModalOpen(true);
                    }}>Apply</Button>
                </div>
                
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    <Table 
                        dataSource={myLeaves} 
                        rowKey="id"
                        locale={{ emptyText: 'No history found' }}
                        columns={[
                            { title: 'Date', render: (_,r) => r.permission_date ? r.permission_date : `${r.start_date} to ${r.end_date}` },
                            { title: 'Type', render: (_,r) => <Tag color={r.leave_type==='permission'?'purple':'blue'}>{r.leave_type?.toUpperCase() || 'LEAVE'}</Tag> },
                            { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='approved'?'green':s==='rejected'?'red':'orange'}>{s?.toUpperCase()}</Tag> },
                            { title: 'Action', render: (_,r) => r.leave_type !== 'permission' && <Button size="small" onClick={() => openProcessedView(r)}>Details</Button> }
                        ]}
                    />
                </Card>
            </>
        )}

        {/* --- 2. YEARLY HISTORY --- */}
        {activeTab === 'my_yearly' && !isSuperAdmin && (
            <Card title={`Yearly Overview (${dayjs().year()})`} bordered={false} style={{ borderRadius: 12 }}>
                 <Row gutter={[16, 16]}>
                    <Col span={6}><Statistic title="Total Allocated" value={yearlyStats.total_allocated_leaves || 0} /></Col>
                    <Col span={6}><Statistic title="Used Leaves" value={yearlyStats.leaves_used || 0} /></Col>
                    <Col span={6}><Statistic title="Loss of Pay (Mins)" value={yearlyStats.total_loss_of_pay_minutes || 0} valueStyle={{color: '#ff4d4f'}} /></Col>
                    <Col span={6}><Statistic title="Available Balance" value={yearlyStats.leaves_available || 0} valueStyle={{color: '#52c41a'}} /></Col>
                 </Row>
            </Card>
        )}

        {/* --- 3. TEAM REQUESTS --- */}
        {activeTab === 'team_leaves' && isManager && (
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Table 
                    loading={loading} dataSource={teamLeaves} rowKey="id"
                    columns={[
                        { title: 'Employee', render: (_, r) => <b>{r.users?.name}</b> },
                        { title: 'Date', render: (_,r) => r.permission_date ? r.permission_date : `${r.start_date} to ${r.end_date}` },
                        { title: 'Type', render: (_,r) => <Tag color={r.permission_minutes ? 'purple' : 'blue'}>{r.permission_minutes ? 'PERMISSION' : 'LEAVE'}</Tag> },
                        { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='approved'?'green':s==='rejected'?'red':'orange'}>{s?.toUpperCase()}</Tag> },
                        { title: 'Action', render: (_, r) => (
                            <Space>
                                <Tooltip title="Info"><Button size="small" shape="circle" icon={<InfoCircleOutlined />} onClick={() => handleShowInfo(r)} /></Tooltip>
                                {r.status === 'pending' ? <Button type="primary" size="small" onClick={() => openReviewModal(r)}>Review</Button> : <Button size="small" onClick={() => openProcessedView(r)}>View</Button>}
                            </Space>
                        )}
                    ]}
                />
            </Card>
        )}

        {/* --- 4. EMPLOYEE LOOKUP --- */}
        {activeTab === 'emp_lookup' && isManager && (
            <Card title="Employee Yearly Stats Lookup" bordered={false} style={{ borderRadius: 12 }}>
                 <Space style={{ marginBottom: 20 }}>
                    <Search placeholder="Enter User ID (UUID)" enterButton="Search" size="large" onSearch={handleUserLookup} style={{ width: 400 }} />
                 </Space>
                 {searchedUserStats ? (
                    <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                        <Col span={6}><Statistic title="Total Allocated" value={searchedUserStats.total_allocated_leaves} /></Col>
                        <Col span={6}><Statistic title="Used" value={searchedUserStats.leaves_used} /></Col>
                        <Col span={6}><Statistic title="Loss of Pay" value={searchedUserStats.total_loss_of_pay_minutes} /></Col>
                        <Col span={6}><Statistic title="Balance" value={searchedUserStats.leaves_available} /></Col>
                    </Row>
                 ) : (
                    <Empty description="Enter ID to search" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                 )}
            </Card>
        )}

        {/* --- APPLY MODAL (Combined Leave & Permission) --- */}
        <Modal title="Apply" open={isApplyModalOpen} onCancel={() => setIsApplyModalOpen(false)} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleApplySubmit} initialValues={{leave_source: 'paid'}}>
                <Form.Item name="leave_source" label="Request Type">
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button value="paid">Leave</Radio.Button>
                        <Radio.Button value="permission">Permission</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* CONDITIONAL RENDERING BASED ON TYPE */}
                {leaveSource === 'permission' ? (
                    <>
                        <Form.Item name="perm_date" label="Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="perm_minutes" label="Minutes (Max 60)" rules={[{ required: true }]}><Input type="number" max={60} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="perm_slot" label="Slot" rules={[{ required: true }]}><Select><Option value="morning">Morning</Option><Option value="afternoon">Afternoon</Option></Select></Form.Item></Col>
                        </Row>
                    </>
                ) : (
                    <>
                        <Form.Item name="dates" label="Date Range" rules={[{ required: true }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="is_half_day" valuePropName="checked"><Checkbox>Half Day?</Checkbox></Form.Item>
                        {isHalfDay && (
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="half_day_date" label="Date" rules={[{required:true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="half_day_type" label="Session" rules={[{required:true}]}><Select><Option value="morning">Morning</Option><Option value="afternoon">Afternoon</Option></Select></Form.Item>
                                </Col>
                            </Row>
                        )}
                    </>
                )}
                
                <Form.Item name="description" label="Reason" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>Submit Request</Button>
            </Form>
        </Modal>

        {/* --- REVIEW MODAL (LEAVE CALENDAR) --- */}
        <Modal title="Review Leave Request" open={isReviewModalOpen} onCancel={() => setIsReviewModalOpen(false)} width={700}
            footer={[<Button key="close" onClick={() => setIsReviewModalOpen(false)}>Close</Button>, !isReadOnlyMode && <Button key="s" type="primary" loading={loading} onClick={handleLeaveReviewSubmit}>Submit Review</Button>]}>
            {currentApplication && (
                <Row gutter={24}>
                    <Col span={14}>
                        <Alert message="Click dates to Approve (Green) / Reject (Red)" type="info" showIcon style={{marginBottom:10}}/>
                        <div style={{border:'1px solid #f0f0f0', borderRadius:8, padding:10}}>
                            <Calendar fullscreen={false} dateFullCellRender={reviewDateCellRender} onSelect={toggleReviewDecision} value={dayjs(currentApplication.start_date)} validRange={[dayjs(currentApplication.start_date), dayjs(currentApplication.end_date)]} />
                        </div>
                    </Col>
                    <Col span={10}>
                        <Title level={5}>Comments</Title>
                        <List size="small" dataSource={Object.keys(reviewDecisions).sort()} renderItem={d => (
                            <List.Item>
                                <div style={{width:'100%'}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <Text strong>{d}</Text> <Tag color={reviewDecisions[d]==='approve'?'green':'red'}>{reviewDecisions[d]}</Tag>
                                    </div>
                                    <Input size="small" placeholder="Comment" onChange={(e) => setReviewComments(p => ({...p, [d]: e.target.value}))} />
                                </div>
                            </List.Item>
                        )} />
                    </Col>
                </Row>
            )}
        </Modal>

        {/* --- REVIEW MODAL (PERMISSION) --- */}
        <Modal title="Review Permission" open={isPermReviewOpen} onCancel={() => setIsPermReviewOpen(false)} footer={null}>
            {currentApplication && (
                <div style={{textAlign:'center'}}>
                    <p><b>Employee:</b> {currentApplication.users?.name}</p>
                    <p><b>Date:</b> {currentApplication.permission_date} ({currentApplication.permission_slot})</p>
                    <p><b>Minutes:</b> {currentApplication.permission_minutes}</p>
                    <p><b>Reason:</b> {currentApplication.permission_used_for}</p>
                    
                    {currentApplication.status === 'pending' ? (
                        <div style={{marginTop:20}}>
                            <TextArea placeholder="Comment..." value={permComment} onChange={e=>setPermComment(e.target.value)} style={{marginBottom:15}}/>
                            <Space>
                                <Button type="primary" onClick={() => handlePermissionReview('approve')} loading={loading}>Approve</Button>
                                <Button danger onClick={() => handlePermissionReview('reject')} loading={loading}>Reject</Button>
                            </Space>
                        </div>
                    ) : (
                        <Alert message={`Status: ${currentApplication.status?.toUpperCase()}`} type={currentApplication.status==='approved'?'success':'error'} showIcon style={{marginTop:15}} />
                    )}
                </div>
            )}
        </Modal>

        {/* --- INFO MODAL --- */}
        <Modal title="Application Info" open={isInfoModalOpen} onCancel={() => setIsInfoModalOpen(false)} footer={null}>
            {currentApplication && (
                <div style={{textAlign:'center'}}>
                    <Row gutter={16}>
                        <Col span={8}><Statistic title="Paid Days" value={currentApplication.paid_days_requested || 0} /></Col>
                        <Col span={8}><Statistic title="LOP Days" value={currentApplication.lop_days_requested || 0} valueStyle={{color:'red'}} /></Col>
                        <Col span={8}><Statistic title="Comp-Off" value={currentApplication.compensatory_days_requested || 0} /></Col>
                    </Row>
                    <Divider />
                    <p><b>Reason:</b> {currentApplication.reason || currentApplication.description || currentApplication.permission_used_for}</p>
                </div>
            )}
        </Modal>

        {/* --- VIEW DETAILS MODAL (TABLE VIEW) --- */}
        <Modal title="Leave Details" open={isViewDetailsOpen} onCancel={() => setIsViewDetailsOpen(false)} width={700} footer={null}>
            <Table 
                dataSource={viewDetailsData}
                rowKey={(r) => r.date || Math.random()} 
                pagination={false}
                columns={[
                    { title: 'Date', dataIndex: 'date' },
                    { title: 'Type', dataIndex: 'day_type', render: t => <Tag>{t?.toUpperCase() || 'FULL'}</Tag> },
                    { title: 'Status', dataIndex: 'decision_status', render: s => <Tag color={s==='approved'?'green':'red'}>{s?.toUpperCase()}</Tag> },
                    { title: 'Comment', dataIndex: 'reviewer_comment', render: t => t || '-' }
                ]}
            />
        </Modal>
    </div>
  );
};

export default LeaveManagement;