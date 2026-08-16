import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  StatusBadge,
  formatDate,
  ImageModal,
  formatCurrency
} from '../../components/common/PageTable';

import { get_user_list } from '../../utils/thunkApis';
import apiInstance from '../../utils/apiInstance';
import { imageBaseUrl } from '../../services/api';

const DriversList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [isApprove, setIsApprove] = useState(() => searchParams.get('is_approve') ?? '');

  const [data, setData] = useState({
    list: [],
    total: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const limit = 10;
  const role = 'driver';

  const fetchData = useCallback(async () => {
    try {
      setLoading(page === 1 && !data.list.length);

      const { payload } = await dispatch(
        get_user_list({
          page,
          limit,
          search,
          role,
          is_approve: isApprove
        })
      );

      setData({
        list: payload?.user_list || [],
        total: payload?.total || 0,
        totalPages: payload?.totalPages || 1
      });
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, search, isApprove]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();

      const params = { page, search };
      if (isApprove !== '') {
        params.is_approve = isApprove;
      }
      setSearchParams(params, { replace: true });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [page, search, isApprove]);

  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(id);

    try {
      await apiInstance.put(`/toggleUserStatus/${id}`, { status: newStatus });

      toast.success(`Driver status updated successfully`);

      setData((prev) => ({
        ...prev,
        list: prev.list.map((item) =>
          item.id === id
            ? {
              ...item,
              status: newStatus
            }
            : item
        )
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        'Failed to update status'
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleApprovalChange = async (id, newApprovalStatus) => {
    setApprovalLoading(id);

    try {
      await apiInstance.put(`/approveDriver/${id}`, { is_approve: Number(newApprovalStatus) });

      toast.success(`Driver approval status updated successfully`);

      setData((prev) => ({
        ...prev,
        list: prev.list.map((item) =>
          item.id === id
            ? {
              ...item,
              is_approve: Number(newApprovalStatus)
            }
            : item
        )
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        'Failed to update approval status'
      );
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await apiInstance.delete(`/deleteUser/${id}`);

      toast.success('Driver deleted successfully');

      setData((prev) => ({
        ...prev,
        list: prev.list.filter(
          (item) => item.id !== id
        )
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        'Failed to delete driver'
      );
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
      />

      <PageHeader
        title="Drivers"
        subtitle={`${data.total} total drivers`}
        action={
          <button
            onClick={() =>
              navigate('/driversListDeleted')
            }
            style={{
              background:
                'linear-gradient(90deg,#3b82f6,#60a5fa)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <i
              className="material-icons"
              style={{
                fontSize: '18px',
                verticalAlign: 'middle',
                marginRight: '6px'
              }}
            >
              delete
            </i>
            Deleted Drivers
          </button>
        }
      />

      <TableCard>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <SearchBar
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search drivers..."
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Approval Status:
            </label>
            <select
              value={isApprove}
              onChange={(e) => {
                setPage(1);
                setIsApprove(e.target.value);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              <option value="">All Drivers</option>
              <option value="1">Approved</option>
              <option value="2">Disapproved</option>
              <option value="0">Pending</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}
          >
            <TableHead
              columns={[
                'Sr. No.',
                'First Name',
                'Last Name',
                'Email',
                'Country Code',
                'Phone',
                'Vehicle Images',
                'Bookings',
                'Total Earning',
                'Status',
                'Approval Status',
                // 'Joined',
                'Actions'
              ]}
            />

            <tbody>
              {loading && <LoadingRow cols={13} />}

              {!loading && !data.list?.length && (
                <EmptyRow
                  cols={13}
                  message="No drivers found"
                />
              )}

              {!loading &&
                data.list?.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom:
                        '1px solid #f3f4f6'
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#9ca3af',
                        fontSize: '13px'
                      }}
                    >
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <img
                          src={
                            user.profileImage ||
                              user.profile_picture
                              ? `${imageBaseUrl}${user.profileImage ||
                              user.profile_picture
                              }`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name || 'D'
                              )}&background=3b82f6&color=fff`
                          }
                          alt={user.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            cursor: 'zoom-in'
                          }}
                          onClick={() => {
                            const src = user.profileImage || user.profile_picture
                              ? `${imageBaseUrl}${user.profileImage || user.profile_picture}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'D')}&background=3b82f6&color=fff`;
                            setPreviewImage(src);
                            setPreviewTitle(user.name);
                          }}
                        />

                        <div
                          style={{
                            fontWeight: '600',
                            color: '#111827',
                            fontSize: '14px'
                          }}
                        >
                          {user.name}
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#374151',
                        fontSize: '13px'
                      }}
                    >
                      {user.last_name || '—'}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#374151',
                        fontSize: '13px'
                      }}
                    >
                      {user.email || '—'}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#374151',
                        fontSize: '13px'
                      }}
                    >
                      {user.countryCode || '—'}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#374151',
                        fontSize: '13px'
                      }}
                    >
                      {user.phone || '—'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {user.vehicle?.images?.length > 0 ? (
                          user.vehicle.images.map((img, idx) => (
                            <img
                              key={img.id || idx}
                              src={`${imageBaseUrl}${img.images}`}
                              alt="vehicle"
                              style={{ width: '45px', height: '35px', borderRadius: '4px', objectFit: 'cover', cursor: 'zoom-in', border: '1px solid #e5e7eb', transition: 'transform 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              onClick={() => {
                                setPreviewImage(`${imageBaseUrl}${img.images}`);
                                setPreviewTitle('Vehicle Image');
                              }}
                            />
                          ))
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#374151',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      {user.driverJobs?.length || 0}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#16a34a',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      {formatCurrency(user.totalEarning || 0)}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px'
                      }}
                    >
                      {statusLoading === user.id ? (
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      ) : (
                        <select
                          value={user.status || 'active'}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            fontSize: '12px',
                            background: user.status === 'blocked' ? '#fee2e2' : user.status === 'inactive' ? '#f3f4f6' : '#dcfce7',
                            color: user.status === 'blocked' ? '#dc2626' : user.status === 'inactive' ? '#6b7280' : '#16a34a',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      )}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px'
                      }}
                    >
                      {approvalLoading === user.id ? (
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      ) : (
                        <select
                          value={user.is_approve !== undefined && user.is_approve !== null ? user.is_approve : 0}
                          onChange={(e) => handleApprovalChange(user.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            fontSize: '12px',
                            background: Number(user.is_approve) === 1 ? '#dcfce7' : Number(user.is_approve) === 2 ? '#fee2e2' : '#fef9c3',
                            color: Number(user.is_approve) === 1 ? '#16a34a' : Number(user.is_approve) === 2 ? '#dc2626' : '#ca8a04',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <option value={0}>Pending</option>
                          <option value={1}>Approved</option>
                          <option value={2}>Disapproved</option>
                        </select>
                      )}
                    </td>

                    {/* <td
                      style={{
                        padding: '14px 16px',
                        color: '#6b7280',
                        fontSize: '13px'
                      }}
                    >
                      {formatDate(user.createdAt)}
                    </td> */}

                    <td
                      style={{
                        padding: '14px 16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px'
                        }}
                      >
                        <ActionBtn
                          icon="visibility"
                          color="#3b82f6"
                          title="View"
                          onClick={() =>
                            navigate(
                              `/driversView/${user.id}`
                            )
                          }
                        />

                        <ActionBtn
                          icon="delete"
                          color="#ef4444"
                          title="Delete"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPage={setPage}
        />
      </TableCard>

      <ImageModal
        src={previewImage}
        alt={previewTitle}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default DriversList;
