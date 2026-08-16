const db = require('../../models');
const { subscription } = db;
const helper = require('../../helpers/helper');

module.exports = {
  subscriptionList: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const isAll = req.query.all === 'true';
      const limit = isAll ? null : (parseInt(req.query.limit) || 10);
      const offset = isAll ? null : (page - 1) * (limit || 10);

      const queryOptions = {
        order: [['createdAt', 'DESC']],
        distinct: true
      };

      if (!isAll) {
        queryOptions.limit = limit;
        queryOptions.offset = offset;
      }

      const { count, rows } = await subscription.findAndCountAll(queryOptions);

      return helper.success(res, 'Subscriptions fetched', {
        list: rows,
        total: count,
        currentPage: isAll ? 1 : page,
        totalPages: isAll ? 1 : Math.ceil(count / (limit || 10))
      });
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },

  updateSubscription: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, description } = req.body;

      if (!name || !price || !description) {
        return helper.failed(res, 'Name, price, and description are required');
      }

      const sub = await subscription.findOne({ where: { id } });
      if (!sub) return helper.failed(res, 'Subscription not found');

      await sub.update({ name, price, description });
      return helper.success(res, 'Subscription updated successfully', sub);
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  }
};
