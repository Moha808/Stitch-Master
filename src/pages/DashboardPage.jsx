import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiUsers,
  HiShoppingBag,
  HiClock,
  HiArrowPath,
  HiCheckCircle,
  HiTruck,
  HiBanknotes,
  HiExclamationTriangle,
  HiCalendar,
  HiChevronRight,
} from 'react-icons/hi2';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import { useCustomers } from '../contexts/CustomerContext';
import { useOrders } from '../contexts/OrderContext';
import { usePayments } from '../contexts/PaymentContext';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

const DashboardPage = () => {
  const { currentUser, isCustomer } = useAuth();
  const { theme } = useTheme();
  const { customers } = useCustomers();
  const { orders } = useOrders();
  const { payments, getAmountPaidForOrder } = usePayments();

  // Filter orders and payments if customer role
  const dashboardOrders = useMemo(() => {
    if (isCustomer && currentUser) {
      const userEmail = currentUser.email?.toLowerCase();
      const userName = currentUser.name?.toLowerCase() || currentUser.fullName?.toLowerCase();
      
      const matchingCustomerIds = customers
        .filter(c => 
          (c.email && c.email.toLowerCase() === userEmail) || 
          (c.fullName && userName && c.fullName.toLowerCase() === userName)
        )
        .map(c => c.customerId);

      return orders.filter((o) => 
        matchingCustomerIds.includes(o.customerId) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === userEmail)
      );
    }
    return orders;
  }, [orders, customers, currentUser, isCustomer]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCus = isCustomer ? 1 : customers.length;
    const totalOrd = dashboardOrders.length;
    const pendingOrd = dashboardOrders.filter((o) => o.status === 'Pending').length;
    const inProgressOrd = dashboardOrders.filter((o) => o.status === 'In Progress').length;
    const readyOrd = dashboardOrders.filter((o) => o.status === 'Ready').length;
    const deliveredOrd = dashboardOrders.filter((o) => o.status === 'Delivered').length;

    // Financial calculations
    let totalRevenue = 0;
    let outstandingBalance = 0;

    if (isCustomer) {
      // For customer, revenue is amount they paid, outstanding is balance they owe
      dashboardOrders.forEach((order) => {
        const paid = getAmountPaidForOrder(order.orderId);
        totalRevenue += paid;
        outstandingBalance += Math.max(0, order.totalCost - paid);
      });
    } else {
      // For Admin/Staff, totalRevenue is the sum of ALL payments received
      totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);

      // Outstanding balance is sum of balances on all orders
      orders.forEach((order) => {
        const paid = getAmountPaidForOrder(order.orderId);
        outstandingBalance += Math.max(0, order.totalCost - paid);
      });
    }

    return {
      totalCus,
      totalOrd,
      pendingOrd,
      inProgressOrd,
      readyOrd,
      deliveredOrd,
      totalRevenue,
      outstandingBalance,
    };
  }, [customers, dashboardOrders, orders, payments, getAmountPaidForOrder, isCustomer]);

  // Chart Data: Monthly Revenue (Area Chart)
  const revenueChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((m) => ({ name: m, revenue: 0, orders: 0 }));

    // Group payments or orders by month in current year (2025/2026 based on timestamps)
    payments.forEach((payment) => {
      const date = new Date(payment.paymentDate);
      const monthIdx = date.getMonth();
      data[monthIdx].revenue += payment.amountPaid;
    });

    dashboardOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthIdx = date.getMonth();
      data[monthIdx].orders += 1;
    });

    // Slice to show up to June (current date is June 15, 2026)
    return data.slice(0, 6);
  }, [payments, dashboardOrders]);

  // Chart Data: Orders by Status (Pie Chart)
  const statusPieData = useMemo(() => {
    return [
      { name: 'Pending', value: metrics.pendingOrd, color: '#f59e0b' },
      { name: 'In Progress', value: metrics.inProgressOrd, color: '#0ea5e9' },
      { name: 'Ready', value: metrics.readyOrd, color: '#10b981' },
      { name: 'Delivered', value: metrics.deliveredOrd, color: '#8b5cf6' },
    ].filter((d) => d.value > 0);
  }, [metrics]);

  // Recent Orders (last 5)
  const recentOrders = useMemo(() => {
    return [...dashboardOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [dashboardOrders]);

  // Upcoming Deliveries (deliveries in next 7 days, excluding already delivered)
  const upcomingDeliveries = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return dashboardOrders
      .filter((o) => {
        if (o.status === 'Delivered') return false;
        try {
          const delDate = parseISO(o.deliveryDate);
          return isAfter(delDate, today) && isBefore(delDate, nextWeek);
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  }, [dashboardOrders]);

  // Customer mapping for easy display
  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.customerId] = c.fullName;
    });
    return map;
  }, [customers]);

  // Dynamic Chart Theme variables
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const tooltipBg = isDark ? '#1e293b' : '#fff';
  const tooltipText = isDark ? '#f8fafc' : '#1f2937';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-primary rounded-2xl p-6 text-white shadow-md">
        <div>
          <h2 className="text-2xl font-bold font-heading text-accent-300">
            Welcome back, {currentUser?.name}!
          </h2>
          <p className="text-primary-100 text-sm mt-1">
            Here is the current state of {isCustomer ? 'your orders' : 'your tailoring shop'} today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md shrink-0 w-fit">
          <HiCalendar className="w-5 h-5 text-accent-400" />
          <span className="text-sm font-semibold">{format(new Date(), 'EEEE, MMMM dd')}</span>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
        {!isCustomer && (
          <StatCard
            title="Total Customers"
            value={metrics.totalCus}
            icon={<HiUsers />}
            color="primary"
          />
        )}
        <StatCard
          title="Total Orders"
          value={metrics.totalOrd}
          icon={<HiShoppingBag />}
          color="violet"
        />
        <StatCard
          title="Pending Orders"
          value={metrics.pendingOrd}
          icon={<HiClock />}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgressOrd}
          icon={<HiArrowPath />}
          color="sky"
        />
        <StatCard
          title="Ready for Pick"
          value={metrics.readyOrd}
          icon={<HiCheckCircle />}
          color="emerald"
        />
        <StatCard
          title="Delivered"
          value={metrics.deliveredOrd}
          icon={<HiTruck />}
          color="violet"
        />
        <StatCard
          title={isCustomer ? "Total Paid" : "Total Revenue"}
          value={formatCurrency(metrics.totalRevenue)}
          icon={<HiBanknotes />}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(metrics.outstandingBalance)}
          icon={<HiExclamationTriangle />}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 p-6 transition-colors duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white font-heading transition-colors">
              Business Growth
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 transition-colors">
              Monthly breakdown of revenues collected
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    background: tooltipBg,
                    color: tooltipText,
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Donut Chart */}
        <Card className="p-6 transition-colors duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white font-heading transition-colors">
              Status Distribution
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 transition-colors">
              Visual order production splits
            </p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      color: tooltipText,
                      border: 'none',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => [value, 'Orders']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">No active orders</p>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">
                {metrics.totalOrd}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                Total
              </span>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="transition-colors">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Orders & Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white font-heading transition-colors">
                  Recent Orders
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400 transition-colors">
                  Latest commissions created in system
                </p>
              </div>
              <Link
                to="/orders"
                className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline uppercase tracking-wider transition-colors"
              >
                All Orders <HiChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-500 transition-colors">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Style</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-gray-50 dark:border-slate-800/40 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-primary-600 dark:text-primary-400 font-bold">
                        {order.orderId}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 dark:text-slate-350">
                        {customerMap[order.customerId] || 'Guest'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400 max-w-[150px] truncate">
                        {order.styleDescription}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 pl-4 text-sm font-bold text-right text-gray-800 dark:text-slate-200">
                        {formatCurrency(order.totalCost)}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-sm text-gray-400 dark:text-slate-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Upcoming Deliveries list */}
        <div>
          <Card className="p-6 h-full transition-colors duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white font-heading transition-colors">
                Due This Week
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 transition-colors">
                Active jobs needing delivery completion
              </p>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {upcomingDeliveries.map((order) => (
                <div
                  key={order.orderId}
                  className="flex flex-col p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-bold">
                      {order.orderId}
                    </span>
                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full transition-colors">
                      Due {formatDate(order.deliveryDate)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-2">
                    {customerMap[order.customerId] || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {order.styleDescription}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                      {formatCurrency(order.totalCost)}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingDeliveries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-3 text-lg">
                    ✓
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">No orders due in the next 7 days.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
