const db = require('../../models');
const { Op } = require('sequelize');
const helper = require('../../helpers/helper');

module.exports = {

  jobList: async (req, res) => {
    const { page = 1, limit = 10, search = '', status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    try {
      const where = {};
      if (status !== undefined && status !== '') where.status = status;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
        }
      }

      const { count, rows } = await db.jobs.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.users, as: 'rider',     attributes: ['id', 'name', 'email', 'phone', 'profileImage'] },
          { model: db.users, as: 'jobDriver', attributes: ['id', 'name', 'email', 'phone', 'profileImage'] },
        ],
      });

      const filtered = search
        ? rows.filter(j =>
            j.pick_location?.toLowerCase().includes(search.toLowerCase()) ||
            j.drop_location?.toLowerCase().includes(search.toLowerCase()) ||
            j.rider?.name?.toLowerCase().includes(search.toLowerCase()) ||
            j.jobDriver?.name?.toLowerCase().includes(search.toLowerCase()) ||
            String(j.id).includes(search)
          )
        : rows;

      return helper.success(res, 'Jobs fetched successfully', {
        list: filtered,
        total: count,
        totalPages: Math.ceil(count / limit),
        page: parseInt(page),
      });
    } catch (err) {
      console.log(err);
      return helper.failed(res, 'Something went wrong');
    }
  },

  viewJob: async (req, res) => {
    const { id } = req.params;
    try {
      const job = await db.jobs.findOne({
        where: { id },
        include: [
          { model: db.users, as: 'rider',     attributes: ['id', 'name', 'email', 'phone', 'profileImage'] },
          { model: db.users, as: 'jobDriver', attributes: ['id', 'name', 'email', 'phone', 'profileImage'] },
        ],
      });
      if (!job) return helper.failed(res, 'Job not found');
      return helper.success(res, 'Job details fetched', job);
    } catch (err) {
      console.log(err);
      return helper.failed(res, 'Something went wrong');
    }
  },

  toggleJobStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const job = await db.jobs.findOne({ where: { id } });
      if (!job) return helper.failed(res, 'Job not found');
      await job.update({ status: parseInt(status) });
      return helper.success(res, 'Job status updated');
    } catch (err) {
      console.log(err);
      return helper.failed(res, 'Something went wrong');
    }
  },

  jobOffers: async (req, res) => {
    const { jobId } = req.params;
    try {
      const offers = await db.jobs_offer.findAll({
        where: { job_id: parseInt(jobId) || jobId },
        order: [['amount', 'DESC']],
      });
      return helper.success(res, 'Job offers fetched', offers);
    } catch (err) {
      console.log(err);
      return helper.failed(res, 'Something went wrong');
    }
  },

};
