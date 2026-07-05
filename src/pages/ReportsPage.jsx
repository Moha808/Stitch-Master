import React, { useState, useMemo } from 'react';
import { HiPrinter, HiCreditCard, HiShoppingBag, HiUsers } from 'react-icons/hi2';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePayments } from '../contexts/PaymentContext';
import { useOrders } from '../contexts/OrderContext';
import { useCustomers } from '../contexts/CustomerContext';
import useTheme from '../hooks/useTheme';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatCurrency, formatDate } from '../utils/formatters';

const ReportsPage = () => {
  const { payments, getAmountPaidForOrder } = usePayments();
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { theme } = useTheme();

  const [activeReportTab, setActiveReportTab] = useState('revenue'); // revenue, orders, customers
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2026-06-15');

  // Filtered dataset based on dates
  const filteredData = useMemo(() => {
    const fromObj = new Date(fromDate);
    const toObj = new Date(toDate);

    const filteredOrders = orders.filter((o) => {
      const date = new Date(o.createdAt);
      return date >= fromObj && date <= toObj;
    });

    const filteredPayments = payments.filter((p) => {
      const date = new Date(p.paymentDate);
      return date >= fromObj && date <= toObj;
    });

    const filteredCustomers = customers.filter((c) => {
      const date = new Date(c.createdAt);
      return date >= fromObj && date <= toObj;
    });

    return {
      orders: filteredOrders,
      payments: filteredPayments,
      customers: filteredCustomers,
    };
  }, [orders, payments, customers, fromDate, toDate]);

  // Aggregate stats
  const aggregates = useMemo(() => {
    const totalCollected = filteredData.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalOrdersCount = filteredData.orders.length;
    const completedOrdersCount = filteredData.orders.filter((o) => o.status === 'Delivered').length;
    const pendingOrdersCount = filteredData.orders.filter((o) => o.status === 'Pending').length;

    // Outstanding total cost minus paid
    let totalBillings = filteredData.orders.reduce((sum, o) => sum + o.totalCost, 0);
    let outstanding = 0;
    filteredData.orders.forEach((o) => {
      const paid = getAmountPaidForOrder(o.orderId);
      outstanding += Math.max(0, o.totalCost - paid);
    });

    const avgOrderValue = totalOrdersCount > 0 ? totalBillings / totalOrdersCount : 0;
    const completionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

    return {
      totalCollected,
      totalOrdersCount,
      completedOrdersCount,
      pendingOrdersCount,
      totalBillings,
      outstanding,
      avgOrderValue,
      completionRate,
    };
  }, [filteredData, getAmountPaidForOrder]);

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((m) => ({ name: m, revenue: 0 }));

    filteredData.payments.forEach((p) => {
      const date = new Date(p.paymentDate);
      const m = date.getMonth();
      data[m].revenue += p.amountPaid;
    });

    return data.slice(0, 6); // show first 6 months for clear view
  }, [filteredData]);

  // Order status pie chart data
  const orderStatusPieData = useMemo(() => {
    const pending = filteredData.orders.filter((o) => o.status === 'Pending').length;
    const progress = filteredData.orders.filter((o) => o.status === 'In Progress').length;
    const ready = filteredData.orders.filter((o) => o.status === 'Ready').length;
    const delivered = filteredData.orders.filter((o) => o.status === 'Delivered').length;

    return [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'In Progress', value: progress, color: '#0ea5e9' },
      { name: 'Ready', value: ready, color: '#10b981' },
      { name: 'Delivered', value: delivered, color: '#8b5cf6' },
    ].filter((d) => d.value > 0);
  }, [filteredData]);

  // Customer Growth line chart
  const customerGrowthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((m) => ({ name: m, count: 0 }));

    filteredData.customers.forEach((c) => {
      const date = new Date(c.createdAt);
      const m = date.getMonth();
      if (m < 6) {
        data[m].count += 1;
      }
    });

    // Accumulate growth
    let runningTotal = 0;
    return data.map((item) => {
      runningTotal += item.count;
      return { ...item, total: runningTotal };
    });
  }, [filteredData]);

  const handlePrint = () => {
    window.print();
  };

  // Dynamic Chart Theme variables
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const tooltipBg = isDark ? '#1e293b' : '#fff';
  const tooltipText = isDark ? '#f8fafc' : '#1f2937';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">
            Business Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
            Analyze financial performance and shop metrics
          </p>
        </div>
        <Button onClick={handlePrint} variant="primary" className="no-print">
          <HiPrinter className="w-5 h-5" />
          Print / PDF
        </Button>
      </div>

      {/* Date Filters */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-gray-100/80 dark:border-slate-800/80 shadow-sm no-print transition-colors duration-200">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Date From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input-field py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Date To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input-field py-1.5 text-sm"
          />
        </div>
        <div className="flex items-end text-xs text-gray-400 dark:text-slate-500 font-medium pb-2 transition-colors">
          Range filtered over: {filteredData.orders.length} orders and {filteredData.payments.length} transactions.
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-px no-print transition-colors">
        {[
          { id: 'revenue', label: 'Financial Performance', icon: HiCreditCard },
          { id: 'orders', label: 'Order Metrics', icon: HiShoppingBag },
          { id: 'customers', label: 'Customer Stats', icon: HiUsers },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex items-center gap-2 px-4 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide block">Revenue Realized</span>
          <span className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
            {formatCurrency(aggregates.totalCollected)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide block">Pending Balance</span>
          <span className="text-2xl font-bold font-heading text-rose-500 dark:text-rose-400 block mt-1">
            {formatCurrency(aggregates.outstanding)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide block">Avg Ticket Size</span>
          <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400 block mt-1">
            {formatCurrency(aggregates.avgOrderValue)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide block">Order Completion</span>
          <span className="text-2xl font-bold font-heading text-indigo-600 dark:text-indigo-400 block mt-1">
            {aggregates.completionRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Render Charts based on Tab */}
      <div>
        {activeReportTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 transition-colors duration-200" title="Financial Collections Area">
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorReportRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: tooltipBg,
                        color: tooltipText,
                        border: 'none',
                        borderRadius: '12px',
                      }}
                      formatter={(v) => [formatCurrency(v), 'Collected']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReportRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 transition-colors duration-200" title="Top Performing Fabrics">
              <div className="space-y-4 mt-4 text-xs font-medium text-gray-600 dark:text-slate-400 transition-colors">
                {[
                  { name: 'Cotton', count: 12, value: '₦450,000' },
                  { name: 'Ankara', count: 9, value: '₦280,000' },
                  { name: 'Lace', count: 6, value: '₦390,000' },
                  { name: 'Guinea Brocade', count: 5, value: '₦210,000' },
                  { name: 'Linen', count: 4, value: '₦120,000' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100/50 dark:border-slate-800 transition-all">
                    <span className="font-bold text-gray-800 dark:text-slate-200">{item.name} ({item.count} items)</span>
                    <span className="text-primary-600 dark:text-primary-400 font-extrabold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeReportTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 transition-colors duration-200" title="Production Status Splits">
              <div className="h-80 relative flex items-center justify-center mt-4">
                {orderStatusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderStatusPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value">
                        {orderStatusPieData.map((e, index) => (
                          <Cell key={`cell-${index}`} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: tooltipBg,
                          color: tooltipText,
                          border: 'none',
                          borderRadius: '12px',
                        }}
                        formatter={(val) => [val, 'Orders']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 dark:text-slate-500">No data found in range</p>
                )}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-heading text-gray-800 dark:text-white transition-colors">{aggregates.totalOrdersCount}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider transition-colors">Total</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold mt-4 text-gray-600 dark:text-slate-300">
                {orderStatusPieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="transition-colors">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 transition-colors duration-200" title="Order Performance Stats">
              <div className="space-y-4 mt-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800 flex flex-col gap-1 transition-all">
                  <span className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wide">Work Complete Rate</span>
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{aggregates.completionRate.toFixed(1)}%</span>
                  <span className="text-gray-400 dark:text-slate-500 mt-1">Delivered orders relative to total bookings.</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800 flex flex-col gap-1 transition-all">
                  <span className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wide">Pending Delivery</span>
                  <span className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">{aggregates.pendingOrdersCount} items</span>
                  <span className="text-gray-400 dark:text-slate-500 mt-1">Items waiting on sizing, cut, or delivery details.</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeReportTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 transition-colors duration-200" title="Total Registered Clients (Growth Curve)">
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: tooltipBg,
                        color: tooltipText,
                        border: 'none',
                        borderRadius: '12px',
                      }}
                      formatter={(val) => [val, 'Registered Clients']}
                    />
                    <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 transition-colors duration-200" title="Recent Client Acquisitions">
              <div className="space-y-3 mt-4 text-xs">
                {filteredData.customers.slice(0, 5).map((c) => (
                  <div key={c.customerId} className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100/50 dark:border-slate-800 transition-all">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-200">{c.fullName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{c.phone}</p>
                    </div>
                    <span className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-medium transition-colors">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                ))}
                {filteredData.customers.length === 0 && (
                  <p className="text-gray-400 dark:text-slate-500 text-center py-6">No registrations in range.</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Print-only View Layout */}
      <div className="hidden print:block text-black p-8 font-sans w-full bg-white">
        <h1 className="text-3xl font-extrabold text-center border-b-2 border-gray-800 pb-4 mb-8">STITCHMASTER AUDIT & BUSINESS REPORT</h1>
        <div className="grid grid-cols-2 gap-4 text-xs mb-8">
          <div>
            <p className="font-bold">Report Type: <span className="font-medium uppercase">{activeReportTab} Audit</span></p>
            <p className="font-bold mt-1">Date Range: <span className="font-medium">{formatDate(fromDate)} to {formatDate(toDate)}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold">Generated On: <span className="font-medium">{formatDate(new Date())}</span></p>
            <p className="font-bold mt-1">Scope: <span className="font-medium">Confidential Internal Records</span></p>
          </div>
        </div>

        {/* Business ledger data metrics */}
        <div className="grid grid-cols-4 gap-4 border border-gray-300 rounded-lg p-5 text-center bg-gray-50/50 mb-8 text-sm">
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold block">Cash Collected</span>
            <span className="text-xl font-bold mt-1 block">{formatCurrency(aggregates.totalCollected)}</span>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold block">Balances Owed</span>
            <span className="text-xl font-bold mt-1 block">{formatCurrency(aggregates.outstanding)}</span>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold block">Total Bookings</span>
            <span className="text-xl font-bold mt-1 block">{aggregates.totalOrdersCount} items</span>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold block">Cut/Delivered</span>
            <span className="text-xl font-bold mt-1 block">{aggregates.completedOrdersCount} items</span>
          </div>
        </div>

        <h2 className="text-lg font-bold border-b pb-2 mb-4">Summary Ledger Audit</h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-700">
              <th className="py-2 px-3">Reference ID</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3 text-right">Transaction / Billings</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-3">Realized Revenues Collected (Ledger sum)</td>
              <td className="py-3 px-3">Active Range</td>
              <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatCurrency(aggregates.totalCollected)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-3">Outstanding Balances Ledger Total</td>
              <td className="py-3 px-3">Active Range</td>
              <td className="py-3 px-3 text-right font-semibold text-rose-500">{formatCurrency(aggregates.outstanding)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-3">Billed Sewing Commissions Total</td>
              <td className="py-3 px-3">Active Range</td>
              <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatCurrency(aggregates.totalBillings)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-24 border-t pt-6 text-center text-[10px] text-gray-400">
          StitchMaster Tailoring Audit System — Confidential Shop Record
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
