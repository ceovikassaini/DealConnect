import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  PageHeader,
  TableCard,
  ImageModal,
  formatCurrency,
} from '../../components/common/PageTable';

import { toast, ToastContainer } from 'react-toastify';
import { imageBaseUrl } from '../../services/api';
import { get_user_details } from '../../utils/thunkApis';
import apiInstance from '../../utils/apiInstance';

const sectionTitleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: '700',
  color: '#111827',
};

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

const DriversView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state.users.userDetails);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [activeDocTab, setActiveDocTab] = useState('nsw');
  const [activeSection, setActiveSection] = useState('overview');
  const sectionTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sos', label: 'Emergency SOS' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'vehicle', label: 'Vehicles' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'tax', label: 'Tax & Declaration' },
    { id: 'license', label: 'License' },
    { id: 'identity', label: 'Identity' },
    { id: 'nsw', label: 'NSW / Background' }
  ];
  const [updatingApproval, setUpdatingApproval] = useState(false);
  const [updatingInsuranceApproval, setUpdatingInsuranceApproval] = useState(false);
  const [updatingTaxPolicyApproval, setUpdatingTaxPolicyApproval] = useState(false);
  const [updatingDeclarationApproval, setUpdatingDeclarationApproval] = useState(false);
  const [updatingIdentityVerification, setUpdatingIdentityVerification] = useState(false);
  const [updatingLicenseApproval, setUpdatingLicenseApproval] = useState(false);
  const [updatingNSWApproval, setUpdatingNSWApproval] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      await dispatch(get_user_details({ id, role: 'driver' }));
    } catch {
      setError('An error occurred while fetching driver details');
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
      toast.success('Driver status updated successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleApprovalChange = async (vehicleId, newApproval) => {
    try {
      setUpdatingApproval(vehicleId);
      await apiInstance.put(`/approveVehicle/${id}/${vehicleId}`, { is_reg: newApproval });
      toast.success('Vehicle approval status updated successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update vehicle approval status');
    } finally {
      setUpdatingApproval(false);
    }
  };

  const handleInsuranceApprovalChange = async (newApproval) => {
    try {
      setUpdatingInsuranceApproval(true);
      await apiInstance.put(`/approveInsurance/${id}`, { is_insurance: newApproval });
      toast.success('Vehicle insurance approval status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Insurance approval error:', error);
      toast.error('Failed to update vehicle insurance approval status');
    } finally {
      setUpdatingInsuranceApproval(false);
    }
  };

  const handleLicenseApprovalChange = async (newApproval) => {
    try {
      setUpdatingLicenseApproval(true);
      await apiInstance.put(`/approveLicense/${id}`, { is_license: newApproval });
      toast.success('License approval status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('License approval error:', error);
      toast.error('Failed to update license approval status');
    } finally {
      setUpdatingLicenseApproval(false);
    }
  };

  const handleNSWApprovalChange = async (recordId, newStatus) => {
    try {
      setUpdatingNSWApproval(true);
      await apiInstance.put(`/approveNSW/${recordId}`, { approval_status: newStatus });
      toast.success('NSW document approval status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('NSW approval error:', error);
      toast.error('Failed to update NSW approval status');
    } finally {
      setUpdatingNSWApproval(false);
    }
  };

  const handleTaxPolicyApprovalChange = async (newApproval) => {
    try {
      setUpdatingTaxPolicyApproval(true);
      await apiInstance.put(`/approveTaxRTO/${id}`, { is_policy: newApproval });
      toast.success('Tax policy status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Tax policy approval error:', error);
      toast.error('Failed to update tax policy approval status');
    } finally {
      setUpdatingTaxPolicyApproval(false);
    }
  };

  const handleDeclarationApprovalChange = async (newApproval) => {
    try {
      setUpdatingDeclarationApproval(true);
      await apiInstance.put(`/approveTaxRTO/${id}`, { is_declaration: newApproval });
      toast.success('Declaration status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Declaration approval error:', error);
      toast.error('Failed to update declaration approval status');
    } finally {
      setUpdatingDeclarationApproval(false);
    }
  };

  const handleIdentityVerificationChange = async (field, newStatus) => {
    try {
      setUpdatingIdentityVerification(true);
      await apiInstance.put(`/approveIdentityVerification/${id}`, { [field]: newStatus });
      toast.success('Identity verification status updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Identity verification update error:', error);
      toast.error('Failed to update identity verification status');
    } finally {
      setUpdatingIdentityVerification(false);
    }
  };

  const renderDocImages = (front, back, docName) => {
    const frontUrl = front ? `${imageBaseUrl}${front}` : `https://placehold.co/120x80/f3f4f6/9ca3af?text=Front+Missing`;
    const backUrl = back ? `${imageBaseUrl}${back}` : `https://placehold.co/120x80/f3f4f6/9ca3af?text=Back+Missing`;

    return (
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>Front Image</div>
          <img
            src={frontUrl}
            alt={`${docName} Front`}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://placehold.co/120x80/f3f4f6/9ca3af?text=Front+Missing`;
              e.currentTarget.style.cursor = 'default';
            }}
            style={{
              width: '120px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              cursor: front ? 'zoom-in' : 'default',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => { if (front) e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onClick={() => {
              if (front) {
                setPreviewImage(frontUrl);
                setPreviewTitle(`${docName} Front Image`);
              }
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>Back Image</div>
          <img
            src={backUrl}
            alt={`${docName} Back`}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://placehold.co/120x80/f3f4f6/9ca3af?text=Back+Missing`;
              e.currentTarget.style.cursor = 'default';
            }}
            style={{
              width: '120px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              cursor: back ? 'zoom-in' : 'default',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => { if (back) e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onClick={() => {
              if (back) {
                setPreviewImage(backUrl);
                setPreviewTitle(`${docName} Back Image`);
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderDocCard = (title, front, back, docName) => {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
          {title}
        </div>
        <div style={{ padding: '16px' }}>
          {renderDocImages(front, back, docName)}
        </div>
      </div>
    );
  };

  const renderDeclarationItem = (label, checked) => {
    const isChecked = checked === 1;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: isChecked ? '#1e3a8a' : '#4b5563', lineHeight: '1.4' }}>
        <i className="material-icons" style={{ fontSize: '18px', color: isChecked ? '#10b981' : '#dc2626', marginTop: '1px' }}>
          {isChecked ? 'check_circle' : 'cancel'}
        </i>
        <span>{label}</span>
      </div>
    );
  };

  const profileImage =
    userDetails?.profileImage || userDetails?.profile_picture;

  const normalizedVehicles = Array.isArray(userDetails?.vehicles)
    ? userDetails.vehicles
    : userDetails?.vehicle
      ? [userDetails.vehicle]
      : [];

  const reviewItems = Array.isArray(userDetails?.ratings) ? userDetails.ratings : [];
  const averageRating = reviewItems.length
    ? (reviewItems.reduce((sum, review) => sum + Number(review?.rating || 0), 0) / reviewItems.length).toFixed(1)
    : '0.0';

  const nswDoc = userDetails?.nsw_documents?.find(d => d.type === 0);
  const bgCheckDoc = userDetails?.nsw_documents?.find(d => d.type === 1);

  const renderStars = (value) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < safeValue ? '#f59e0b' : '#d1d5db', fontSize: '16px', lineHeight: 1 }}>
        ★
      </span>
    ));
  };

  const renderSOSContent = () => {
    const sosList = Array.isArray(userDetails?.sos_details)
      ? userDetails.sos_details
      : userDetails?.sos_details
        ? [userDetails.sos_details]
        : Array.isArray(userDetails?.users_sos)
          ? userDetails.users_sos
          : userDetails?.users_sos
            ? [userDetails.users_sos]
            : [];

    return (
      <TableCard>
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={sectionTitleStyle}>Emergency SOS Details</h3>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            {sosList.length} contact{sosList.length === 1 ? '' : 's'}
          </span>
        </div>
        <div style={{ padding: '20px' }}>
          {sosList.length === 0 ? (
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
          )}
        </div>
      </TableCard>
    );
  };

  const renderSectionContent = () => {
    if (activeSection === 'overview') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TableCard>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={sectionTitleStyle}>Financial Overview</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginBottom: '2px' }}>Wallet Balance</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#14532d' }}>{formatCurrency(userDetails?.walletAmount)}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginBottom: '2px' }}>Total Earnings</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a' }}>{formatCurrency(userDetails?.totalEarning)}</div>
                </div>
                <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginBottom: '2px' }}>Total Bookings</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#4c1d95' }}>{userDetails?.driverJobs?.length || 0}</div>
                </div>
              </div>

              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600', marginBottom: '6px' }}>Driver Reviews</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#9a2c00' }}>{averageRating}</div>
                  <div style={{ display: 'flex', gap: '2px' }}>{renderStars(Number(averageRating))}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{reviewItems.length} review{reviewItems.length === 1 ? '' : 's'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '11px', color: '#d97706', fontWeight: '600', marginBottom: '2px' }}>Pending Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#78350f' }}>{formatCurrency(userDetails?.pendingAmount)}</div>
                </div>
                <div style={{ background: '#fafafa', padding: '12px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: '600', marginBottom: '2px' }}>Withdrawn</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{formatCurrency(userDetails?.withdrawnAmount)}</div>
                </div>
              </div>


            </div>
          </TableCard>

          {renderSOSContent()}
        </div>
      );
    }

    if (activeSection === 'sos') {
      return renderSOSContent();
    }

    if (activeSection === 'bookings') {
      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={sectionTitleStyle}>Driver Bookings</h3>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {userDetails?.driverJobs?.length || 0} booking{userDetails?.driverJobs?.length === 1 ? '' : 's'}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : !userDetails?.driverJobs || userDetails.driverJobs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                No bookings found for this driver.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Booking ID</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Pick Location</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Drop Location</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Rider</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4b5563', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails.driverJobs.map((b) => {
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
                        <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>{b.rider?.name || '—'}</td>
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
                              justify: 'center'
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
      );
    }

    if (activeSection === 'reviews') {
      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={sectionTitleStyle}>Driver Reviews</h3>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{reviewItems.length} total</span>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviewItems.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No reviews available for this driver yet.</div>
            ) : (
              reviewItems.map((review) => (
                <div key={review.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                        {review?.reviewer?.name || 'Unknown user'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{renderStars(review?.rating || 0)}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827', lineHeight: '1.6' }}>
                    {review?.description || 'No review comment provided.'}
                  </div>
                </div>
              ))
            )}
          </div>
        </TableCard>
      );
    }

    if (activeSection === 'vehicle') {
      if (normalizedVehicles.length === 0) {
        return (
          <TableCard>
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No vehicle records available.
            </div>
          </TableCard>
        );
      }

      return normalizedVehicles.map((vehicle, vIdx) => (
        <TableCard key={vehicle?.id ?? `vehicle-${vIdx}`}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={sectionTitleStyle}>
              Vehicle Details
              {normalizedVehicles.length > 1 && (
                <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>#{vIdx + 1}</span>
              )}
            </h3>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: vehicle.is_reg === 1 ? '#dcfce7' : vehicle.is_reg === 2 ? '#fee2e2' : '#fef9c3', color: vehicle.is_reg === 1 ? '#16a34a' : vehicle.is_reg === 2 ? '#dc2626' : '#ca8a04' }}>
              {vehicle.is_reg === 1 ? 'Approved' : vehicle.is_reg === 2 ? 'Disapproved' : 'Pending'}
            </span>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Vehicle Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div><div style={labelFieldStyle}>Make</div><div style={valueFieldStyle}>{vehicle.make || '—'}</div></div>
              <div><div style={labelFieldStyle}>Model</div><div style={valueFieldStyle}>{vehicle.model || '—'}</div></div>
              <div><div style={labelFieldStyle}>Vehicle Type</div><div style={valueFieldStyle}>{vehicle.type || '—'}</div></div>
              <div><div style={labelFieldStyle}>Year</div><div style={valueFieldStyle}>{vehicle.year || '—'}</div></div>
              <div><div style={labelFieldStyle}>Plate Number</div><div style={valueFieldStyle}>{vehicle.number || '—'}</div></div>
              <div><div style={labelFieldStyle}>VIN</div><div style={valueFieldStyle}>{vehicle.vin || '—'}</div></div>
              <div><div style={labelFieldStyle}>Seating Capacity</div><div style={valueFieldStyle}>{vehicle.seats || '—'}</div></div>
              <div><div style={labelFieldStyle}>Transmission</div><div style={{ ...valueFieldStyle, textTransform: 'capitalize' }}>{vehicle.transmission || '—'}</div></div>
              <div><div style={labelFieldStyle}>Registration Number</div><div style={valueFieldStyle}>{vehicle.registration_no || '—'}</div></div>
              <div><div style={labelFieldStyle}>Registration Expiry</div><div style={valueFieldStyle}>{vehicle.registration_expiry || vehicle.reg_expriy || '—'}</div></div>
            </div>

            {/* Status Select Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <div style={labelFieldStyle}>Approval Status</div>
                <div style={{ marginTop: '4px' }}>
                  <select value={vehicle.is_reg ?? 0} onChange={e => handleApprovalChange(vehicle.id, Number(e.target.value))} disabled={updatingApproval === vehicle.id} style={selectFieldStyle(Number(vehicle.is_reg))}>
                    <option value={0}>Pending</option>
                    <option value={1}>Approved</option>
                    <option value={2}>Disapproved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Photos Gallery */}
            <div>
              <div style={{ ...labelFieldStyle, fontWeight: '600', marginBottom: '8px', color: '#4b5563' }}>Vehicle Photos ({vehicle.images?.length || 0})</div>
              {vehicle.images && vehicle.images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                  {vehicle.images.map((img, imgIdx) => (
                    <img
                      key={img.id || imgIdx}
                      src={`${imageBaseUrl}${img.images}`}
                      alt={`Vehicle photo ${imgIdx + 1}`}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/120x80/f3f4f6/9ca3af?text=Photo+Missing`;
                      }}
                      style={{ width: '100%', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => setPreviewImage(`${imageBaseUrl}${img.images}`)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '10px 0' }}>No vehicle photos uploaded.</div>
              )}
            </div>

            {/* Vehicle Registration Certificate Preview */}
            <div>
              {renderDocCard(
                'Vehicle Registration Certificate',
                vehicle.reg_certificate_front,
                vehicle.reg_certificate_back,
                'Vehicle Registration Certificate'
              )}
            </div>
          </div>
        </TableCard>
      ));
    }


    if (activeSection === 'insurance') {
      if (!userDetails?.vehicle_insurance) {
        return (
          <TableCard>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}><h3 style={sectionTitleStyle}>Vehicle Insurance</h3></div>
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              No vehicle insurance data uploaded.
            </div>
          </TableCard>
        );
      }

      const ins = userDetails.vehicle_insurance;
      const isTPPD = ins.type === 0;

      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={sectionTitleStyle}>Vehicle Insurance</h3>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              backgroundColor: isTPPD ? '#e0f2fe' : '#f3e8ff',
              color: isTPPD ? '#0369a1' : '#6b21a8',
              border: `1px solid ${isTPPD ? '#bae6fd' : '#e9d5ff'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {isTPPD ? 'Third Party (TPPD)' : 'Comprehensive'}
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Status & Approvals Action Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <div style={labelFieldStyle}>Approval Status</div>
                <div style={{ marginTop: '6px' }}>
                  {renderApprovalSelect(ins.is_insurance ?? 0, handleInsuranceApprovalChange)}
                </div>
              </div>
            </div>

            {/* Insurance Specs Grid */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Insurance Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={labelFieldStyle}>Insurer Name</div>
                  <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{ins.name || '—'}</div>
                </div>
                <div>
                  <div style={labelFieldStyle}>Policy Number</div>
                  <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{ins.policy_number || '—'}</div>
                </div>
                <div>
                  <div style={labelFieldStyle}>Expiry Date</div>
                  <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{ins.expiry_date || '—'}</div>
                </div>
              </div>
            </div>

            {/* Checklist / Declarations Section */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="material-icons" style={{ fontSize: '18px', color: '#64748b' }}>playlist_add_check</i>
                Insurance Declarations & Endorsements
              </div>
              {isTPPD ? (
                <>
                  {renderDeclarationItem("My policy provides at least $5 million third party property damage cover.", ins.is_damage)}
                  {renderDeclarationItem("My policy explicitly covers commercial passenger use / rideshare driving.", ins.is_commercial)}
                </>
              ) : (
                <>
                  {renderDeclarationItem("My comprehensive policy explicitly covers commercial passenger use / rideshare driving (rideshare endorsement).", ins.is_commercial)}
                </>
              )}
            </div>

            {/* Document Gallery Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Uploaded Documents
              </h4>
              <div>
                {renderDocCard('Certificate of Currency', ins.front_insurance, ins.back_insurance, 'Insurance Certificate')}
              </div>
            </div>
          </div>
        </TableCard>
      );
    }

    if (activeSection === 'tax') {
      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}><h3 style={sectionTitleStyle}>Tax & Business (ATO Requirements)</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userDetails?.tax_rto ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><div style={labelFieldStyle}>ABN</div><div style={valueFieldStyle}>{userDetails.tax_rto.business_no || '—'}</div></div>
                  <div><div style={labelFieldStyle}>GST Registration</div><div style={valueFieldStyle}>{userDetails.tax_rto.gst_registration || '—'}</div></div>
                </div>
                <div><div style={labelFieldStyle}>Declaration Text</div><div style={{ ...valueFieldStyle, background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', lineHeight: '1.6' }}>{userDetails.tax_rto.declaration || 'Declaration not provided.'}</div></div>
                <div><div style={labelFieldStyle}>Policy Approval</div>{renderApprovalSelect(userDetails.tax_rto?.is_policy ?? 0, handleTaxPolicyApprovalChange)}</div>
                <div><div style={labelFieldStyle}>Declaration Approval</div>{renderApprovalSelect(userDetails.tax_rto?.is_declaration ?? 0, handleDeclarationApprovalChange)}</div>
              </>
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No Tax or Business data uploaded.</div>
            )}
          </div>
        </TableCard>
      );
    }

    if (activeSection === 'license') {
      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}><h3 style={sectionTitleStyle}>License Details</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><div style={labelFieldStyle}>License Number</div><div style={valueFieldStyle}>{userDetails?.license?.number || '—'}</div></div>
            <div><div style={labelFieldStyle}>Expiry Date</div><div style={valueFieldStyle}>{userDetails?.license?.expriy_date || '—'}</div></div>
            <div><div style={labelFieldStyle}>Date of Birth</div><div style={valueFieldStyle}>{userDetails?.license?.dateOfBirth || '—'}</div></div>
            <div><div style={labelFieldStyle}>Document Type</div><div style={valueFieldStyle}>{userDetails?.license?.doc_type || '—'}</div></div>
            <div><div style={labelFieldStyle}>Approval Status</div>{renderApprovalSelect(userDetails?.license?.is_license ?? 0, handleLicenseApprovalChange)}</div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div><div style={labelFieldStyle}>Front Image</div><img src={userDetails?.license?.front_image ? `${imageBaseUrl}${userDetails.license.front_image}` : 'https://placehold.co/120x80/f3f4f6/9ca3af?text=Front+Missing'} alt="license front" style={previewImageStyle} onClick={() => userDetails?.license?.front_image && setPreviewImage(`${imageBaseUrl}${userDetails.license.front_image}`)} /></div>
              <div><div style={labelFieldStyle}>Back Image</div><img src={userDetails?.license?.back_image ? `${imageBaseUrl}${userDetails.license.back_image}` : 'https://placehold.co/120x80/f3f4f6/9ca3af?text=Back+Missing'} alt="license back" style={previewImageStyle} onClick={() => userDetails?.license?.back_image && setPreviewImage(`${imageBaseUrl}${userDetails.license.back_image}`)} /></div>
            </div>
          </div>
        </TableCard>
      );
    }

    if (activeSection === 'identity') {
      if (!userDetails?.identity_verification) {
        return (
          <TableCard>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}><h3 style={sectionTitleStyle}>Identity & Work Rights Verification</h3></div>
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              No identity verification data uploaded.
            </div>
          </TableCard>
        );
      }

      const idVer = userDetails.identity_verification;
      const type = idVer.type;

      // Determine work status text and style
      const statusOptions = [
        { label: 'Australian Citizen', bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
        { label: 'New Zealand Citizen', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
        { label: 'Australian Permanent Resident (PR)', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
        { label: 'Temporary Visa Holder', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }
      ];
      const statusConfig = statusOptions[type] || { label: 'Other', bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

      return (
        <TableCard>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={sectionTitleStyle}>Identity & Work Rights Verification</h3>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              backgroundColor: statusConfig.bg,
              color: statusConfig.text,
              border: `1px solid ${statusConfig.border}`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {statusConfig.label}
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Status & Approvals Action Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <div style={labelFieldStyle}>Work Authorization Status</div>
                <div style={{ marginTop: '6px' }}>
                  {renderApprovalSelect(idVer.visa_allow ?? 0, (next) => handleIdentityVerificationChange('visa_allow', next), updatingIdentityVerification)}
                </div>
              </div>
              <div>
                <div style={labelFieldStyle}>Notify on Status Change Status</div>
                <div style={{ marginTop: '6px' }}>
                  {renderApprovalSelect(idVer.is_notify ?? 0, (next) => handleIdentityVerificationChange('is_notify', next), updatingIdentityVerification)}
                </div>
              </div>
            </div>

            {/* Structured Details depending on type */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Identity Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={labelFieldStyle}>Passport Number</div>
                  <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{idVer.passport_number || '—'}</div>
                </div>
                <div>
                  <div style={labelFieldStyle}>Passport Expiry Date</div>
                  <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{idVer.expiry_date || '—'}</div>
                </div>
                {type === 2 && (
                  <div>
                    <div style={labelFieldStyle}>Visa Subclass Number</div>
                    <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{idVer.visa_number || '—'}</div>
                  </div>
                )}
                {type === 3 && (
                  <div>
                    <div style={labelFieldStyle}>Visa Expiry Date</div>
                    <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{idVer.visa_expiry || '—'}</div>
                  </div>
                )}
              </div>

              {type === 3 && (
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="material-icons" style={{ fontSize: '18px', color: '#3b82f6' }}>info</i>
                    Driver Acknowledged Consents
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1e3a8a', lineHeight: '1.4' }}>
                    <i className="material-icons" style={{ fontSize: '16px', color: '#10b981', marginTop: '2px' }}>check_circle</i>
                    <span>My visa allows me to work in Australia as a contractor for commercial passenger transport / rideshare services.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1e3a8a', lineHeight: '1.4' }}>
                    <i className="material-icons" style={{ fontSize: '16px', color: '#10b981', marginTop: '2px' }}>check_circle</i>
                    <span>I will notify MyRyd immediately if my visa status, conditions, or expiry changes.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Document Gallery Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Uploaded Documents
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Passport Card */}
                {renderDocCard(
                  type === 3 ? 'Foreign Passport' : type === 1 ? 'New Zealand Passport' : 'Australian Passport',
                  idVer.front_image,
                  idVer.back_image,
                  type === 3 ? 'Foreign Passport' : type === 1 ? 'New Zealand Passport' : 'Australian Passport'
                )}

                {/* Additional Docs based on type */}
                {type === 0 && (
                  <>
                    {renderDocCard('Australian Birth Certificate', idVer.birthday_front, idVer.birthday_back, 'Birth Certificate')}
                    {renderDocCard('Australian Citizenship Certificate', idVer.citizenship_front, idVer.citizenship_back, 'Citizenship Certificate')}
                  </>
                )}

                {type === 2 && (
                  renderDocCard(
                    'PR Visa Grant Notice (Department of Home Affairs)',
                    idVer.birthday_front || idVer.citizenship_front,
                    idVer.birthday_back || idVer.citizenship_back,
                    'PR Visa Grant Notice'
                  )
                )}

                {type === 3 && (
                  renderDocCard(
                    'Visa Grant Letter (Department of Home Affairs)',
                    idVer.birthday_front || idVer.citizenship_front,
                    idVer.birthday_back || idVer.citizenship_back,
                    'Visa Grant Letter'
                  )
                )}
              </div>
            </div>
          </div>
        </TableCard>
      );
    }

    if (activeSection === 'nsw') {
      return (
        <TableCard>
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
            <button type="button" onClick={() => setActiveDocTab('nsw')} style={activeDocTab === 'nsw' ? docTabActiveStyle : docTabStyle}>NSW Driver Licence</button>
            <button type="button" onClick={() => setActiveDocTab('bg')} style={activeDocTab === 'bg' ? docTabActiveStyle : docTabStyle}>Background Check</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeDocTab === 'nsw' ? renderNswCard() : renderBgCheckCard()}
          </div>
        </TableCard>
      );
    }

    return null;
  };

  const labelFieldStyle = { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' };
  const valueFieldStyle = { fontSize: '14px', fontWeight: '500', color: '#111827' };
  const previewImageStyle = { width: '120px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb', cursor: 'pointer' };
  const selectFieldStyle = (value) => ({ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '13px', background: value === 1 ? '#dcfce7' : value === 2 ? '#fee2e2' : '#fef9c3', color: value === 1 ? '#16a34a' : value === 2 ? '#dc2626' : '#ca8a04', fontWeight: '600', cursor: 'pointer' });
  const docTabStyle = { flex: 1, padding: '14px 20px', fontSize: '14px', fontWeight: '700', color: '#6b7280', border: 'none', background: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease' };
  const docTabActiveStyle = { ...docTabStyle, color: '#3b82f6', background: '#ffffff', borderBottom: '3px solid #3b82f6' };

  const renderApprovalSelect = (value, onChange, disabled = false) => (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled} style={{ ...selectFieldStyle(value), opacity: disabled ? 0.65 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <option value={0}>Pending</option>
      <option value={1}>Approved</option>
      <option value={2}>Rejected</option>
    </select>
  );

  const renderNswCard = () => {
    if (!nswDoc) {
      return <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No NSW Licence documents uploaded.</div>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Basic Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div>
            <div style={labelFieldStyle}>Licence Number</div>
            <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{nswDoc.license_no || '—'}</div>
          </div>
          <div>
            <div style={labelFieldStyle}>Expiration Date</div>
            <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{nswDoc.expiry_date || '—'}</div>
          </div>
          <div>
            <div style={labelFieldStyle}>NSW Document Status</div>
            <div style={{ marginTop: '4px' }}>
              {renderApprovalSelect(nswDoc.approval_status ?? 0, (next) => handleNSWApprovalChange(nswDoc.id, next))}
            </div>
          </div>
        </div>

        {/* Declarations / Checkboxes Section */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="material-icons" style={{ fontSize: '18px', color: '#16a34a' }}>assignment_turned_in</i>
            License Declarations & Consents
          </div>
          {renderDeclarationItem("I have held an unrestricted Australian driver's licence for at least 12 months in the past 4 years.", nswDoc.is_drive)}
          {renderDeclarationItem("My licence shows a PT Code under Conditions (medical fitness for commercial driving)", nswDoc.is_ptcode)}
          {renderDeclarationItem("My licence shows a PTLC under Conditions (issued by Service NSW for passenger transport)", nswDoc.is_ptlc)}
        </div>

        {/* Document Previews Card Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {renderDocCard('NSW Driver Licence', nswDoc.front_image, nswDoc.back_image, 'NSW Driver Licence')}
          {renderDocCard('Driving History Record (Last 6 Months)', nswDoc.history_front, nswDoc.history_back, 'Driving History')}
        </div>
      </div>
    );
  };

  const renderBgCheckCard = () => {
    if (!bgCheckDoc) {
      return <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No Background Check documents uploaded.</div>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Basic Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div>
            <div style={labelFieldStyle}>Date of Issue</div>
            <div style={{ ...valueFieldStyle, fontSize: '15px' }}>{bgCheckDoc.iessue_date || bgCheckDoc.issue_date || '—'}</div>
          </div>
          <div>
            <div style={labelFieldStyle}>Background Check Status</div>
            <div style={{ marginTop: '4px' }}>
              {renderApprovalSelect(bgCheckDoc.approval_status ?? 0, (next) => handleNSWApprovalChange(bgCheckDoc.id, next))}
            </div>
          </div>
        </div>

        {/* Declarations Checklist */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="material-icons" style={{ fontSize: '18px', color: '#4b5563' }}>gavel</i>
            Background Check Declarations
          </div>
          {renderDeclarationItem("I have never been convicted of a commercial passenger transport or rideshare related offence.", bgCheckDoc.is_convicated)}
          {renderDeclarationItem("I comply with the passenger transport service and driver rules.", bgCheckDoc.is_comply)}
        </div>

        {/* Document Previews Card Gallery */}
        <div>
          {renderDocCard('National Police Check Documents', bgCheckDoc.front_image, bgCheckDoc.back_image, 'National Police Check')}
        </div>
      </div>
    );
  };

  // Helper renderAdditionalIdentityDocs removed in favor of inline structured document layout.

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
        title="Driver Details"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
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
                          userDetails?.name || 'D'
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
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.name || 'D')}&background=3b82f6&color=fff`;
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
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {userDetails?.countryCode && userDetails?.phone
                        ? `${userDetails.countryCode} ${userDetails.phone}`
                        : userDetails?.country_code && userDetails?.phone
                          ? `${userDetails.country_code} ${userDetails.phone}`
                          : userDetails?.phone || '—'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Gender</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                      {userDetails?.gender === 1 ? 'Male' : userDetails?.gender === 2 ? 'Female' : userDetails?.gender || '—'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Address</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', wordBreak: 'break-word' }}>
                      {userDetails?.address || '—'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Device Type</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                      {userDetails?.deviceType || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Residential Address in NSW</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                      Australia islands
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Status</div>
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
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Registered On</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {userDetails?.createdAt
                        ? new Date(userDetails.createdAt).toLocaleString()
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TableCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', paddingBottom: '10px' }}>
            {sectionTabs.map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                    background: isActive ? '#eff6ff' : '#ffffff',
                    color: isActive ? '#1d4ed8' : '#475569',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            renderSectionContent()
          )}
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

export default DriversView;
