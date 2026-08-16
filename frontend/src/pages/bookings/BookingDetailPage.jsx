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

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

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
    // if already a full URL
    if (/^https?:\/\//i.test(img)) return img;
    // otherwise prefix with image base if available
    try {
      const base = imageBaseUrl || '';
      if (!base) return img;
      return `${base.replace(/\/$/, '')}/${String(img).replace(/^\/?/, '')}`;
    } catch (e) {
      return img;
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await apiInstance.put(`/jobs/${id}/status`, { status });
      toast.success(`Job marked as ${status}`);
      fetchBooking();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button type="button" onClick={() => navigate('/jobs')} style={backBtnStyle}>
          <i
            className="material-icons"
            style={{
              fontSize: '18px',
              verticalAlign: 'middle',
              marginRight: '6px',
            }}
          >
            arrow_back
          </i>
          Back
        </button>
        <h5 style={{ margin: 0, fontWeight: '700' }}>Job #{booking.id}</h5>
        <StatusBadge status={booking.status === 2 ? 'completed' : booking.status === 1 ? 'accepted' : booking.status === 3 ? 'cancelled' : 'pending'} />
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>📍 Route Details</h6>
            <InfoRow label="Pickup Location" value={booking.pick_location} />
            <InfoRow label="Pickup Coordinates" value={booking.pick_latitude && booking.pick_longitude ? `${booking.pick_latitude}, ${booking.pick_longitude}` : '—'} />
            <InfoRow label="Drop Location" value={booking.drop_location} />
            <InfoRow label="Drop Coordinates" value={booking.drop_latitude && booking.drop_longitude ? `${booking.drop_latitude}, ${booking.drop_longitude}` : '—'} />
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: '16px' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>💼 Job Status</h6>
            <InfoRow label="Job ID" value={`#${booking.id}`} />
            <InfoRow label="Job Status" value={<StatusBadge status={booking.status === 2 ? 'completed' : booking.status === 1 ? 'accepted' : booking.status === 3 ? 'cancelled' : 'pending'} />} />
            <InfoRow label="Payment Status" value={<StatusBadge status={booking.payment_status === 1 ? 'completed' : 'pending'} />} />
            <InfoRow label="Posted Date" value={formatDate(booking.createdAt)} />
            {booking.updatedAt && <InfoRow label="Last Updated" value={formatDate(booking.updatedAt)} />}
          </div>

          {/* If payment details exist on job, show them */}
          {booking.payment && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: '16px' }}>
              <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>💳 Payment Details</h6>
              <InfoRow label="Transaction ID" value={booking.payment.transactionId} />
              <InfoRow label="Payment Method" value={booking.payment.paymentMethod} />
              <InfoRow label="Total Amount" value={formatCurrency(booking.payment.amount)} />
              <InfoRow label="Admin Commission" value={formatCurrency(booking.payment.adminCommission)} />
              <InfoRow label="Provider Amount" value={formatCurrency(booking.payment.providerAmount)} />
              <InfoRow label="Payment Status" value={<StatusBadge status={booking.payment.paymentStatus} />} />
            </div>
          )}

          {/* Job Offers Section */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: '16px' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>💰 Job Offers ({offers.length})</h6>
            {offersLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="spinner-border spinner-border-sm" style={{ color: '#f97316' }} />
              </div>
            ) : offers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px' }}>
                No offers received yet
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Offer ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Posted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer, idx) => (
                      <tr key={offer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>#{offer.id}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#059669' }}>{formatCurrency(offer.amount)}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{formatDate(offer.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>👤 Customer Info</h6>
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <img
                src={getImageSrc(booking.rider?.profileImage)}
                alt="Customer"
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderAvatar; }}
              />
            </div>
            <InfoRow label="Name" value={booking.rider?.name || booking.user?.name} />
            <InfoRow label="Email" value={booking.rider?.email || booking.user?.email} />
            <InfoRow label="Phone" value={booking.rider?.phone || booking.user?.phone} />
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>🚗 Driver Info</h6>
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <img
                src={getImageSrc(booking.jobDriver?.profileImage)}
                alt="Driver"
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderAvatar; }}
              />
            </div>
            <InfoRow label="Name" value={booking.jobDriver?.name || booking.driver?.name} />
            <InfoRow label="Email" value={booking.jobDriver?.email || booking.driver?.email} />
            <InfoRow label="Phone" value={booking.jobDriver?.phone || booking.driver?.phone} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
