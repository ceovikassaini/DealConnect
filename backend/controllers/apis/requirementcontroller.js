const helper = require("../../helpers/helper");
const { requirements, categories, sub_categories, users } = require("../../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;

module.exports = {
  // Get Categories list
  getCategories: async (req, res) => {
    try {
      const list = await categories.findAll({
        where: { status: 1 },
        order: [["name", "ASC"]]
      });
      return res.status(200).json({
        success: true,
        code: 200,
        message: "Categories fetched successfully",
        body: list,
        categories: list,
        data: list
      });
    } catch (err) {
      console.error(err);
      return helper.error(res, err.message || err);
    }
  },

  // Get Subcategories list by category_id
  getSubCategories: async (req, res) => {
    try {
      const { category_id } = req.query;
      const whereCond = { status: 1 };
      if (category_id) {
        whereCond.category_id = category_id;
      }
      const list = await sub_categories.findAll({
        where: whereCond,
        order: [["name", "ASC"]]
      });
      return res.status(200).json({
        success: true,
        code: 200,
        message: "Subcategories fetched successfully",
        body: list,
        subcategories: list,
        data: list
      });
    } catch (err) {
      console.error(err);
      return helper.error(res, err.message || err);
    }
  },

  // Add Requirement Post
  addRequirement: async (req, res) => {
    try {
      const {
        userId,
        dealerId,
        user_id,
        dealer_id,
        category_id,
        subcategory_id,
        title,
        location,
        budget,
        minBudget = 0,
        maxBudget = 0,
        propertyType = "Flat",
        reqType = "Buy",
        description = "",
        role
      } = req.body;

      if (!title || !location || !budget) {
        return helper.failed(res, "Title, location, and budget are required.");
      }

      // Determine whether poster is a dealer or a user
      const rawRole = (role || req.auth?.role || "").toString().toLowerCase();
      const isDealer = rawRole === "dealer" || rawRole === "2" || Boolean(dealer_id && Number(dealer_id) > 0) || Boolean(dealerId && Number(dealerId) > 0);

      let final_user_id = 0;
      let final_dealer_id = 0;

      if (isDealer) {
        // Dealer adding requirement -> save dealer_id, user_id is 0
        final_dealer_id = Number(dealer_id || dealerId || userId || user_id || req.auth?.id) || 0;
        final_user_id = 0;
      } else {
        // User adding requirement -> save user_id, dealer_id is 0
        final_user_id = Number(user_id || userId || req.auth?.id) || 0;
        final_dealer_id = 0;
      }

      const postedByRole = isDealer ? "dealer" : "user";

      const newReq = await requirements.create({
        user_id: final_user_id,
        dealer_id: final_dealer_id,
        category_id: category_id ? Number(category_id) : null,
        subcategory_id: subcategory_id ? Number(subcategory_id) : null,
        title,
        location,
        budget,
        minBudget: Number(minBudget) || 0,
        maxBudget: Number(maxBudget) || 0,
        propertyType: propertyType || "Flat",
        reqType: reqType || "Buy",
        postedByRole,
        status: "Active",
        description: description || ""
      });

      return helper.success(res, "Requirement posted successfully", newReq);
    } catch (err) {
      console.error("Add requirement error:", err);
      return helper.error(res, err.message || err);
    }
  },

  // Get Requirements List
  getRequirements: async (req, res) => {
    try {
      const { userId, role } = req.query;
      const whereCond = {};

      if (userId) {
        whereCond[Op.or] = [{ dealer_id: userId }, { user_id: userId }];
      }

      const list = await requirements.findAll({
        where: whereCond,
        include: [
          { model: categories, as: "category", attributes: ["id", "name"], required: false },
          { model: sub_categories, as: "subcategory", attributes: ["id", "name"], required: false },
          { model: users, as: "dealer", attributes: ["id", "name", "email", "mobile_no"], required: false },
          { model: users, as: "user", attributes: ["id", "name", "email", "mobile_no"], required: false }
        ],
        order: [["createdAt", "DESC"]]
      });

      return helper.success(res, "Requirements retrieved successfully", list);
    } catch (err) {
      console.error(err);
      return helper.error(res, err.message || err);
    }
  },

  // Delete Requirement
  deleteRequirement: async (req, res) => {
    try {
      const id = req.params.id || req.body.id;
      if (!id) return helper.failed(res, "Requirement ID is required.");

      await requirements.destroy({
        where: { id }
      });

      return helper.success(res, "Requirement deleted successfully");
    } catch (err) {
      console.error(err);
      return helper.error(res, err.message || err);
    }
  },

  // Edit / Update Requirement
  editRequirement: async (req, res) => {
    try {
      const {
        id,
        category_id,
        subcategory_id,
        title,
        location,
        budget,
        minBudget,
        maxBudget,
        propertyType,
        reqType,
        description
      } = req.body;

      if (!id) {
        return helper.failed(res, "Requirement ID is required.");
      }

      const reqItem = await requirements.findOne({ where: { id } });
      if (!reqItem) {
        return helper.failed(res, "Requirement not found.");
      }

      const updateData = {};
      if (category_id !== undefined) updateData.category_id = category_id ? Number(category_id) : null;
      if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id ? Number(subcategory_id) : null;
      if (title !== undefined) updateData.title = title;
      if (location !== undefined) updateData.location = location;
      if (budget !== undefined) updateData.budget = budget;
      if (minBudget !== undefined) updateData.minBudget = Number(minBudget) || 0;
      if (maxBudget !== undefined) updateData.maxBudget = Number(maxBudget) || 0;
      if (propertyType !== undefined) updateData.propertyType = propertyType;
      if (reqType !== undefined) updateData.reqType = reqType;
      if (description !== undefined) updateData.description = description;

      await requirements.update(updateData, { where: { id } });

      const updated = await requirements.findOne({ where: { id } });
      return helper.success(res, "Requirement updated successfully", updated);
    } catch (err) {
      console.error("Edit requirement error:", err);
      return helper.error(res, err.message || err);
    }
  }
};
