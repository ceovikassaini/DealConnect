import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

import {
  PageHeader,
  SearchBar,
  TableCard,
  TableHead,
  ActionBtn,
  Pagination,
  EmptyRow,
  LoadingRow,
  formatDate,
  Modal
} from '../../components/common/PageTable';

import apiInstance from '../../utils/apiInstance';

/* ── Status badge matching screenshot ─────────────────────────────── */
const StatusChip = ({ status }) => {
  const map = {
    active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
    inactive: { bg: '#fee2e2', color: '#dc2626', label: 'Inactive' },
    expired: { bg: '#fef3c7', color: '#d97706', label: 'Expired' }
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
      fontWeight: '600', background: s.bg, color: s.color, display: 'inline-block'
    }}>
      {s.label}
    </span>
  );
};

/* ── Filter dropdown like screenshot ──────────────────────────────── */
const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' }
  ];
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px',
          background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          color: '#374151', display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        <i className="material-icons" style={{ fontSize: '16px' }}>filter_list</i>
        {selected.label}
        <i className="material-icons" style={{ fontSize: '16px' }}>arrow_drop_down</i>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          background: '#2d3748', borderRadius: '8px', overflow: 'hidden',
          minWidth: '130px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginTop: '4px'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '9px 16px', cursor: 'pointer', fontSize: '13px', color: '#fff',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: opt.value === value ? '#4a5568' : 'transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4a5568'}
              onMouseLeave={e => e.currentTarget.style.background = opt.value === value ? '#4a5568' : 'transparent'}
            >
              {opt.value === value && <i className="material-icons" style={{ fontSize: '14px' }}>check</i>}
              {opt.value !== value && <span style={{ width: '14px' }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Promo image / letter fallback ────────────────────────────────── */
const PromoAvatar = ({ image, name }) => {
  const BACKEND = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace('/api', '');
  const letter = (name || 'P')[0].toUpperCase();
  const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
  const bg = colors[letter.charCodeAt(0) % colors.length];

  if (image) {
    const src = image.startsWith('http') ? image : `${BACKEND}${image}`;
    return (
      <img src={src} alt={name} onError={e => { e.target.style.display = 'none'; }}
        style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
    );
  }
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '8px', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: '700', fontSize: '14px'
    }}>{letter}</div>
  );
};

/* ── Target Audience Filter dropdown ──────────────────────────────── */
const TargetFilterDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [
    { value: '', label: 'All Target' },
    { value: '1', label: 'Users' },
    { value: '2', label: 'Drivers' }
  ];
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px',
          background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          color: '#374151', display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        <i className="material-icons" style={{ fontSize: '16px' }}>group</i>
        {selected.label}
        <i className="material-icons" style={{ fontSize: '16px' }}>arrow_drop_down</i>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          background: '#2d3748', borderRadius: '8px', overflow: 'hidden',
          minWidth: '130px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginTop: '4px'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '9px 16px', cursor: 'pointer', fontSize: '13px', color: '#fff',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: opt.value === value ? '#4a5568' : 'transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4a5568'}
              onMouseLeave={e => e.currentTarget.style.background = opt.value === value ? '#4a5568' : 'transparent'}
            >
              {opt.value === value && <i className="material-icons" style={{ fontSize: '14px' }}>check</i>}
              {opt.value !== value && <span style={{ width: '14px' }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
const PromoCodes = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState(''); // '' = All, 'user', 'driver'

  const [data, setData] = useState({ list: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);
  const [viewPromo, setViewPromo] = useState(null);
  const [locationMap, setLocationMap] = useState({});

  const limit = 10;

  useEffect(() => {
    apiInstance.get('/promo-codes/locations-list')
      .then(res => {
        const list = res.data?.body?.list || [];
        const map = {};
        list.forEach(l => {
          map[l.id] = l.city ? `${l.name} – ${l.city}` : l.name;
        });
        setLocationMap(map);
      })
      .catch(() => { });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get(
        `/promo-codes?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&targetType=${targetTypeFilter}`
      );
      const body = res.data?.body;
      setData({
        list: body?.list || [],
        total: body?.total || 0,
        totalPages: body?.totalPages || 1
      });
    } catch {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, targetTypeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [page, search, statusFilter, targetTypeFilter]);

  const handleStatusChange = async (id, currentStatus) => {
    setStatusLoading(id);
    try {
      await apiInstance.put(`/promo-codes/${id}/toggle`);
      toast.success(`Promo code ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!",
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    try {
      await apiInstance.delete(`/promo-codes/${id}`);
      toast.success('Promo code deleted');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = ['Title', 'Promo Codes', 'Audience', 'Discount (%)', 'Flat Discount', 'Start Date', 'End Date', 'Status', 'Actions'];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />

      <PageHeader
        title="Promo Codes"
        subtitle={`${data.total} total codes`}
        action={
          <button
            onClick={() => navigate('/promo-codes/add')}
            style={{
              background: 'linear-gradient(90deg,#3b82f6,#60a5fa)', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '9px 18px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
            }}
          >
            <i className="material-icons" style={{ fontSize: '18px' }}>add</i>
            Add Promo Code
          </button>
        }
      />

      <TableCard>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '12px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TargetFilterDropdown value={targetTypeFilter} onChange={v => { setTargetTypeFilter(v); setPage(1); }} />
            <StatusDropdown value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} />
          </div>
          <SearchBar
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search..."
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead columns={columns} />
            <tbody>
              {loading && <LoadingRow cols={9} />}
              {!loading && !data.list?.length && (
                <EmptyRow cols={9} message="No promo codes found" />
              )}
              {!loading && data.list?.map((promo) => {
                const flatDiscount = promo.discountType === 'fixed' ? promo.discountValue : 0;
                const pctDiscount = promo.discountType === 'percentage' ? promo.discountValue : 0;
                const computedStatus = promo.computedStatus || promo.status;

                return (
                  <tr key={promo.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {/* Title / Name */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827', maxWidth: '160px' }}>
                        {promo.name || '—'}
                      </div>
                    </td>

                    {/* Code */}
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                      {promo.code}
                    </td>

                    {/* Audience (Customers / Drivers) */}
                    <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                      {(() => {
                        const isDriver = promo.targetType === 2 || promo.targetType === '2' || promo.targetType === 'driver';
                        return promo.userType === 2 ? (
                          <span style={{
                            background: isDriver ? '#fef3c7' : '#dcfce7',
                            color: isDriver ? '#d97706' : '#16a34a',
                            borderRadius: '20px',
                            padding: '3px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block'
                          }}>
                            {isDriver ? 'All Drivers' : 'All Customers'}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {(promo.promoUsers || []).length === 0 ? (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                {isDriver ? 'No drivers' : 'No users'}
                              </span>
                            ) : (
                              (promo.promoUsers || []).slice(0, 2).map(pu => (
                                <span key={pu.id} style={{
                                  background: isDriver ? '#ffedd5' : '#e0e7ff',
                                  color: isDriver ? '#c2410c' : '#3730a3',
                                  borderRadius: '4px',
                                  padding: '1px 6px', fontSize: '11px', fontWeight: '500',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {pu.user ? [pu.user.name, pu.user.last_name].filter(Boolean).join(' ') : (isDriver ? 'Driver' : 'User')}
                                </span>
                              ))
                            )}
                            {(promo.promoUsers || []).length > 2 && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                +{promo.promoUsers.length - 2} more
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Discount % */}
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>
                      {parseFloat(pctDiscount || 0).toFixed(2)}
                    </td>

                    {/* Flat Discount */}
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>
                      ${parseFloat(flatDiscount || 0).toFixed(2)}
                    </td>

                    {/* Start Date */}
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {promo.startDate ? formatDate(promo.startDate) : '—'}
                    </td>

                    {/* End Date */}
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {promo.expiresAt ? formatDate(promo.expiresAt) : '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {statusLoading === promo.id ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : (
                        <div style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(promo.id, promo.status)}>
                          <StatusChip status={computedStatus} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionBtn icon="visibility" color="#0ea5e9" title="View Details" onClick={() => setViewPromo(promo)} />
                        <ActionBtn icon="delete" color="#ef4444" title="Delete" onClick={() => handleDelete(promo.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
      </TableCard>

      <Modal
        isOpen={!!viewPromo}
        onClose={() => setViewPromo(null)}
        title={`Promo Code Details: ${viewPromo?.code || ''}`}
      >
        {viewPromo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', color: '#374151' }}>
            <div>
              <h6 style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#111827', fontSize: '14px' }}>
                {viewPromo.name || 'No Name'}
              </h6>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.4' }}>
                {viewPromo.description || 'No description provided.'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Discount</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                  {viewPromo.discountType === 'percentage' ? `${viewPromo.discountValue}%` : `₹${viewPromo.discountValue}`}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Usage Count</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                  {viewPromo.usedCount} {viewPromo.maxUses ? `/ ${viewPromo.maxUses}` : '(Unlimited)'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Start Date</span>
                <span style={{ color: '#374151' }}>{viewPromo.startDate ? formatDate(viewPromo.startDate) : '—'}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Expiry Date</span>
                <span style={{ color: '#374151' }}>{viewPromo.expiresAt ? formatDate(viewPromo.expiresAt) : '—'}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Max Discount</span>
                <span style={{ color: '#374151' }}>{viewPromo.maxDiscountAmount ? `₹${viewPromo.maxDiscountAmount}` : '—'}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Min Order Value</span>
                <span style={{ color: '#374151' }}>{viewPromo.minOrderValue ? `₹${viewPromo.minOrderValue}` : '—'}</span>
              </div>
            </div>
            <div>
              <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
                Valid Locations
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(!viewPromo.location_ids || viewPromo.location_ids.length === 0) ? (
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
                    All Locations
                  </span>
                ) : (
                  viewPromo.location_ids.map(locId => (
                    <span key={locId} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                      {locationMap[locId] || `Location ID: ${locId}`}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <span style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
                Assigned Customers
              </span>
              {viewPromo.userType === 2 ? (
                <span style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' }}>
                  Valid for All Customers
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', background: '#fff' }}>
                  {(!viewPromo.promoUsers || viewPromo.promoUsers.length === 0) ? (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No customers assigned.</span>
                  ) : (
                    viewPromo.promoUsers.map(pu => {
                      if (!pu.user) return null;
                      const fullName = [pu.user.name, pu.user.last_name].filter(Boolean).join(' ');
                      const contact = pu.user.phone ? `${pu.user.countryCode || ''}${pu.user.phone}` : pu.user.email;
                      return (
                        <div key={pu.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '6px', borderBottom: '1px solid #f3f4f6' }}>
                          <PromoAvatar image={pu.user.profileImage} name={fullName} />
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>{fullName}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{contact}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setViewPromo(null)}
                style={{ padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromoCodes;
