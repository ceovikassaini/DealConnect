const { users, activity_logs } = require("../../models");
const helper = require("../../helpers/helper");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { logActivity } = require("../../helpers/loggerHelper");

module.exports = {
  // Get list of subadmins
  listSubAdmins: async (req, res) => {
    try {
      const list = await users.findAll({
        where: {
          role: 'subadmin'
        },
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      return helper.success(res, "Subadmins fetched successfully", list);
    } catch (error) {
      console.error("Error in listSubAdmins:", error);
      return helper.error(res, "Something went wrong fetching subadmins");
    }
  },

  // Create new subadmin
  createSubAdmin: async (req, res) => {
    try {
      const { name, last_name, email, phone, password, status, permissions } = req.body;

      if (!name || !name.trim()) {
        return helper.failed(res, "First name is required");
      }
      if (!last_name || !last_name.trim()) {
        return helper.failed(res, "Last name is required");
      }
      if (!email || !email.trim()) {
        return helper.failed(res, "Email is required");
      }
      if (!phone || !phone.trim()) {
        return helper.failed(res, "Mobile number is required");
      }
      if (!password || !password.trim()) {
        return helper.failed(res, "Password is required");
      }

      const existingUser = await users.findOne({
        where: {
          [Op.or]: [{ email: email.trim() }, { phone: phone.trim() }]
        }
      });

      if (existingUser) {
        return helper.failed(res, "Email or Phone number is already registered");
      }

      const hashedPassword = bcrypt.hashSync(password.trim(), 10);

      const subadmin = await users.create({
        name: name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hashedPassword,
        role: 'subadmin',
        status: status === false || status === 'blocked' ? 'blocked' : 'active',
        permissions: typeof permissions === 'object' ? permissions : {}
      });

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      const logMsg = `${clientType} Created sub-admin: ${name.trim()} ${last_name.trim()}`;
      await logActivity(req, 'Client', logMsg, {
        id: subadmin.id,
        name: subadmin.name,
        last_name: subadmin.last_name,
        email: subadmin.email,
        phone: subadmin.phone,
        status: subadmin.status,
        permissions: subadmin.permissions
      });

      const subadminJson = subadmin.toJSON();
      delete subadminJson.password;

      return helper.success(res, "Subadmin created successfully", subadminJson);
    } catch (error) {
      console.error("Error in createSubAdmin:", error);
      return helper.error(res, "Something went wrong creating subadmin");
    }
  },

  // Update existing subadmin
  updateSubAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, last_name, email, phone, password, status, permissions } = req.body;

      const subadmin = await users.findOne({
        where: { id, role: 'subadmin' }
      });

      if (!subadmin) {
        return helper.failed(res, "Subadmin not found", {}, 404);
      }

      const updateData = {};
      if (name !== undefined && name.trim()) updateData.name = name.trim();
      if (last_name !== undefined && last_name.trim()) updateData.last_name = last_name.trim();
      if (email !== undefined && email.trim()) updateData.email = email.trim().toLowerCase();
      if (phone !== undefined && phone.trim()) updateData.phone = phone.trim();
      if (status !== undefined) {
        updateData.status = status === false || status === 'blocked' || status === 'inactive' ? 'blocked' : 'active';
      }
      if (permissions !== undefined) {
        updateData.permissions = typeof permissions === 'object' ? permissions : {};
      }
      if (password && password.trim()) {
        updateData.password = bcrypt.hashSync(password.trim(), 10);
      }

      await subadmin.update(updateData);

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      const logMsg = `${clientType} Updated sub-admin: ${subadmin.name} ${subadmin.last_name}`;
      await logActivity(req, 'Client', logMsg, {
        id: subadmin.id,
        name: subadmin.name,
        last_name: subadmin.last_name,
        email: subadmin.email,
        phone: subadmin.phone,
        status: subadmin.status,
        permissions: subadmin.permissions
      });

      const subadminJson = subadmin.toJSON();
      delete subadminJson.password;

      return helper.success(res, "Subadmin updated successfully", subadminJson);
    } catch (error) {
      console.error("Error in updateSubAdmin:", error);
      return helper.error(res, "Something went wrong updating subadmin");
    }
  },

  // Delete subadmin
  deleteSubAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const subadmin = await users.findOne({
        where: { id, role: 'subadmin' }
      });

      if (!subadmin) {
        return helper.failed(res, "Subadmin not found", {}, 404);
      }

      const name = `${subadmin.name} ${subadmin.last_name}`;
      await subadmin.destroy();

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      const logMsg = `${clientType} Deleted sub-admin: ${name}`;
      await logActivity(req, 'Client', logMsg, { id, name });

      return helper.success(res, "Subadmin deleted successfully");
    } catch (error) {
      console.error("Error in deleteSubAdmin:", error);
      return helper.error(res, "Something went wrong deleting subadmin");
    }
  },

  // Fetch Activity Logs
  getLogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const clientFilter = req.query.client || "All";

      let whereClause = {};

      if (clientFilter && clientFilter !== "All") {
        whereClause.client = clientFilter;
      }

      if (search) {
        whereClause[Op.or] = [
          { message: { [Op.like]: `%${search}%` } },
          { module: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await activity_logs.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['id', 'name', 'last_name', 'email', 'role']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return helper.success(res, "Logs fetched successfully", {
        list: rows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error("Error in getLogs:", error);
      return helper.error(res, "Something went wrong fetching logs");
    }
  }
};
