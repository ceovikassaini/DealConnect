const helper = require("../../helpers/helper");
const db = require("../../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const path = require("path");
const fs = require("fs");

// Helper to parse price into numeric value
function parseNumericPrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/,/g, "").trim();
  const lakhMatch = cleaned.match(/([\d.]+)\s*lakh/i);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);
  const crMatch = cleaned.match(/([\d.]+)\s*cr/i);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  const numOnly = cleaned.replace(/[^\d.]/g, "");
  return Math.round(parseFloat(numOnly)) || 0;
}

module.exports = {
  // GET /api/properties or GET /api/properties?category_id=1&subcategory_id=2
  getProperties: async (req, res) => {
    try {
      const { dealerId, userId, location, propertyType, category_id, subcategory_id, search } = req.query;
      const whereCond = {};

      const activeDealerId = dealerId || userId;
      if (activeDealerId) {
        whereCond[Op.or] = [
          { user_id: activeDealerId },
          { dealer_id: activeDealerId }
        ];
      }

      if (category_id && category_id !== "all" && category_id !== "0" && category_id !== "All Categories") {
        whereCond.category_id = category_id;
      }

      if (subcategory_id && subcategory_id !== "all" && subcategory_id !== "0" && subcategory_id !== "All Subcategories") {
        whereCond.subcategory_id = subcategory_id;
      }

      if (propertyType && propertyType !== "All Types") {
        whereCond.propertyType = propertyType;
      }

      if (location) {
        whereCond.location = { [Op.like]: `%${location}%` };
      }

      if (search) {
        whereCond[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
          { propertyType: { [Op.like]: `%${search}%` } }
        ];
      }

      const includeArr = [];
      if (db.property_images) {
        includeArr.push({ model: db.property_images, as: "property_images", required: false });
      }
      if (db.dealer_requirements) {
        includeArr.push({ model: db.dealer_requirements, as: "dealer_requirement", required: false });
      }

      const list = await db.property.findAll({
        where: whereCond,
        order: [["id", "DESC"]],
        include: includeArr
      });

      const formatted = list.map(item => {
        const p = item.toJSON ? item.toJSON() : item;
        let imgArr = [];

        if (p.property_images && Array.isArray(p.property_images) && p.property_images.length > 0) {
          imgArr = p.property_images.map(imgObj => imgObj.images || imgObj);
        }

        if (imgArr.length === 0) {
          imgArr = ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"];
        }

        return {
          ...p,
          title: p.name || p.title || "Property Listing",
          dealerId: p.dealer_id || p.user_id,
          images: imgArr
        };
      });

      return res.status(200).json({
        success: true,
        properties: formatted,
        body: formatted
      });
    } catch (err) {
      console.error("Get properties error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch properties"
      });
    }
  },

  // GET /api/properties/:id
  getPropertyById: async (req, res) => {
    try {
      const { id } = req.params;

      const includeArr = [];
      if (db.property_images) {
        includeArr.push({ model: db.property_images, as: "property_images", required: false });
      }
      if (db.dealer_requirements) {
        includeArr.push({ model: db.dealer_requirements, as: "dealer_requirement", required: false });
      }

      const item = await db.property.findByPk(id, { include: includeArr });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const p = item.toJSON ? item.toJSON() : item;
      let imgArr = [];
      if (p.property_images && Array.isArray(p.property_images) && p.property_images.length > 0) {
        imgArr = p.property_images.map(imgObj => imgObj.images || imgObj);
      }
      if (imgArr.length === 0) {
        imgArr = ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"];
      }

      const formatted = {
        ...p,
        title: p.name || p.title || "Property Listing",
        dealerId: p.dealer_id || p.user_id,
        images: imgArr
      };

      return res.status(200).json({
        success: true,
        property: formatted,
        body: formatted
      });
    } catch (err) {
      console.error("Get property by ID error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch property details"
      });
    }
  },

  // POST /api/properties (Inserts into property table + property_images table + dealer_requirements table)
  addProperty: async (req, res) => {
    try {
      const {
        title,
        name,
        category_id = 1,
        subcategory_id = 1,
        propertyType = "Plot",
        price,
        location,
        area = "100 Sq. Yd.",
        height = 60,
        width = 15,
        facing = "Road Facing",
        description = "",
        images = [],
        dealerId,
        user_id,
        dealerName,
        dealerRequirement
      } = req.body;

      const propTitle = title || name;

      if (!propTitle || !price || !location) {
        return res.status(400).json({
          success: false,
          message: "Title, price, and location are required."
        });
      }

      const activeDealerId = dealerId || user_id || req.auth?.id || 1;
      const numericPrice = parseNumericPrice(price);

      // STEP 1: Create record in 'property' table
      const newProperty = await db.property.create({
        category_id: Number(category_id) || 1,
        subcategory_id: Number(subcategory_id) || 1,
        user_id: activeDealerId ? Number(activeDealerId) : 1,
        dealer_id: activeDealerId ? Number(activeDealerId) : 1,
        name: propTitle,
        height: Number(height) || 60,
        width: Number(width) || 15,
        status: 1,
        price: numericPrice || 3850000,
        location,
        area: String(area),
        facing: facing || "Road Facing",
        description: description || "",
        dealerName: dealerName || "Sharma Associates",
        propertyType: propertyType || "Plot",
        society: req.body.society || null,
        flat_no: req.body.flat_no || null,
        other_details: req.body.other_details || null
      });

      console.log("✅ Step 1: Created record in 'property' table with ID:", newProperty.id);

      // Save property images into property_images table
      let imgList = [];
      if (Array.isArray(images) && images.length > 0) {
        imgList = images;
      } else if (typeof images === "string" && images.length > 0) {
        try {
          imgList = images.startsWith("[") ? JSON.parse(images) : [images];
        } catch (e) {
          imgList = [images];
        }
      } else {
        imgList = ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"];
      }

      if (db.property_images) {
        for (const imgUrl of imgList) {
          await db.property_images.create({
            property_id: newProperty.id,
            images: imgUrl
          });
        }
      }

      // STEP 2: Create record in 'dealer_requirements' table linked by property_id
      const reqObj = dealerRequirement || req.body.dealerRequirement;
      let newDealerReq = null;

      if (db.dealer_requirements) {
        const reqData = reqObj || {};
        newDealerReq = await db.dealer_requirements.create({
          property_id: newProperty.id,
          dealer_id: activeDealerId ? Number(activeDealerId) : null,
          commission_percent: parseFloat(reqData.commission_percent) || 2.0,
          possession_time: reqData.possession_time || "Immediate",
          preferred_buyer: reqData.preferred_buyer || "Any Buyer",
          dealer_notes: reqData.dealer_notes || "",
          status: "Active"
        });
        console.log("✅ Step 2: Created record in 'dealer_requirements' table with ID:", newDealerReq.id, "linked to property_id:", newProperty.id);
      }

      const responsePayload = {
        ...newProperty.toJSON(),
        title: propTitle,
        dealerId: activeDealerId,
        images: imgList,
        dealer_requirement: newDealerReq ? newDealerReq.toJSON() : null
      };

      return res.status(200).json({
        success: true,
        message: "Property created successfully in database",
        property: responsePayload,
        body: responsePayload
      });
    } catch (err) {
      console.error("Add property DB error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to add property to database"
      });
    }
  },

  // DELETE /api/properties/:id
  deleteProperty: async (req, res) => {
    try {
      const { id } = req.params;
      const targetId = id || req.body.id;

      if (!targetId) {
        return res.status(400).json({ success: false, message: "Property ID required" });
      }

      if (db.dealer_requirements) await db.dealer_requirements.destroy({ where: { property_id: targetId } });
      if (db.property_images) await db.property_images.destroy({ where: { property_id: targetId } });
      if (db.property) await db.property.destroy({ where: { id: targetId } });

      return res.status(200).json({
        success: true,
        message: "Property deleted from database successfully"
      });
    } catch (err) {
      console.error("Delete property error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to delete property"
      });
    }
  },

  // POST /api/upload (Image file upload)
  uploadImage: async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: "No image files uploaded" });
      }

      const uploadsDir = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      let filesToUpload = req.files.images || req.files.file || req.files.image;
      if (!Array.isArray(filesToUpload)) {
        filesToUpload = [filesToUpload];
      }

      const uploadedUrls = [];
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:5000";

      for (const file of filesToUpload) {
        const ext = path.extname(file.name) || ".jpg";
        const filename = `prop_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
        const savePath = path.join(uploadsDir, filename);

        await file.mv(savePath);
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;
        uploadedUrls.push(fileUrl);
      }

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        urls: uploadedUrls,
        url: uploadedUrls[0]
      });
    } catch (err) {
      console.error("File upload error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to upload image files"
      });
    }
  }
};
