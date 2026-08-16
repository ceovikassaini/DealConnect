const db = require('../../models');
const { Op, fn, col } = require('sequelize');
const helper = require('../../helpers/helper');

const monthSeries = (rows, keyField = 'count') => {
  const out = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, [keyField]: 0 }));
  rows.forEach((r) => {
    const m = parseInt(r.month, 10);
    if (m >= 1 && m <= 12) out[m - 1][keyField] = parseFloat(r[keyField]) || 0;
  });
  return out;
};

module.exports = {
  dashboard_data: async (req, res) => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const [
        usersCount,
        driversCount,
        jobsCount,
        activeJobs,
        todaysRidesCount,
        onDutyDriversCount,
        waitingForApprovalCount,
      ] = await Promise.all([
        db.users.count({ where: { role: 'user' } }),
        db.users.count({ where: { role: 'driver' } }),
        db.jobs.count(),
        db.jobs.count({ where: { status: { [Op.in]: [0, 1] } } }),
        db.jobs.count({
          where: {
            createdAt: {
              [Op.gte]: todayStart,
              [Op.lt]: tomorrowStart,
            }
          }
        }),
        db.users.count({
          where: {
            role: 'driver',
            is_approve: 1,
            status: 'active'
          }
        }),
        db.users.count({
          where: {
            role: 'driver',
            is_approve: 0
          }
        }),
      ]);

      const totalAdminRevenueRow = await db.payments.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
        where: { payment_status: 1, type: 1 },
        raw: true,
      });

      const monthlyAdminRevenueRow = await db.payments.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
        where: {
          payment_status: 1,
          type: 1,
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
            [Op.lt]: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
        raw: true,
      });

      const totalDriverEarningRow = await db.payments.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
        where: { payment_status: 1, type: { [Op.ne]: 1 } },
        raw: true,
      });

      const monthlyDriverEarningRow = await db.payments.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
        where: {
          payment_status: 1,
          type: { [Op.ne]: 1 },
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
            [Op.lt]: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
        raw: true,
      });

      const todaysRevenueRow = await db.payments.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
        where: {
          payment_status: 1,
          createdAt: {
            [Op.gte]: todayStart,
            [Op.lt]: tomorrowStart,
          },
        },
        raw: true,
      });

      const recentJobs = await db.jobs.findAll({
        limit: 8,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.users, as: 'rider',     attributes: ['id', 'name', 'email'] },
          { model: db.users, as: 'jobDriver', attributes: ['id', 'name', 'email'] },
        ],
      });

      const recentUsers = await db.users.findAll({
        where: { role: 'user' },
        limit: 8,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt'],
      });

      const recentDrivers = await db.users.findAll({
        where: { role: 'driver' },
        limit: 8,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'status', 'createdAt'],
      });

      return helper.success(res, 'Dashboard data fetched', {
        data: {
          usersCount,
          driversCount,
          jobsCount,
          activeJobs,
          totalRevenue: Number(totalAdminRevenueRow?.total || 0),
          monthlyRevenue: Number(monthlyAdminRevenueRow?.total || 0),
          totalDriverEarning: Number(totalDriverEarningRow?.total || 0),
          monthlyDriverEarning: Number(monthlyDriverEarningRow?.total || 0),
          todaysRidesCount,
          todaysEarning: Number(todaysRevenueRow?.total || 0),
          onDutyDriversCount,
          waitingForApprovalCount,
        },
        recentJobs,
        recentUsers,
        recentDrivers,
      });
    } catch (err) {
      console.log(err);
      return helper.error(res, 'Something went wrong');
    }
  },

  getMonthlyUserStats: async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const range = {
        [Op.gte]: new Date(`${currentYear}-01-01`),
        [Op.lte]: new Date(`${currentYear}-12-31 23:59:59`),
      };

      const usersData = await db.users.findAll({
        attributes: [
          [fn('MONTH', col('createdAt')), 'month'],
          'role',
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { role: { [Op.in]: ['user', 'driver'] }, createdAt: range },
        group: ['month', 'role'],
        raw: true,
      });

      const driversData = await db.users.findAll({
        attributes: [
          [fn('MONTH', col('createdAt')), 'month'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { role: 'driver', createdAt: range },
        group: ['month'],
        raw: true,
      });

      const jobsData = await db.jobs.findAll({
        attributes: [
          [fn('MONTH', col('createdAt')), 'month'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { createdAt: range },
        group: ['month'],
        raw: true,
      });

      const revenueData = await db.payments.findAll({
        attributes: [
          [fn('MONTH', col('createdAt')), 'month'],
          [fn('COALESCE', fn('SUM', col('amount')), 0), 'total'],
        ],
        where: { payment_status: 1, createdAt: range },
        group: ['month'],
        raw: true,
      });

      const monthlyUsers = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, user: 0, driver: 0 }));
      usersData.forEach(({ month, role, count }) => {
        const idx = month - 1;
        if (role === 'user') monthlyUsers[idx].user = parseInt(count, 10);
        if (role === 'driver') monthlyUsers[idx].driver = parseInt(count, 10);
      });

      return helper.success(res, 'Monthly stats fetched', {
        data: monthlyUsers,
        bookings: monthSeries(jobsData, 'count'),
        revenue: monthSeries(revenueData, 'total'),
      });
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },
};
