import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import apiInstance from '../../utils/apiInstance';

/* ── Multi-Select Tag Input ───────────────────────────────────────────── */
const MultiSelectTag = ({ options = [], selected = [], onChange, placeholder = 'Search...' }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) &&
    !selected.find(s => s.value === o.value)
  );

  const remove = (val) => onChange(selected.filter(s => s.value !== val));
  const add = (opt) => { onChange([...selected, opt]); setSearch(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(true)}
        style={{
          minHeight: '42px', border: '1px solid #d1d5db', borderRadius: '8px',
          padding: '4px 32px 4px 8px', background: '#fff', cursor: 'text',
          display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center',
          position: 'relative'
        }}
      >
        {selected.map(s => (
          <span key={s.value} style={{
            background: '#e0e7ff', color: '#3730a3', borderRadius: '4px',
            padding: '2px 6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
            fontWeight: '500'
          }}>
            {s.label}
            <span
              onClick={(e) => { e.stopPropagation(); remove(s.value); }}
              style={{ cursor: 'pointer', color: '#ef4444', fontWeight: '700', fontSize: '14px' }}
            >×</span>
          </span>
        ))}
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ''}
          style={{
            border: 'none', outline: 'none', fontSize: '13px',
            flex: 1, minWidth: '80px', padding: '2px 4px', background: 'transparent'
          }}
        />
        <i className="material-icons" style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          color: '#9ca3af', fontSize: '18px', pointerEvents: 'none'
        }}>arrow_drop_down</i>
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '200px', overflowY: 'auto', marginTop: '4px'
        }}>
          {filtered.map(opt => (
            <div
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); add(opt); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#374151',
                borderBottom: '1px solid #f3f4f6'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Toggle Switch ────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
        background: checked ? '#3b82f6' : '#d1d5db', transition: 'background 0.2s', cursor: 'pointer'
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  </label>
);

/* ── Section Header ───────────────────────────────────────────────────── */
const SectionTitle = ({ title }) => (
  <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
    <h6 style={{ margin: 0, fontWeight: '700', color: '#111827', fontSize: '15px' }}>{title}</h6>
  </div>
);

/* ── Form Field Wrapper ───────────────────────────────────────────────── */
const Field = ({ label, required, children, colSpan }) => (
  <div style={{ gridColumn: colSpan ? `span ${colSpan}` : undefined }}>
    <label style={{ display: 'block', fontWeight: '500', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#111827'
};

const selectStyle = {
  ...inputStyle, background: '#fff', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center'
};



/* ══════════════════════════════════════════════════════════════════════ */
const AddPromo = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    targetType: '1', // '1' = user, '2' = driver
    name: '', description: '', code: '', redeemStart: '', redeemEnd: '',
    status: true, usagePerUser: '1',
    promoType: 'percentage', discount: '', maxDiscountAmount: '', minOrderValue: '',
    allCustomers: false, selectedUsers: [],
    selectedLocations: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // Fetch target audience list (users or drivers) based on targetType (1 or 2)
  const fetchUsersOrDrivers = (tType = '1') => {
    const role = (tType === '2' || tType === 2 || tType === 'driver') ? 'driver' : 'user';
    apiInstance.get(`/promo-codes/users-list?role=${role}`)
      .then(res => {
        const list = res.data?.body?.list || [];
        setUserOptions(list.map(u => {
          const fullName = [u.name, u.last_name].filter(Boolean).join(' ');
          const phone = u.phone ? `${u.countryCode || ''}${u.phone}` : (u.email || '');
          return { value: u.id, label: `${fullName} (${phone})` };
        }));
      })
      .catch(err => {
        console.error('Failed to load audience:', err);
      });
  };

  // Load users and locations on mount
  useEffect(() => {
    fetchUsersOrDrivers(form.targetType || '1');

    apiInstance.get('/promo-codes/locations-list')
      .then(res => {
        const list = res.data?.body?.list || [];
        setLocationOptions(list.map(l => ({
          value: l.id,
          label: l.city ? `${l.name} – ${l.city}` : l.name
        })));
      })
      .catch(err => {
        console.error('Failed to load locations:', err);
      });
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleTargetTypeChange = (newType) => {
    setForm(prev => ({
      ...prev,
      targetType: newType,
      selectedUsers: [],
      allCustomers: false
    }));
    fetchUsersOrDrivers(newType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Promo code is required');
    if (!form.discount) return toast.error('Discount value is required');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('targetType', form.targetType || 'user');
      fd.append('code', form.code.trim().toUpperCase());
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('discountType', form.promoType);
      fd.append('discountValue', form.discount);
      if (form.maxDiscountAmount) fd.append('maxDiscountAmount', form.maxDiscountAmount);
      if (form.minOrderValue) fd.append('minOrderValue', form.minOrderValue);
      fd.append('usagePerUser', form.usagePerUser);
      if (form.redeemStart) fd.append('startDate', form.redeemStart);
      if (form.redeemEnd) fd.append('expiresAt', form.redeemEnd);
      fd.append('status', form.status ? 'active' : 'inactive');

      // Audience selection:
      if (form.allCustomers) {
        fd.append('userType', '2');
      } else {
        fd.append('userType', '1');
        if (form.selectedUsers.length > 0) {
          fd.append('user_ids', JSON.stringify(form.selectedUsers.map(u => u.value)));
        }
      }

      // Locations
      if (form.selectedLocations.length > 0) {
        fd.append('location_ids', JSON.stringify(form.selectedLocations.map(l => l.value)));
      }

      await apiInstance.post('/promo-codes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Promo code created successfully');
      setTimeout(() => navigate('/promo-codes'), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create promo code');
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px'
  };
  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
  const gridThree = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };
  const isDriverTarget = form.targetType === '2' || form.targetType === 2 || form.targetType === 'driver';

  return (
    <div style={{ padding: '4px 0 32px' }}>
      <ToastContainer position="top-right" autoClose={2500} />

      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ margin: 0, fontWeight: '700', color: '#111827', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.5px' }}>
          Add Promo Code
        </h5>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Promo Code Details ── */}
        <div style={cardStyle}>
          <SectionTitle title="Promo Code Details" />
          <div style={{ ...gridTwo, marginBottom: '20px' }}>
            <Field label="Promo Code Name (English)" required>
              <input style={inputStyle} type="text" required value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Promo Code Name" />
            </Field>
            <Field label="Promo Code Description (English)" required>
              <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={form.description}
                onChange={e => set('description', e.target.value)} placeholder="Promo Code Description" />
            </Field>

            <Field label="Promo Code" required>
              <input style={inputStyle} type="text" required value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())} placeholder="Promo Code" />
            </Field>

            <Field label="Promo Code Redeem start/end Period" required>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <i className="material-icons" style={{ color: '#9ca3af', fontSize: '18px' }}>calendar_today</i>
                <input style={{ ...inputStyle, flex: 1 }} type="datetime-local" value={form.redeemStart}
                  onChange={e => set('redeemStart', e.target.value)} />
                <input style={{ ...inputStyle, flex: 1 }} type="datetime-local" value={form.redeemEnd}
                  onChange={e => set('redeemEnd', e.target.value)} />
              </div>
            </Field>

            <Field label="Status" required>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <Toggle checked={form.status} onChange={v => set('status', v)} />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{form.status ? 'Active' : 'Inactive'}</span>
              </div>
            </Field>
          </div>
        </div>

        {/* ── Discount Details ── */}
        <div style={cardStyle}>
          <SectionTitle title="Discount Details" />
          <div style={{ ...gridThree, marginBottom: '20px' }}>
            <Field label="Promo Code Usage Per User">
              <select style={selectStyle} value={form.usagePerUser} onChange={e => set('usagePerUser', e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </Field>
            <Field label="Promo Code Type">
              <select style={selectStyle} value={form.promoType} onChange={e => set('promoType', e.target.value)}>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Flat Discount</option>
              </select>
            </Field>

            <Field label={form.promoType === 'percentage' ? 'Discount (%)' : 'Flat Discount Amount'} required>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.discount}
                onChange={e => set('discount', e.target.value)}
                placeholder={form.promoType === 'percentage' ? 'Discount (%)' : 'Flat Amount'} />
            </Field>
            <Field label="Maximum Discount Amount" required>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.maxDiscountAmount}
                onChange={e => set('maxDiscountAmount', e.target.value)} placeholder="Maximum Discount Amount" />
            </Field>
            <Field label="Minimum Order Values" required>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.minOrderValue}
                onChange={e => set('minOrderValue', e.target.value)} placeholder="Minimum Order Values" />
            </Field>
          </div>
        </div>

        {/* ── Audience (Customers / Drivers) ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
            <h6 style={{ margin: 0, fontWeight: '700', color: '#111827', fontSize: '15px' }}>
              {isDriverTarget ? "Drivers" : "Customers"}
            </h6>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="targetTypeRadio"
                  value="1"
                  checked={form.targetType === '1' || form.targetType === 1}
                  onChange={() => handleTargetTypeChange('1')}
                />
                For Customers
              </label>

              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="targetTypeRadio"
                  value="2"
                  checked={form.targetType === '2' || form.targetType === 2}
                  onChange={() => handleTargetTypeChange('2')}
                />
                For Drivers
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
              <input
                type="checkbox"
                id="allCustomers"
                checked={form.allCustomers}
                onChange={e => set('allCustomers', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="allCustomers" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                {isDriverTarget ? "Promo code valid for all Drivers" : "Promo code valid for all Customers"}
              </label>
            </div>

            {!form.allCustomers && (
              <>
                <div style={{ paddingTop: '6px', fontWeight: '700', color: '#374151', fontSize: '14px' }}>OR</div>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <MultiSelectTag
                    options={userOptions}
                    selected={form.selectedUsers}
                    onChange={v => set('selectedUsers', v)}
                    placeholder={isDriverTarget ? "Search and Select Drivers..." : "Search and Select Customers..."}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Select Location ── */}
        <div style={cardStyle}>
          <SectionTitle title="Select Location" />
          <Field label="Location">
            <MultiSelectTag
              options={locationOptions}
              selected={form.selectedLocations}
              onChange={v => set('selectedLocations', v)}
              placeholder="Select locations..."
            />
          </Field>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/promo-codes')}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
              background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: submitting ? '#93c5fd' : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
              color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
            }}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPromo;
