import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { get_subscriptions } from '../../utils/thunkApis';
import apiInstance from '../../utils/apiInstance';
import {
  PageHeader, SearchBar, TableCard, TableHead,
  Pagination, EmptyRow, LoadingRow, ActionBtn, formatCurrency, formatDate
} from '../../components/common/PageTable';

const SubscriptionsList = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ list: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('SubscriptionsList: fetching page', page);
      const { payload } = await dispatch(get_subscriptions({ page, limit: 10 }));
      console.log('SubscriptionsList: fetch result payload', payload);
      if (payload) setData(payload);
    } catch {
      console.error('SubscriptionsList: fetch failed');
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [dispatch, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setEditForm({ name: sub.name, price: sub.price, description: sub.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', price: '', description: '' });
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.price || !editForm.description) {
      toast.error('All fields are required');
      return;
    }

    setUpdating(true);
    try {
      await apiInstance.put(`/subscriptions/${editingId}`, editForm);
      toast.success('Subscription updated successfully');
      fetchData();
      cancelEdit();
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader title="Subscriptions" subtitle={`${data.total} subscriptions`} />

      <TableCard>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <SearchBar placeholder="Search subscriptions..." disabled style={{ opacity: 0.5 }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <TableHead columns={['Sr. No.', 'Name', 'Price', 'Description', 'Created', 'Actions']} />
            <tbody>
              {loading && <LoadingRow cols={6} />}
              {!loading && !data.list?.length && <EmptyRow cols={6} message="No subscriptions found" />}
              {!loading && data.list?.map((sub, i) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {editingId === sub.id ? (
                    <>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '13px' }}>{(page - 1) * 10 + i + 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="text"
                          value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>—</td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: '6px' }}>
                        <button
                          onClick={saveEdit}
                          disabled={updating}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updating ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {updating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={updating}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '13px' }}>{(page - 1) * 10 + i + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>{sub.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>{formatCurrency(sub.price)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={sub.description}>{sub.description}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>{formatDate(sub.createdAt)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => startEdit(sub)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Edit"
                        >
                          <i className="material-icons" style={{ fontSize: '20px', color: '#3b82f6' }}>edit</i>
                        </button>
                      </td>
                    </>
                  )}
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

export default SubscriptionsList;
