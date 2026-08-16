const { safety } = require("../../models");
const helper = require('../../helpers/helper');

module.exports = {
  // GET /admin/safety - Fetch landing page safety configurations (single row)
  getSafety: async (req, res) => {
    try {
      let data = await safety.findOne();
      if (!data) {
        // Seed default row if the table is empty
        data = await safety.create({
          title: "Safety at MyRyd",
          subtitle: "Every ride. Every person. Safe.",
          driver_intro: "Our drivers are checked before they drive.\nEvery MyRyd driver must complete all of these before their first trip:",
          driver_point_1_title: "Identity check",
          driver_point_1_desc: "— we confirm who they are and their right to work in Australia",
          driver_point_2_title: "Australian Driver Licence",
          driver_point_2_desc: "— verified, always current",
          driver_point_3_title: "National Police Check",
          driver_point_3_desc: "— every driver, no exceptions",
          driver_point_4_title: "Vehicle registration and insurance",
          driver_point_4_desc: "— checked, not taken on trust",
          driver_outro: "If any step isn't done, they can't drive. Simple as that.",
          rider_title: "For Riders",
          rider_point_1_title: "Share your trip.",
          rider_point_1_desc: "One tap sends your live location, driver, and car details to someone you trust — until you arrive.",
          rider_point_2_title: "Trusted drivers only.",
          rider_point_2_desc: "Drivers have hour limits. When they hit the limit, the app stops giving them trips.",
          rider_point_3_title: "Rate every ride.",
          rider_point_3_desc: "Bad behaviour gets reviewed. Repeat problems mean removal from MyRyd.",
          driver_section_title: "For Drivers",
          driver_section_point_1_title: "Safety check before every shift.",
          driver_section_point_1_desc: "No checklist done, no trips.",
          driver_section_point_2_title: "S.O.S. button.",
          driver_section_point_2_desc: "Help is one tap away, on every trip.",
          driver_section_point_3_title: "No pressure to overwork.",
          driver_section_point_3_desc: "No commission means no app pushing you to drive \"just one more hour.\"",
          driver_section_point_4_title: "Riders get rated too.",
          driver_section_point_4_desc: "Abusive riders can be removed from MyRyd.",
          driver_section_outro: "Safe rides aren't a promise. They're how MyRyd is built."
        });
      }
      
      return helper.success(res, "Safety data retrieved successfully", data);
    } catch (error) {
      console.error("Error in getSafety:", error);
      return helper.error(res, "Something went wrong retrieving safety data");
    }
  },

  // PUT /admin/safety - Update landing page safety configurations
  updateSafety: async (req, res) => {
    try {
      let data = await safety.findOne();
      if (!data) {
        data = await safety.create({
          title: "",
          subtitle: "",
          driver_intro: "",
          driver_point_1_title: "",
          driver_point_1_desc: "",
          driver_point_2_title: "",
          driver_point_2_desc: "",
          driver_point_3_title: "",
          driver_point_3_desc: "",
          driver_point_4_title: "",
          driver_point_4_desc: "",
          driver_outro: "",
          rider_title: "",
          rider_point_1_title: "",
          rider_point_1_desc: "",
          rider_point_2_title: "",
          rider_point_2_desc: "",
          rider_point_3_title: "",
          rider_point_3_desc: "",
          driver_section_title: "",
          driver_section_point_1_title: "",
          driver_section_point_1_desc: "",
          driver_section_point_2_title: "",
          driver_section_point_2_desc: "",
          driver_section_point_3_title: "",
          driver_section_point_3_desc: "",
          driver_section_point_4_title: "",
          driver_section_point_4_desc: "",
          driver_section_outro: ""
        });
      }

      const fields = [
        'title',
        'subtitle',
        'driver_intro',
        'driver_point_1_title',
        'driver_point_1_desc',
        'driver_point_2_title',
        'driver_point_2_desc',
        'driver_point_3_title',
        'driver_point_3_desc',
        'driver_point_4_title',
        'driver_point_4_desc',
        'driver_outro',
        'rider_title',
        'rider_point_1_title',
        'rider_point_1_desc',
        'rider_point_2_title',
        'rider_point_2_desc',
        'rider_point_3_title',
        'rider_point_3_desc',
        'driver_section_title',
        'driver_section_point_1_title',
        'driver_section_point_1_desc',
        'driver_section_point_2_title',
        'driver_section_point_2_desc',
        'driver_section_point_3_title',
        'driver_section_point_3_desc',
        'driver_section_point_4_title',
        'driver_section_point_4_desc',
        'driver_section_outro'
      ];

      const updateData = {};
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      await data.update(updateData);
      
      return helper.success(res, "Safety data updated successfully", data);
    } catch (error) {
      console.error("Error in updateSafety:", error);
      return helper.error(res, "Something went wrong updating safety data");
    }
  }
};
