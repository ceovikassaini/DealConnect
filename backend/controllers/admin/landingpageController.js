const { landingpage } = require("../../models");
const helper = require('../../helpers/helper');

module.exports = {
  // GET /admin/landingpage - Fetch landing page configurations (single row)
  getLandingPage: async (req, res) => {
    try {
      let pageData = await landingpage.findOne();
      if (!pageData) {
        // Seed default row if the table is empty
        pageData = await landingpage.create({
          main_titile: "Book a ride with Zero Commission",
          main_subtitile: "Simply the drivers for the people. 100% of the fare belongs to the drivers.",
          appstore_link: "https://apps.apple.com/",
          playstore_link: "https://play.google.com/",
          app_screen: "app_screen.png",
          offer_title_1: "Keep all your fares",
          offer_subtitle_1: "All the money you earn in the MyRyd driver app is straight in your pocket.",
          offer_title_2: "Fast approval rates",
          offer_subtitle_2: "Our approval process is easy and fast. Start driving within hours.",
          offer_title_3: "Always in safe hands",
          offer_subtitle_3: "Safety is our priority. We verify all riders and drivers before trip.",
          contact_no: "+61 411 222 333",
          contact_email: "support@myryd.com",
          contact_location: "123 Main Street, Sydney, NSW 2000",
          work_title_1: "Book",
          work_subtitle_1: "Choose route and book",
          work_title_2: "Ride",
          work_subtitle_2: "Start riding to your destination",
          work_title_3: "Pay Directly",
          work_subtitle_3: "100% of the fare goes to driver"
        });
      }
      
      return helper.success(res, "Landing page data retrieved successfully", pageData);
    } catch (error) {
      console.error("Error in getLandingPage:", error);
      return helper.error(res, "Something went wrong retrieving landing page data");
    }
  },

  // PUT /admin/landingpage - Update landing page configurations
  updateLandingPage: async (req, res) => {
    try {
      let pageData = await landingpage.findOne();
      if (!pageData) {
        pageData = await landingpage.create({
          main_titile: "",
          main_subtitile: "",
          appstore_link: "",
          playstore_link: "",
          app_screen: "",
          offer_title_1: "",
          offer_subtitle_1: "",
          offer_title_2: "",
          offer_subtitle_2: "",
          offer_title_3: "",
          offer_subtitle_3: "",
          contact_no: "",
          contact_email: "",
          contact_location: "",
          work_title_1: "",
          work_subtitle_1: "",
          work_title_2: "",
          work_subtitle_2: "",
          work_title_3: "",
          work_subtitle_3: ""
        });
      }

      const fields = [
        'main_titile',
        'main_subtitile',
        'appstore_link',
        'playstore_link',
        'app_screen',
        'offer_title_1',
        'offer_subtitle_1',
        'offer_title_2',
        'offer_subtitle_2',
        'offer_title_3',
        'offer_subtitle_3',
        'contact_no',
        'contact_email',
        'contact_location',
        'work_title_1',
        'work_subtitle_1',
        'work_title_2',
        'work_subtitle_2',
        'work_title_3',
        'work_subtitle_3'
      ];

      const updateData = {};
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      await pageData.update(updateData);
      
      return helper.success(res, "Landing page data updated successfully", pageData);
    } catch (error) {
      console.error("Error in updateLandingPage:", error);
      return helper.error(res, "Something went wrong updating landing page data");
    }
  }
};
