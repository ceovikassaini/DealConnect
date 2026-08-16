const db = require('../../models');
const { promo_codes, promo_code_users, users, geofences } = db;
const helper = require('../../helpers/helper');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

module.exports = {

  // ─────────────────────────────────────────────────────────────────
  // GET /promo-codes/users-list
  // Returns app users (role = 'user') for the multi-select dropdown
  // ─────────────────────────────────────────────────────────────────
  usersList: async (req, res) => {
    try {
      const search = (req.query.search || '').trim();
      const role = (req.query.role || 'user').trim();
      const where = { role };

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const list = await users.findAll({
        where,
        paranoid: true,               // respects deletedAt
        attributes: ['id', 'name', 'last_name', 'phone', 'countryCode', 'email', 'profileImage', 'status'],
        order: [['name', 'ASC']],
        limit: 200
      });

      return helper.success(res, 'Users list fetched', { list });
    } catch (error) {
      console.error('promoController.usersList:', error);
      return helper.error(res, 'Something went wrong fetching users');
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /promo-codes/locations-list
  // Returns geofences (locations) added by admin for the dropdown
  // ─────────────────────────────────────────────────────────────────
  locationsList: async (req, res) => {
    try {
      const search = (req.query.search || '').trim();
      const where = {};
      if (search) where.name = { [Op.like]: `%${search}%` };

      const list = await geofences.findAll({
        where,
        attributes: ['id', 'name', 'city', 'is_active'],
        order: [['name', 'ASC']]
      });

      return helper.success(res, 'Locations list fetched', { list });
    } catch (error) {
      console.error('promoController.locationsList:', error);
      return helper.error(res, 'Something went wrong fetching locations');
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /promo-codes
  // Paginated list with optional search & status filter.
  // Includes assigned users (promoUsers) for userType=1 codes.
  // ─────────────────────────────────────────────────────────────────
  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = (req.query.search || '').trim();
      const statusFilter = (req.query.status || '').trim();
      const targetType = (req.query.targetType || '').trim();

      const where = {};
      if (targetType && targetType !== 'all') {
        where.targetType = parseInt(targetType);
      }
      if (search) {
        where[Op.or] = [
          { code: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ];
      }

      const now = new Date();
      if (statusFilter === 'active') {
        where.status = 'active';
        // not expired
        where[Op.and] = [
          {
            [Op.or]: [
              { expiresAt: null },
              { expiresAt: { [Op.gt]: now } }
            ]
          }
        ];
      } else if (statusFilter === 'inactive') {
        where.status = 'inactive';
      } else if (statusFilter === 'expired') {
        where.expiresAt = { [Op.lt]: now };
      }

      const offset = (page - 1) * limit;

      const result = await promo_codes.findAndCountAll({
        where,
        include: [
          {
            model: promo_code_users,
            as: 'promoUsers',
            required: false,
            include: [
              {
                model: users,
                as: 'user',
                attributes: ['id', 'name', 'last_name', 'phone', 'countryCode', 'email', 'profileImage']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      const totalPages = Math.max(1, Math.ceil(result.count / limit));

      const list = result.rows.map(p => {
        const plain = p.toJSON();
        const isExpired = plain.expiresAt && new Date(plain.expiresAt) < now;
        plain.computedStatus = isExpired ? 'expired' : (plain.status || 'active');
        return plain;
      });

      return helper.success(res, 'Promo codes retrieved', { list, total: result.count, totalPages });
    } catch (error) {
      console.error('promoController.list:', error);
      return helper.error(res, 'Something went wrong retrieving promo codes');
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // POST /promo-codes
  // Creates a promo code.
  // • userType = 1 → specific users → insert rows in promo_code_users
  // • userType = 2 → all users      → no rows in promo_code_users
  // ─────────────────────────────────────────────────────────────────
  create: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const {
        code, name, description, discountType, discountValue,
        maxDiscountAmount, minOrderValue, maxUses, usagePerUser,
        couponFirstXRides, startDate, expiresAt, showInApp,
        userType, user_ids, location_ids, status, targetType
      } = req.body;

      // ── validations ──
      if (!code || !code.trim()) {
        await t.rollback();
        return helper.failed(res, 'Promo code is required');
      }
      if (!discountValue || isNaN(Number(discountValue))) {
        await t.rollback();
        return helper.failed(res, 'Valid discount value is required');
      }

      const existing = await promo_codes.findOne({
        where: { code: code.trim().toUpperCase() },
        transaction: t
      });
      if (existing) {
        await t.rollback();
        return helper.failed(res, 'Promo code already exists');
      }

      // ── image upload ──
      let imagePath = null;
      if (req.files && req.files.image) {
        const file = req.files.image;
        const ext = path.extname(file.name);
        const fname = `promo_${Date.now()}${ext}`;
        const dir = path.join(process.cwd(), 'public/images/promo');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        await file.mv(path.join(dir, fname));
        imagePath = `/images/promo/${fname}`;
      }

      // ── parse arrays ──
      let parsedUserIds = [];
      let parsedLocIds = [];
      try { parsedUserIds = user_ids ? (typeof user_ids === 'string' ? JSON.parse(user_ids) : user_ids) : []; } catch { }
      try { parsedLocIds = location_ids ? (typeof location_ids === 'string' ? JSON.parse(location_ids) : location_ids) : []; } catch { }

      // userType: if specific users selected → 1, else → 2
      const resolvedUserType = parsedUserIds.length > 0 ? 1 : parseInt(userType) || 2;

      // ── create promo_codes row ──
      const newPromo = await promo_codes.create({
        code: code.trim().toUpperCase(),
        name: name || null,
        description: description || null,
        image: imagePath,
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        usagePerUser: usagePerUser || 'Unlimited',
        couponFirstXRides: couponFirstXRides || 'Unlimited',
        startDate: startDate || null,
        expiresAt: expiresAt || null,
        showInApp: (showInApp === 'false' || showInApp === false) ? 0 : 1,
        status: status || 'active',
        targetType: (targetType === '2' || targetType === 2 || targetType === 'driver') ? 2 : 1,
        userType: resolvedUserType,
        location_ids: parsedLocIds
      }, { transaction: t });

      // ── insert promo_code_users rows (only when userType = 1) ──
      if (resolvedUserType === 1 && parsedUserIds.length > 0) {
        const rows = parsedUserIds.map(uid => ({
          promo_code_id: newPromo.id,
          user_id: uid
        }));
        await promo_code_users.bulkCreate(rows, { transaction: t });
      }

      await t.commit();

      // return fresh record with assigned users
      const created = await promo_codes.findByPk(newPromo.id, {
        include: [{
          model: promo_code_users,
          as: 'promoUsers',
          include: [{
            model: users,
            as: 'user',
            attributes: ['id', 'name', 'last_name', 'phone', 'countryCode', 'email']
          }]
        }]
      });

      return helper.success(res, 'Promo code created successfully', created);
    } catch (error) {
      await t.rollback();
      console.error('promoController.create:', error);
      return helper.error(res, 'Something went wrong creating promo code');
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // PUT /promo-codes/:id/toggle
  // ─────────────────────────────────────────────────────────────────
  toggle: async (req, res) => {
    try {
      const { id } = req.params;
      const promo = await promo_codes.findByPk(id);
      if (!promo) return helper.failed(res, 'Promo code not found', {}, 404);

      const newStatus = promo.status === 'active' ? 'inactive' : 'active';
      await promo.update({ status: newStatus });
      return helper.success(res, `Promo code ${newStatus}`);
    } catch (error) {
      console.error('promoController.toggle:', error);
      return helper.error(res, 'Something went wrong toggling promo status');
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // DELETE /promo-codes/:id
  // Also removes all promo_code_users rows for this promo
  // ─────────────────────────────────────────────────────────────────
  delete: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const promo = await promo_codes.findByPk(id, { transaction: t });
      if (!promo) {
        await t.rollback();
        return helper.failed(res, 'Promo code not found', {}, 404);
      }

      // remove junction rows first
      await promo_code_users.destroy({ where: { promo_code_id: id }, transaction: t });
      await promo.destroy({ transaction: t });

      await t.commit();
      return helper.success(res, 'Promo code deleted successfully');
    } catch (error) {
      await t.rollback();
      console.error('promoController.delete:', error);
      return helper.error(res, 'Something went wrong deleting promo code');
    }
  }
};
