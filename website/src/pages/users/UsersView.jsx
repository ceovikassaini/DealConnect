import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  PageHeader,
  TableCard,
  ImageModal,
} from '../../components/common/PageTable';

import { toast, ToastContainer } from 'react-toastify';
import { imageBaseUrl } from '../../services/api';
import { get_user_details } from '../../utils/thunkApis';
import apiInstance from '../../utils/apiInstance';

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

const UsersView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state.users.userDetails);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      await dispatch(get_user_details({ id, role: 'user' }));
    } catch {
      setError('An error occurred while fetching user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await apiInstance.put(`/toggleUserStatus/${id}`, { status: newStatus });
      toast.success('User status updated successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const profileImage =
    userDetails?.profileImage || userDetails?.profile_picture;

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader
        title="User Details"
        subtitle={userDetails?.email || ''}
        action={
          <button type="button" onClick={() => navigate(-1)} style={backBtnStyle}>
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
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px,380px) 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <TableCard>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                  src={
                    profileImage
                      ? `${imageBaseUrl}${profileImage}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userDetails?.name || 'U'
                      )}&background=3b82f6&color=fff`
                  }
                  alt="profile"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '20px',
                    objectFit: 'cover',
                    border: '4px solid rgba(59,130,246,0.12)',
                    cursor: 'zoom-in'
                  }}
                  onClick={() => {
                    const src = profileImage
                      ? `${imageBaseUrl}${profileImage}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.name || 'U')}&background=3b82f6&color=fff`;
                    setPreviewImage(src);
                    setPreviewTitle(userDetails?.name || '');
                  }}
                />

                <h3
                  style={{
                    marginTop: '16px',
                    marginBottom: '4px',
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {userDetails?.name || '—'}
                </h3>

                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  {userDetails?.email}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                    }}
                  >
                    Phone
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                    }}
                  >
                    {userDetails?.country_code && userDetails?.phone
                      ? `${userDetails.country_code} ${userDetails.phone}`
                      : userDetails?.phone || '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                    }}
                  >
                    Status
                  </div>
                  <select
                    value={userDetails?.status || 'active'}
                    onChange={handleStatusChange}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      outline: 'none',
                      fontSize: '12px',
                      background: userDetails?.status === 'blocked' ? '#fee2e2' : userDetails?.status === 'inactive' ? '#f3f4f6' : '#dcfce7',
                      color: userDetails?.status === 'blocked' ? '#dc2626' : userDetails?.status === 'inactive' ? '#6b7280' : '#16a34a',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                    }}
                  >
                    Gender
                  </div>

                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                    }}
                  >
                    {userDetails?.gender === 1
                      ? 'Male'
                      : userDetails?.gender === 2
                        ? 'Female'
                        : '—'}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                    }}
                  >
                    dateOfBirth
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                    }}
                  >
                    {userDetails?.dateOfBirth || '—'}
                  </div>
                </div>


                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                    }}
                  >
                    Registered On
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                    }}
                  >
                    {userDetails?.createdAt
                      ? new Date(userDetails.createdAt).toLocaleString()
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TableCard>

        {/* Right side is user's bookings history and emergency SOS details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emergency SOS Details */}
          <TableCard>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Emergency SOS Details</h3>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                {(Array.isArray(userDetails?.sos_details) ? userDetails.sos_details : (userDetails?.sos_details ? [userDetails.sos_details] : (Array.isArray(userDetails?.users_sos) ? userDetails.users_sos : (userDetails?.users_sos ? [userDetails.users_sos] : [])))).length} contact{(Array.isArray(userDetails?.sos_details) ? userDetails.sos_details : (userDetails?.sos_details ? [userDetails.sos_details] : (Array.isArray(userDetails?.users_sos) ? userDetails.users_sos : (userDetails?.users_sos ? [userDetails.users_sos] : [])))).length === 1 ? '' : 's'}
              </span>
            </div>
            <div style={{ padding: '20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (() => {
                const sosList = Array.isArray(userDetails?.sos_details) ? userDetails.sos_details : (userDetails?.sos_details ? [userDetails.sos_details] : (Array.isArray(userDetails?.users_sos) ? userDetails.users_sos : (userDetails?.users_sos ? [userDetails.users_sos] : [])));
                return sosList.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', padding: '10px 0' }}>
                    No Emergency SOS Details found
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {sosList.map((sos, idx) => (
                      <div key={sos.id || idx} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#fafafa' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '10px', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
                          {sos.name || '—'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                          <div>
                            <span style={{ color: '#9ca3af', fontWeight: '500' }}>Phone: </span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>
                              {sos.country_code ? `${sos.country_code} ${sos.phone_number}` : sos.phone_number || '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#9ca3af', fontWeight: '500' }}>Email: </span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{sos.email || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#9ca3af', fontWeight: '500' }}>Relation: </span>
                            <span style={{ fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{sos.relation || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TableCard>

          <TableCard>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Bookings History</h3>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                {userDetails?.userJobs?.length || 0} booking{userDetails?.userJobs?.length === 1 ? '' : 's'}
              </span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : !userDetails?.userJobs || userDetails.userJobs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  No bookings found for this user.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Booking ID</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Pick Location</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Drop Location</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Driver</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetails.userJobs.map((b) => {
                      const jobStatusLabel = b.status === 2 ? 'completed' : b.status === 1 ? 'accepted' : b.status === 3 ? 'cancelled' : 'pending';
                      const statusMap = {
                        pending: { bg: '#fef9c3', color: '#ca8a04' },
                        accepted: { bg: '#dbeafe', color: '#1d4ed8' },
                        completed: { bg: '#dcfce7', color: '#16a34a' },
                        cancelled: { bg: '#fee2e2', color: '#dc2626' }
                      };
                      const statusColors = statusMap[jobStatusLabel] || { bg: '#f3f4f6', color: '#374151' };
                      
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827', fontSize: '13px' }}>#{b.id}</td>
                          <td 
                            style={{ 
                              padding: '12px 16px', 
                              color: '#374151', 
                              fontSize: '13px', 
                              maxWidth: '180px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }} 
                            title={b.pick_location}
                          >
                            {b.pick_location}
                          </td>
                          <td 
                            style={{ 
                              padding: '12px 16px', 
                              color: '#374151', 
                              fontSize: '13px', 
                              maxWidth: '180px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }} 
                            title={b.drop_location}
                          >
                            {b.drop_location}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>
                            {b.jobDriver?.name || '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'capitalize',
                              backgroundColor: statusColors.bg,
                              color: statusColors.color
                            }}>
                              {jobStatusLabel}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => navigate(`/jobs/${b.id}`)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="View Booking Details"
                            >
                              <i className="material-icons" style={{ fontSize: '20px' }}>visibility</i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </TableCard>
        </div>
      </div>

      <ImageModal
        src={previewImage}
        alt={previewTitle}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default UsersView;
