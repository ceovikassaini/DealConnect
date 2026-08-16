import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { get_payments } from '../../utils/thunkApis';
import apiInstance from '../../utils/apiInstance';
import {
  PageHeader, SearchBar, FilterSelect, TableCard, TableHead,
  Pagination, EmptyRow, LoadingRow, StatusBadge, formatDate, formatCurrency
} from '../../components/common/PageTable';

const PaymentsList = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ list: [], total: 0, totalPages: 1 });
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ payload }, statsRes] = await Promise.all([
        dispatch(get_payments({
          page,
          limit: 10,
          search: appliedFilters.search,
          status: appliedFilters.status,
          type: appliedFilters.type,
          startDate: appliedFilters.startDate,
          endDate: appliedFilters.endDate
        })),
        apiInstance.get('/payments/stats')
      ]);
      if (payload) setData(payload);
      setStats(statsRes.data?.body || {});
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, appliedFilters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApplyFilter = () => {
    setAppliedFilters({
      search,
      status,
      type,
      startDate,
      endDate,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      search: '',
      status: '',
      type: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const statCards = [
    { label: 'Admin Earning (Pass Payments)', value: formatCurrency(stats.adminRevenue), color: '#8b5cf6' },
    { label: 'Driver Earning (Other Payments)', value: formatCurrency(stats.providerPayout), color: '#10b981' },
  ];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader title="Payments" subtitle={`${data.total} transactions`} />

      <div className="row mb-4">
        {statCards.map(s => (
          <div key={s.label} className="col-md-6 mb-3">
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color, marginTop: '4px' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <TableCard>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transaction ID..." />
          <FilterSelect
            value={type}
            onChange={e => setType(e.target.value)}
            options={[
              { value: 'pass', label: 'Pass Payment (Admin Earning)' },
              { value: 'other', label: 'Other Payment (Driver Earning)' }
            ]}
            placeholder="All Payment Types"
          />
          <FilterSelect
            value={status}
            onChange={e => setStatus(e.target.value)}
            options={[
              { value: 'success', label: 'Success' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' }
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
          {(search || status || type || startDate || endDate || appliedFilters.search || appliedFilters.status || appliedFilters.type || appliedFilters.startDate || appliedFilters.endDate) && (
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
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <TableHead columns={['Sr. No.', 'Transaction ID', 'Customer', 'Driver', 'Type', 'Payment Method', 'Amount', 'Status', 'Date']} />
            <tbody>
              {loading && <LoadingRow cols={9} />}
              {!loading && !data.list?.length && <EmptyRow cols={9} message="No payments found" />}
              {!loading && data.list?.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '13px', whiteSpace: 'nowrap', minWidth: '50px', textAlign: 'center' }}>{(page - 1) * 10 + i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '120px' }} title={p.transactionId}>{p.transactionId || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '120px' }} title={p.payer?.name}>{p.payer?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '120px' }} title={p.driver?.name}>{p.driver?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', whiteSpace: 'nowrap', minWidth: '150px' }}>
                    {p.type === 1 ? (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#f3e8ff',
                        color: '#7e22ce',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'inline-block'
                      }}>
                        Pass Payment (Admin)
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'inline-block'
                      }}>
                        Other Payment (Driver)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '100px' }} title={p.paymentMethod}>{p.paymentMethod || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', whiteSpace: 'nowrap', minWidth: '85px', textAlign: 'right' }}>{formatCurrency(p.amount)}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', minWidth: '80px' }}><StatusBadge status={p.paymentStatus} /></td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap', minWidth: '100px' }}>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
      </TableCard>
    </div>
  );
};

export default PaymentsList;
