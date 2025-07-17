import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Play,
  CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Live Events',
      value: '12',
      change: '+2 from yesterday',
      icon: Play,
      color: 'bg-primary-500'
    },
    {
      label: 'Total Tickets Sold',
      value: '8,542',
      change: '+15% from last month',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Users',
      value: '24,891',
      change: '+8% from last week',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'Stream Health',
      value: 'OK',
      change: '2 minor issues',
      icon: Activity,
      color: 'bg-primary-500'
    }
  ];

  const ticketSalesData = [
    { date: '01/01', sales: 1200 },
    { date: '01/02', sales: 1800 },
    { date: '01/03', sales: 2100 },
    { date: '01/04', sales: 1900 },
    { date: '01/05', sales: 2400 },
    { date: '01/06', sales: 2800 },
    { date: '01/07', sales: 3200 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const notifications = [
    { id: 1, type: 'warning', message: 'High traffic detected on Stream Server 3', time: '2 min ago' },
    { id: 2, type: 'success', message: 'New event "Tech Conference 2024" approved', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Monthly revenue report is ready', time: '1 hour ago' },
    { id: 4, type: 'error', message: 'Payment gateway timeout on Transaction #12345', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-100">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{stat.value}</p>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Ticket Sales Trend</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#1AAA65" fill="#1AAA65" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Monthly Revenue</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Bar dataKey="revenue" fill="#1AAA65" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">System Notifications</h3>
        <div className="space-y-3 lg:space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 lg:p-4 bg-gray-50 dark:bg-dark-700 rounded-lg transition-colors duration-200">
              <div className={`p-1 rounded-full flex-shrink-0 ${
                notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
              }`}>
                {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                {notification.type === 'info' && <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-dark-100 break-words">{notification.message}</p>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;