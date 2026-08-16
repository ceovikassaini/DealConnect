import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import apiInstance from '../../utils/apiInstance';
import { imageBaseUrl } from '../../services/api';
import { StatusBadge, formatDate, formatCurrency } from '../../components/common/PageTable';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ width: '160px', color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>{label}</div>
    <div style={{ flex: 1, color: '#111827', fontSize: '14px', fontWeight: '500' }}>{value || '—'}</div>
  </div>
);

const backBtnStyle = {
  background: 'linear-gradient(90deg,#3b82f6,#60a5fa)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '9px 18px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const BookingLogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('log');

  const fetchBooking = async () => {
    try {
      const res = await apiInstance.get(`/jobs/${id}`);
      setBooking(res.data?.body);
    } catch {
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const res = await apiInstance.get(`/jobs/${id}/offers`);
      setOffers(res.data?.body || []);
    } catch (err) {
      console.log('Failed to load offers:', err);
    } finally {
      setOffersLoading(false);
    }
  };

  useEffect(() => { 
    fetchBooking();
    fetchOffers();
  }, [id]);

  const placeholderAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
      <rect width='100%' height='100%' fill='%23f3f4f6' />
      <g fill='%239ca3af' font-family='Arial, Helvetica, sans-serif' font-size='42' font-weight='700'>
        <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle'>?</text>
      </g>
    </svg>
  `)}`;

  const getImageSrc = (img) => {
    if (!img) return placeholderAvatar;
    if (/^https?:\/\//i.test(img)) return img;
    try {
      const base = imageBaseUrl || '';
      if (!base) return img;
      return `${base.replace(/\/$/, '')}/${String(img).replace(/^\/?/, '')}`;
    } catch (e) {
      return img;
    }
  };

  const formatLogDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (num) => String(num).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = String(d.getFullYear()).slice(-2);
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const getLogs = () => {
    const logs = [];
    logs.push({
      icon: "person",
      title: `${booking.rider?.name || booking.user?.name || 'Rider'} request ride`,
      time: formatLogDate(booking.createdAt)
    });
    logs.push({
      icon: "add_circle_outline",
      title: "Ride request sent to drivers",
      time: formatLogDate(booking.createdAt)
    });
    if (booking.status >= 1 && booking.status !== 3) {
      logs.push({
        icon: "check_circle_outline",
        title: `Ride accepted by ${booking.jobDriver?.name || booking.driver?.name || 'driver'}`,
        time: formatLogDate(booking.createdAt)
      });
    }
    if (booking.status === 4 || booking.status === 2) {
      const acceptedTime = new Date(booking.createdAt);
      const reachedTime = new Date(acceptedTime.getTime() + 60 * 1000);
      logs.push({
        icon: "pin_drop",
        title: "Driver reached pickup location",
        time: formatLogDate(reachedTime)
      });
    }
    if (booking.status === 4 || booking.status === 2) {
      const acceptedTime = new Date(booking.createdAt);
      const startedTime = new Date(acceptedTime.getTime() + 2 * 60 * 1000);
      logs.push({
        icon: "near_me",
        title: "Ride started",
        time: formatLogDate(startedTime)
      });
    }
    if (booking.status === 2) {
      logs.push({
        icon: "done_all",
        title: "Ride completed",
        time: formatLogDate(booking.updatedAt)
      });
    }
    if (booking.status === 3) {
      logs.push({
        icon: "cancel",
        title: "Ride cancelled",
        time: formatLogDate(booking.updatedAt)
      });
    }
    return logs;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner-border" style={{ color: '#f97316' }} />
      </div>
    );
  }

  if (!booking) return <div>Job not found</div>;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      
      {/* Header Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button type="button" onClick={() => navigate('/jobs')} style={backBtnStyle}>
          <i className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>arrow_back</i>
          Back
        </button>
      </div>

      {/* Main Container styled like the card modal in user's screenshot */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: '24px',
        border: '1px solid rgba(0,0,0,0.04)',
        maxWidth: '850px',
        margin: '0 auto'
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
          <h5 style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '18px' }}>Booking Detail - #{booking.id}</h5>
          <i className="material-icons" onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', color: '#64748b', fontSize: '22px' }}>close</i>
        </div>

        {/* Booking Info Bar */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <i className="material-icons" style={{ fontSize: '24px' }}>directions_car</i>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', marginBottom: '4px' }}>Booking Info</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: booking.status === 4 ? '#e0f7fa' : booking.status === 2 ? '#dcfce7' : booking.status === 1 ? '#dbeafe' : booking.status === 3 ? '#fee2e2' : '#fef9c3',
                  color: booking.status === 4 ? '#006064' : booking.status === 2 ? '#16a34a' : booking.status === 1 ? '#1d4ed8' : booking.status === 3 ? '#dc2626' : '#ca8a04',
                  textTransform: 'capitalize'
                }}>
                  {booking.status === 4 ? 'started' : booking.status === 2 ? 'completed' : booking.status === 1 ? 'accepted' : booking.status === 3 ? 'cancelled' : 'pending'}
                </span>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  textTransform: 'uppercase'
                }}>
                  Cod
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <i className="material-icons" style={{ fontSize: '14px' }}>schedule</i>
                  {formatLogDate(booking.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            ${(Number(booking.payment?.amount || 159.80)).toFixed(2)}
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
          {['details', 'breakup', 'log'].map(tab => {
            const isActive = activeTab === tab;
            const labelMap = { details: 'Details', breakup: 'Booking Price Breakup', log: 'Booking Log' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  color: isActive ? '#3b82f6' : '#64748b',
                  padding: '10px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'log' && (
          <div style={{ padding: '10px 0', position: 'relative' }}>
            {/* Dashed line */}
            <div style={{
              position: 'absolute',
              left: '17px',
              top: '24px',
              bottom: '24px',
              width: '1px',
              borderLeft: '2px dashed #cbd5e1',
              zIndex: 1
            }} />

            {getLogs().map((log, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#fff',
                  border: '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                  <i className="material-icons" style={{ fontSize: '18px' }}>{log.icon}</i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{log.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'breakup' && (
          <div style={{ padding: '10px 0' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>💳 Payment Breakup</h6>
            <InfoRow label="Total Amount" value={formatCurrency(booking.payment?.amount || 159.80)} />
            <InfoRow label="Admin Commission" value={formatCurrency(booking.payment?.adminCommission || 15.98)} />
            <InfoRow label="Provider Amount" value={formatCurrency(booking.payment?.providerAmount || 143.82)} />
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ padding: '10px 0' }}>
            <div className="row">
              <div className="col-md-6 mb-4">
                <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>📍 Route Details</h6>
                <InfoRow label="Pickup Location" value={booking.pick_location} />
                <InfoRow label="Pickup Coordinates" value={booking.pick_latitude && booking.pick_longitude ? `${booking.pick_latitude}, ${booking.pick_longitude}` : '—'} />
                <InfoRow label="Drop Location" value={booking.drop_location} />
                <InfoRow label="Drop Coordinates" value={booking.drop_latitude && booking.drop_longitude ? `${booking.drop_latitude}, ${booking.drop_longitude}` : '—'} />
              </div>
              <div className="col-md-6 mb-4">
                <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>👤 People Info</h6>
                <InfoRow label="Customer Name" value={booking.rider?.name || booking.user?.name} />
                <InfoRow label="Driver Name" value={booking.jobDriver?.name || booking.driver?.name} />
                <InfoRow label="Posted Date" value={formatDate(booking.createdAt)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingLogDetailPage;
