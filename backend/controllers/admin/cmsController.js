const { cms } = require("../../models");
const helper = require('../../helpers/helper');

// 1 => terms&condition, 2 => privacypolicy, 3 => aboutus
const VALID_TYPES = [1, 2, 3];

module.exports = {



    // GET /getCms/:type  → type = 1 | 2 | 3
    getCms: async (req, res) => {
        try {
            const type = parseInt(req.params.type);

            if (!VALID_TYPES.includes(type)) {
                return res.status(400).json({ message: "Invalid type. Use 1 (terms&condition), 2 (privacypolicy), 3 (aboutus)" });
            }

            const data = await cms.findOne({ where: { type } });
            if (!data) {
                return res.status(404).json({ message: "CMS data not found" });
            }

            return helper.success(res, "CMS retrieved successfully", data);
        } catch (error) {
            console.log(error);
            return helper.failed(res, "Something went wrong");
        }
    },

    // GET /getCms  → returns all 3 pages
    getAllCms: async (req, res) => {
        try {
            const data = await cms.findAll();
            return helper.success(res, "All CMS data retrieved successfully", data);
        } catch (error) {
            console.log(error);
            return helper.failed(res, "Something went wrong");
        }
    },

    // PUT /updateCms/:type  → type in URL, content in body
    updateCms: async (req, res) => {
        try {
            const type = parseInt(req.params.type);  // ← from URL, never undefined
            const { content } = req.body;

            console.log("updateCms called | type:", type, "| body:", req.body);

            if (isNaN(type) || !VALID_TYPES.includes(type)) {
                return res.status(400).json({ message: "Invalid type. Use 1 (terms&condition), 2 (privacypolicy), 3 (aboutus)" });
            }

            if (!content || content.trim() === "") {
                return res.status(400).json({ message: "Content cannot be empty" });
            }

            const cmsContent = await cms.findOne({ where: { type } });
            if (!cmsContent) {
                return res.status(404).json({ message: "CMS data not found" });
            }

            await cms.update({ content: content.trim() }, { where: { type } });

            return helper.success(res, "CMS updated successfully");
        } catch (error) {
            console.log(error);
            return helper.failed(res, "Something went wrong");
        }
    },

};