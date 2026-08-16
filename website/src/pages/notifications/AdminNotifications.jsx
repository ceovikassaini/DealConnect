import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import apiInstance from '../../utils/apiInstance';
import { PageHeader, PrimaryBtn } from '../../components/common/PageTable';

const AdminNotifications = () => {
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });
  const [sending, setSending] = useState(false);

  // Recipient search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSingleTarget = form.target === 'single_user' || form.target === 'single_driver';

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users / drivers when searchQuery or target changes
  useEffect(() => {
    if (!isSingleTarget) return;

    const roleParam = form.target === 'single_driver' ? 'driver' : 'user';
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiInstance.get(`/userList?page=1&limit=10&search=${encodeURIComponent(searchQuery)}&role=${roleParam}`);
        const list = res.data?.body?.user_list || res.data?.body?.list || [];
        setSearchResults(list);
        setDropdownOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, form.target, isSingleTarget]);

  const handleTargetChange = (e) => {
    const newTarget = e.target.value;
    setForm({ ...form, target: newTarget });
    setSelectedRecipients([]);
    setSearchQuery('');
    setSearchResults([]);
    setDropdownOpen(false);
  };

  const handleSelectRecipient = (user) => {
    if (!selectedRecipients.some(r => r.id === user.id)) {
      setSelectedRecipients(prev => [...prev, user]);
    }
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const handleRemoveRecipient = (userId) => {
    setSelectedRecipients(prev => prev.filter(r => r.id !== userId));
  };

  const handleSend = async () => {
    if (isSingleTarget && selectedRecipients.length === 0) {
      return toast.error(`Please search and select at least one ${form.target === 'single_driver' ? 'driver' : 'user'}`);
    }
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error('Title and message are required');
    }
    setSending(true);
    try {
      const payload = {
        ...form,
        recipient_ids: selectedRecipients.map(r => r.id)
      };
      const res = await apiInstance.post('/notifications/bulk', payload);
      toast.success(res.data?.message || 'Notification sent');
      setForm({ title: '', message: '', target: 'all' });
      setSelectedRecipients([]);
      setSearchQuery('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader title="Send Notifications" subtitle="Push and in-app notifications to users and drivers" />

      <div style={{ maxWidth: '560px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Target Audience</label>
            <select
              value={form.target}
              onChange={handleTargetChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb' }}
            >
              <option value="all">All Users & Drivers</option>
              <option value="users">All Users Only</option>
              <option value="driver">All Drivers Only</option>
              <option value="single_user">Specific User(s)</option>
              <option value="single_driver">Specific Driver(s)</option>
            </select>
          </div>

          {/* Search & Select Recipients */}
          {isSingleTarget && (
            <div style={{ marginBottom: '16px', position: 'relative' }} ref={dropdownRef}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Select {form.target === 'single_driver' ? 'Driver(s)' : 'User(s)'} (Search by Name or Phone) *
              </label>

              {/* Selected Recipients list */}
              {selectedRecipients.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {selectedRecipients.map(user => (
                    <div
                      key={user.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="material-icons" style={{ color: '#0284c7', fontSize: '20px' }}>account_circle</i>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1' }}>
                            {user.name || 'Unnamed'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#0c4a6e' }}>
                            {user.phone ? `Phone: ${user.phone}` : ''} {user.email ? ` | ${user.email}` : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(user.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Remove recipient"
                      >
                        <i className="material-icons" style={{ fontSize: '18px' }}>close</i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <i className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>search</i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder={`Search & add ${form.target === 'single_driver' ? 'driver' : 'user'} by name or phone...`}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', boxSizing: 'border-box' }}
                />

                {/* Dropdown Results */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    marginTop: '4px',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    {searching ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No matches found</div>
                    ) : (
                      searchResults.map(user => {
                        const isAdded = selectedRecipients.some(r => r.id === user.id);
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleSelectRecipient(user)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isAdded ? '#f1f5f9' : 'none',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => {
                              if (!isAdded) e.currentTarget.style.background = '#f8fafc';
                            }}
                            onMouseLeave={e => {
                              if (!isAdded) e.currentTarget.style.background = 'none';
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                                {user.name || 'Unnamed'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {user.phone ? `Ph: ${user.phone}` : ''} {user.email ? `(${user.email})` : ''}
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', color: isAdded ? '#10b981' : '#3b82f6', fontWeight: '600' }}>
                              {isAdded ? 'Added ✓' : '+ Select'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Notification title"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Notification message"
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <PrimaryBtn icon="send" label={sending ? 'Sending...' : 'Send Notification'} onClick={handleSend} disabled={sending} />
        </div>

        <div style={{ marginTop: '24px', background: 'rgba(255,77,109,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,77,109,0.2)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <i className="material-icons" style={{ color: '#ff4d6d', fontSize: '22px' }}>info</i>
            <div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Targeted & Bulk Notifications</div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                You can send bulk notifications or target specific users/drivers (1 or multiple) by searching their name or phone number.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
