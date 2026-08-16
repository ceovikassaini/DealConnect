import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { get_jobs } from '../../utils/thunkApis';
import {
  PageHeader, SearchBar, FilterSelect, TableCard, TableHead,
  ActionBtn, Pagination, EmptyRow, LoadingRow, StatusBadge, formatDate, formatCurrency
} from '../../components/common/PageTable';

const BookingsListPage = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ list: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { payload } = await dispatch(get_jobs({
        page,
        limit: 10,
        search: appliedFilters.search,
        status: appliedFilters.status,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate
      }));
      if (payload) setData(payload);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [dispatch, page, appliedFilters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColors = {
    pending: { bg: '#fef9c3', color: '#ca8a04' },
    accepted: { bg: '#dbeafe', color: '#1d4ed8' },
    completed: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  };

  const paymentColors = {
    paid: { bg: '#dcfce7', color: '#16a34a' },
    pending: { bg: '#fef9c3', color: '#ca8a04' },
    failed: { bg: '#fee2e2', color: '#dc2626' },
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      search,
      status,
      startDate,
      endDate,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const handleStatusCardClick = (s) => {
    const newStatus = s === 'all' ? '' : (status === s ? '' : s);
    setStatus(newStatus);
    setAppliedFilters(prev => ({ ...prev, status: newStatus }));
    setPage(1);
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader title="Jobs" subtitle={`${data.total} total jobs`} />

      {/* Status summary */}
      <div className="row mb-3">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(s => (
          <div key={s} className="col-6 col-md-3 mb-2">
            <button
              onClick={() => handleStatusCardClick(s)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid',
                borderColor: (s === 'all' ? (status === '' ? '#111827' : '#e5e7eb') : (status === s ? statusColors[s].color : '#e5e7eb')),
                borderRadius: '12px',
                background: (s === 'all' ? (status === '' ? '#f3f4f6' : '#fff') : (status === s ? statusColors[s].bg : '#fff')),
                color: (s === 'all' ? '#111827' : (status === s ? statusColors[s].color : '#374151')),
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {s}
            </button>
          </div>
        ))}
      </div>

      <TableCard>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search booking #..." />
          <FilterSelect
            value={status}
            onChange={e => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            placeholder="All Status"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Start:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                padding: '7px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                background: '#f9fafb',
                color: '#374151'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>End:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                padding: '7px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                background: '#f9fafb',
                color: '#374151'
              }}
            />
          </div>
          <button
            onClick={handleApplyFilter}
            style={{
              padding: '7px 16px',
              border: 'none',
              borderRadius: '10px',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.15s'
            }}
            title="Apply Filter"
          >
            <i className="material-icons" style={{ fontSize: '16px' }}>filter_alt</i>
            Filter
          </button>
          {(search || status || startDate || endDate || appliedFilters.search || appliedFilters.status || appliedFilters.startDate || appliedFilters.endDate) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '7px 14px',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                background: '#fef2f2',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s'
              }}
              title="Clear Filters"
            >
              <i className="material-icons" style={{ fontSize: '16px' }}>restart_alt</i>
              Clear
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead columns={['Sr. No.', 'Job ID', 'Date', 'Pick Location', 'Drop Location', 'User', 'Driver', 'Payment', 'Status', 'Actions']} />
            <tbody>
              {loading && <LoadingRow cols={10} />}
              {!loading && !data.list?.length && <EmptyRow cols={10} message="No jobs found" />}
              {!loading && data.list?.map((b, i) => {
                const paymentLabel = b.payment_status === 1 ? 'Completed' : 'Pending';
                const paymentMap = { completed: { bg: '#dcfce7', color: '#16a34a' }, pending: { bg: '#fef9c3', color: '#ca8a04' } };
                const jobStatusLabel = b.status === 2 ? 'completed' : b.status === 1 ? 'accepted' : b.status === 3 ? 'cancelled' : 'pending';
                const statusMap = { pending: { bg: '#fef9c3', color: '#ca8a04' }, accepted: { bg: '#dbeafe', color: '#1d4ed8' }, completed: { bg: '#dcfce7', color: '#16a34a' }, cancelled: { bg: '#fee2e2', color: '#dc2626' } };
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '13px' }}>{(page - 1) * 10 + i + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827', fontSize: '13px' }}>#{b.id}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDate(b.createdAt)}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>{b.pick_location}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>{b.drop_location}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>{b.rider?.name || b.user?.name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '13px' }}>{b.jobDriver?.name || b.driver?.name}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={paymentLabel.toLowerCase()} map={paymentMap} /></td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={jobStatusLabel} map={statusMap} /></td>
                    <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/jobs/${b.id}`}>
                        <ActionBtn icon="visibility" color="#3b82f6" title="View Details" />
                      </Link>
                      <Link to={`/jobs/${b.id}/log`}>
                        <ActionBtn icon="history" color="#10b981" title="Booking Log" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
      </TableCard>
    </div>
  );
};

export default BookingsListPage;
