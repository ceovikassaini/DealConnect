import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { get_dashboard_count, get_dashboard_graph } from '../utils/thunkApis';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StatCard = ({ url, icon, title, count, isCurrency, gridClass }) => {
  const displayValue = useMemo(() => {
    if (isCurrency) {
      return `$${(Number(count) || 0).toFixed(2)}`;
    }
    return typeof count === 'number' ? count.toLocaleString() : (count ?? 0);
  }, [count, isCurrency]);

  return (
    <div className={gridClass || "col-xl-3 col-lg-6 col-sm-6 mb-4"}>
      <Link to={url} style={{ textDecoration: 'none' }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{title}</div>
              <div style={{ color: '#111827', fontSize: '28px', fontWeight: '700' }}>{displayValue}</div>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.25)'
            }}>
              <i className="material-icons" style={{ color: '#ffffff', fontSize: '26px' }}>{icon}</i>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const [dash, setDash] = useState({});
  const [loading, setLoading] = useState(false);
  const [userChart, setUserChart] = useState([]);
  const [bookingChart, setBookingChart] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { payload } = await dispatch(get_dashboard_count());
      setDash(payload || {});
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const loginmessage = localStorage.getItem('loginmessage');
  useEffect(() => {
    if (loginmessage) {
      toast.success('Welcome back!');
      localStorage.removeItem('loginmessage');
    }
  }, [loginmessage]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { payload } = await dispatch(get_dashboard_graph());
        const uData = payload?.data || [];
        const bData = payload?.bookings || [];
        const rData = payload?.revenue || [];
        setUserChart(uData.map((item, idx) => ({
          month: MONTH_LABELS[idx],
          Users: item?.user || 0,
          Drivers: item?.driver || 0,
        })));
        setBookingChart(bData.map((item, idx) => ({
          month: MONTH_LABELS[idx],
          Bookings: item?.count ?? 0,
        })));
        setRevenueChart(rData.map((item, idx) => ({
          month: MONTH_LABELS[idx],
          Revenue: Number(item?.total ?? 0),
        })));
      } catch {
        /* silent */
      }
    };
    fetchStats();
  }, [dispatch]);

  const stats = useMemo(() => dash?.data || {}, [dash]);

  const statCards = [
    // Today's Metrics (Row 1)
    { url: "/jobs", icon: "directions_car", title: "Today's Rides", count: stats.todaysRidesCount, gridClass: "col-xl-3 col-lg-6 col-sm-6 mb-4" },
    { url: "/payments", icon: "account_balance_wallet", title: "Today's Earning", count: stats.todaysEarning, isCurrency: true, gridClass: "col-xl-3 col-lg-6 col-sm-6 mb-4" },
    { url: "/driversList", icon: "how_to_reg", title: "On Duty Drivers", count: stats.onDutyDriversCount, gridClass: "col-xl-3 col-lg-6 col-sm-6 mb-4" },
    { url: "/driversList", icon: "person_add", title: "Waiting for Approval", count: stats.waitingForApprovalCount, gridClass: "col-xl-3 col-lg-6 col-sm-6 mb-4" },

    // Total General Metrics (Row 2)
    { url: "/usersList", icon: "people", title: "Total Users", count: stats.usersCount, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },
    { url: "/driversList", icon: "drive_eta", title: "Total Drivers", count: stats.driversCount, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },
    { url: "/jobs", icon: "event_available", title: "Total Rides", count: stats.jobsCount, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },

    // More Lifetime/Monthly Metrics (Row 3)
    { url: "/jobs", icon: "pending_actions", title: "Active Rides", count: stats.activeJobs, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },
    { url: "/payments", icon: "account_balance_wallet", title: "Total Driver Earning", count: stats.totalDriverEarning ?? stats.totalRevenue, isCurrency: true, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },
    { url: "/payments", icon: "trending_up", title: "Monthly Driver Earning", count: stats.monthlyDriverEarning ?? stats.monthlyRevenue, isCurrency: true, gridClass: "col-xl-4 col-lg-4 col-sm-6 mb-4" },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar closeOnClick draggable pauseOnHover />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: '700', color: '#111827', margin: 0 }}>Dashboard</h4>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="row">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="row mt-2">
        <div className="col-lg-8 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>User & Driver Registrations</h6>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={userChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Drivers" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Ride Trend</h6>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={bookingChart}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Bookings" stroke="#f97316" fill="url(#bookingGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-12 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Driver Earnings Analytics</h6>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0075" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ff0075" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Earnings']} />
                <Area type="monotone" dataKey="Revenue" stroke="var(--p-pink)" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(90deg, #f97316, #fb923c)', color: '#fff' }}>
              <h6 style={{ margin: 0, fontWeight: '600' }}>Recent Jobs</h6>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, height: '360px', overflowY: 'auto' }}>
              {(dash?.recentJobs || []).slice(0, 5).map((b) => (
                <li key={b.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ color: '#374151', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Job #{b.id}</span>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500',
                        background: b.status === 2 ? '#dcfce7' : b.status === 1 ? '#dbeafe' : b.status === 3 ? '#fee2e2' : '#fef9c3',
                        color:      b.status === 2 ? '#16a34a' : b.status === 1 ? '#1d4ed8' : b.status === 3 ? '#dc2626' : '#ca8a04',
                      }}>
                        {b.status === 2 ? 'Completed' : b.status === 1 ? 'Accepted' : b.status === 3 ? 'Cancelled' : 'Pending'}
                      </span>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>
                      <i className="material-icons" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 3, color: '#10b981' }}>trip_origin</i>
                      {b.pick_location || '—'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>
                      <i className="material-icons" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 3, color: '#ef4444' }}>location_on</i>
                      {b.drop_location || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#9ca3af' }}>
                      <span><i className="material-icons" style={{ fontSize: 11, verticalAlign: 'middle', marginRight: 2 }}>person</i>{b.rider?.name || 'N/A'}</span>
                      <span><i className="material-icons" style={{ fontSize: 11, verticalAlign: 'middle', marginRight: 2 }}>drive_eta</i>{b.jobDriver?.name || 'N/A'}</span>
                    </div>
                  </div>
                </li>
              ))}
              {!dash?.recentJobs?.length && <li style={{ padding: '20px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>No jobs yet</li>}
            </ul>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', color: '#fff' }}>
              <h6 style={{ margin: 0, fontWeight: '600' }}>Recent Users</h6>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, height: '360px', overflowY: 'auto' }}>
              {(dash?.recentUsers || []).slice(0, 5).map((u) => (
                <li key={u.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <Link to={u.role === 'driver' ? `/driversView/${u.id}` : `/usersView/${u.id}`} style={{ textDecoration: 'none', color: '#374151', fontSize: '13px' }}>
                    <div style={{ fontWeight: '500' }}>{u.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>{u.email}</div>
                  </Link>
                </li>
              ))}
              {!dash?.recentUsers?.length && <li style={{ padding: '20px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>No users yet</li>}
            </ul>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(90deg, #10b981, #34d399)', color: '#fff' }}>
              <h6 style={{ margin: 0, fontWeight: '600' }}>Recent Drivers</h6>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, height: '360px', overflowY: 'auto' }}>
              {(dash?.recentDrivers || []).slice(0, 5).map((p) => (
                <li key={p.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <Link to={`/driversView/${p.id}`} style={{ textDecoration: 'none', color: '#374151', fontSize: '13px' }}>
                    <div style={{ fontWeight: '500' }}>{p.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>{p.email}</div>
                  </Link>
                </li>
              ))}
              {!dash?.recentDrivers?.length && <li style={{ padding: '20px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>No drivers yet</li>}
            </ul>
          </div>
        </div>
      </div>



      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border" style={{ color: '#f97316', width: '40px', height: '40px' }} />
            <div style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
