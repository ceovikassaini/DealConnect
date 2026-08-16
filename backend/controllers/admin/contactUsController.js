const db = require('../../models');
const { Op } = require('sequelize');
const helper = require('../../helpers/helper');
const { Validator } = require('node-input-validator');

module.exports = {
  contactUs_list: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await db.support.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      })

      console.log(rows, ">>rowsrowsrows");

      return helper.success(res, 'Contact list fetched', {
        list: rows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      
      return helper.error(res, 'Something went wrong');
    }
  },

  view_contactUs: async (req, res) => {
    try {
      const { id } = req.params;
      if (!db.support) return helper.success(res, 'Not found', {});
      const item = await db.support.findOne({
        where: { id },
      });
      if (!item) return helper.failed(res, 'Not found');
      return helper.success(res, 'Fetched', item);
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },

  update_contactUs: async (req, res) => {
    try {
      const { id } = req.params;
      if (!db.support) return helper.success(res, 'OK');
      await db.support.update(req.body, { where: { id } });
      return helper.success(res, 'Updated');
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },

  delete_contactUs: async (req, res) => {
    try {
      const { id } = req.params;
      if (!db.support) return helper.success(res, 'OK');
      await db.support.destroy({ where: { id } });
      return helper.success(res, 'Deleted');
    } catch (error) {
      console.log(error);
      return helper.error(res, 'Something went wrong');
    }
  },
};
