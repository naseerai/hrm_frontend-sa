import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme, Spin } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

// Components
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UserManagement from './UserManagement'; 
import DashboardHome from './DashboardHome';   
// import Careers from './Careers';
import Profile from './Profile'; // Import the New Profile Component
import Careers from './careers/Careers'; // Old file (Create Job) - Rename to CreateJob.jsx better
import JobPosts from './careers/JobPosts'; // New file
import JobApplications from './careers/JobApplications'; // New file (Create basic one)
import Attendance from '../hr/Attendance';
import LeaveManagement from '../hr/LeaveManagement';
import CompanyCalendar from '../hr/CompanyCalendar';


const { Content } = Layout;

const Dashboard = () => {
  const { currentTheme, isDarkMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.success) {
        setCurrentUser(res.data);
      }
    } catch (error) {
      console.error("Profile Error", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // --- VIEW ROUTING LOGIC ---
  const renderContent = () => {
    if (loadingProfile) {
      return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}><Spin size="large" /></div>;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardHome currentUser={currentUser} onViewChange={setCurrentView} />;
      
      case 'users':
        return <UserManagement currentUser={currentUser} />;
      
      case 'careers':
        return <Careers />;
      
      // NEW PROFILE CASE
      case 'profile':
        return <Profile user={currentUser} />;
         // CAREER SUB-MENUS
  case 'create-job':
    return <Careers />; // Reuse your existing Careers.jsx logic here
  case 'job-posts':
    return <JobPosts />;
  case 'applications':
    return <JobApplications />; // Create a basic placeholder for now
       case 'attendance':
    return <Attendance />;
  case 'leave-management':
    return <LeaveManagement />;
  case 'calendar':
    return <CompanyCalendar />;  
        
      default:
        return <DashboardHome currentUser={currentUser} />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: currentTheme.colorPrimary, colorBgContainer: currentTheme.colorBgContainer },
      }}
    >
      <Layout style={{ minHeight: '100vh', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        
        <Sidebar collapsed={collapsed} onMenuSelect={(key) => setCurrentView(key)} />
        
        <Layout style={{ background: currentTheme.colorBgLayout, overflowY: 'auto', height: '100vh' }}>
          
          {/* IMPORTANT: Passing setCurrentView as 'onViewChange' to Navbar */}
          <Navbar 
            collapsed={collapsed} 
            onToggle={() => setCollapsed(!collapsed)} 
            onLogout={handleLogout}
            onViewChange={setCurrentView} 
          />
          
          <Content style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
            {renderContent()}
          </Content>

        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;