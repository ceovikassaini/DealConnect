const { settingconfigration } = require("../../models");
const helper = require('../../helpers/helper');

module.exports = {
  // GET /admin/settings-config - Fetch configurations
  getSettings: async (req, res) => {
    try {
      let data = await settingconfigration.findOne();
      if (!data) {
        // Seed default row if the table is empty
        data = await settingconfigration.create({
          min_ride_distance: 1.00,
          max_ride_distance: 10000.00,
          auto_ride_cancel_time: 10,
          driver_wait_time: 10,
          driver_search_range: "1,5,10",
          min_distance_arrived: 100,
          driver_penalty_wait_time: 10,
          firebase_server_key: "",
          firebase_project_id: "",
          firebase_client_email: "",
          firebase_private_key: "",
          msg91_auth_key: "",
          msg91_sender_id: "",
          msg91_template_id: "",
          google_map_client_id: "",
          google_map_key: "",
          stripe_secret_key: "",
          stripe_publish_key: "",
          stripe_mode: "sandbox",
          wallet_status: 1,
          min_wallet_recharge: 10.00,
          max_wallet_recharge: 100.00,
          stable_android_user_version: "1.0.1",
          deprecated_android_user_version: "1.0.0",
          stable_android_driver_version: "1.0.1",
          deprecated_android_driver_version: "1.0.0",
          stable_ios_user_version: "1.0.1",
          deprecated_ios_user_version: "1.0.0",
          stable_ios_driver_version: "1.0.1",
          deprecated_ios_driver_version: "1.0.0",
          gst_tax: 10.00,
          admin_commission: 15.00,
          booking_fee: 1.50,
          waiting_fee_per_min: 0.50,
          app_name: "MyRyd",
          support_email: "support@myryd.com",
          support_phone: "+61400000000",
          currency_symbol: "$",
          currency_code: "AUD"
        });
      }
      
      return helper.success(res, "Settings configuration retrieved successfully", data);
    } catch (error) {
      console.error("Error in getSettings:", error);
      return helper.error(res, "Something went wrong retrieving settings configurations");
    }
  },

  // PUT /admin/settings-config - Update configurations
  updateSettings: async (req, res) => {
    try {
      let data = await settingconfigration.findOne();
      if (!data) {
        data = await settingconfigration.create({});
      }

      const fields = [
        'min_ride_distance',
        'max_ride_distance',
        'auto_ride_cancel_time',
        'driver_wait_time',
        'driver_search_range',
        'min_distance_arrived',
        'driver_penalty_wait_time',
        'firebase_server_key',
        'firebase_project_id',
        'firebase_client_email',
        'firebase_private_key',
        'msg91_auth_key',
        'msg91_sender_id',
        'msg91_template_id',
        'google_map_client_id',
        'google_map_key',
        'stripe_secret_key',
        'stripe_publish_key',
        'stripe_mode',
        'wallet_status',
        'min_wallet_recharge',
        'max_wallet_recharge',
        'stable_android_user_version',
        'deprecated_android_user_version',
        'stable_android_driver_version',
        'deprecated_android_driver_version',
        'stable_ios_user_version',
        'deprecated_ios_user_version',
        'stable_ios_driver_version',
        'deprecated_ios_driver_version',
        'gst_tax',
        'admin_commission',
        'booking_fee',
        'waiting_fee_per_min',
        'app_name',
        'support_email',
        'support_phone',
        'currency_symbol',
        'currency_code'
      ];

      const updateData = {};
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      await data.update(updateData);
      
      return helper.success(res, "Settings configuration updated successfully", data);
    } catch (error) {
      console.error("Error in updateSettings:", error);
      return helper.error(res, "Something went wrong updating settings configurations");
    }
  }
};
