const db = require('../../models');
const { Op, fn, col } = require('sequelize');
const helper = require('../../helpers/helper');
const { users, payments } = db;

module.exports = {

  paymentList: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status;
      const type = req.query.type;
      const { startDate, endDate } = req.query;

      let whereClause = {};
      if (status) {
        // Map status strings to database integers: success => 1, failed => 2, pending => 0
        if (status === 'success') whereClause.payment_status = 1;
        else if (status === 'failed') whereClause.payment_status = 2;
        else if (status === 'pending') whereClause.payment_status = 0;
      }

      if (type) {
        if (type === 'pass' || type === '1') {
          whereClause.type = 1;
        } else if (type === 'other' || type === '2' || type === 'ride') {
          whereClause.type = { [Op.ne]: 1 };
        } else if (!isNaN(parseInt(type))) {
          whereClause.type = parseInt(type);
        }
      }

      if (search) whereClause.transactionId = { [Op.like]: `%${search}%` };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
          whereClause.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
        }
      }

      const { count, rows } = await payments.findAndCountAll({
        where: whereClause,
        include: [
          { model: users, as: 'payer', attributes: ['id', 'name', 'email'] },
          { model: users, as: 'driver', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      const formattedRows = rows.map(r => {
        const data = r.toJSON();

        // Map status field to standard strings for status badges
        if (data.payment_status === 1) data.paymentStatus = 'success';
        else if (data.payment_status === 2) data.paymentStatus = 'failed';
        else data.paymentStatus = 'pending';

        return data;
      });

      return helper.success(res, 'Payments fetched', {
        list: formattedRows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },
  paymentStats: async (req, res) => {
    try {
      // Admin Revenue: Pass Payments (type = 1)
      const adminRevenueResult = await payments.findOne({
        attributes: [
          [fn('COALESCE', fn('SUM', col('amount')), 0), 'total']
        ],
        where: {
          type: 1,
          payment_status: 1
        },
        raw: true
      });

      // Provider Payout / Driver Earning: Other / Ride Payments (type != 1)
      const providerPayoutResult = await payments.findOne({
        attributes: [
          [fn('COALESCE', fn('SUM', col('amount')), 0), 'total']
        ],
        where: {
          type: { [Op.ne]: 1 },
          payment_status: 1
        },
        raw: true
      });

      // Total Volume: All successful payments
      const totalVolumeResult = await payments.findOne({
        attributes: [
          [fn('COALESCE', fn('SUM', col('amount')), 0), 'total']
        ],
        where: {
          payment_status: 1
        },
        raw: true
      });

      const adminRevenue = parseFloat(adminRevenueResult?.total || 0);
      const providerPayout = parseFloat(providerPayoutResult?.total || 0);
      const totalVolume = parseFloat(totalVolumeResult?.total || 0);

      return helper.success(res, 'Payment stats fetched', {
        adminRevenue,
        providerPayout,
        totalVolume
      });
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },
  paymentDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await payments.findOne({
        where: { id },
        include: [
          { model: users, as: 'payer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: users, as: 'driver', attributes: ['id', 'name', 'email', 'phone'] }
        ]
      });

      if (!payment) return helper.failed(res, 'Payment not found');
      return helper.success(res, 'Payment detail fetched', payment);
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  }
};
