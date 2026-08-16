const { geofences, geofence_cities, geofence_areas, geofence_pincodes } = require("../../models");
const helper = require('../../helpers/helper');
const { Op } = require('sequelize');

module.exports = {
  // Get all geofences/locations
  geofenceList: async (req, res) => {
    try {
      const search = req.query.search || '';
      let whereClause = {};
      
      if (search) {
        whereClause = {
          name: { [Op.like]: `%${search}%` }
        };
      }

      const list = await geofences.findAll({
        where: whereClause,
        include: [
          { model: geofence_cities, as: 'cities' },
          { model: geofence_areas, as: 'areas' },
          { model: geofence_pincodes, as: 'pincodes' }
        ],
        order: [['createdAt', 'DESC']]
      });

      return helper.success(res, "Geofences fetched successfully", {
        list,
        total: list.length
      });
    } catch (error) {
      console.error("Error in geofenceList:", error);
      return helper.error(res, "Something went wrong fetching geofences");
    }
  },

  // View specific geofence details
  viewGeofence: async (req, res) => {
    try {
      const { id } = req.params;
      const geofence = await geofences.findByPk(id, {
        include: [
          { model: geofence_cities, as: 'cities' },
          { model: geofence_areas, as: 'areas' },
          { model: geofence_pincodes, as: 'pincodes' }
        ]
      });

      if (!geofence) {
        return helper.failed(res, "Geofence not found", {}, 404);
      }

      return helper.success(res, "Geofence details retrieved successfully", geofence);
    } catch (error) {
      console.error("Error in viewGeofence:", error);
      return helper.error(res, "Something went wrong viewing geofence");
    }
  },

  // Create new geofence perimeter
  createGeofence: async (req, res) => {
    try {
      const { name, driver_app_usage_fee, is_active } = req.body;
      if (!name) {
        return helper.failed(res, "Name is required");
      }

      const geofence = await geofences.create({
        name,
        driver_app_usage_fee: driver_app_usage_fee || 0.00,
        is_active: is_active !== undefined ? is_active : 1
      });

      return helper.success(res, "Geofence created successfully", geofence);
    } catch (error) {
      console.error("Error in createGeofence:", error);
      return helper.error(res, "Something went wrong creating geofence");
    }
  },

  // Update existing geofence parameters
  updateGeofence: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, driver_app_usage_fee, is_active } = req.body;

      const geofence = await geofences.findByPk(id);
      if (!geofence) {
        return helper.failed(res, "Geofence not found", {}, 404);
      }

      await geofence.update({
        name: name !== undefined ? name : geofence.name,
        driver_app_usage_fee: driver_app_usage_fee !== undefined ? driver_app_usage_fee : geofence.driver_app_usage_fee,
        is_active: is_active !== undefined ? is_active : geofence.is_active
      });

      return helper.success(res, "Geofence updated successfully", geofence);
    } catch (error) {
      console.error("Error in updateGeofence:", error);
      return helper.error(res, "Something went wrong updating geofence");
    }
  },

  // Toggle/Update active status of a geofence
  toggleGeofenceStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const geofence = await geofences.findByPk(id);
      if (!geofence) {
        return helper.failed(res, "Geofence not found", {}, 404);
      }

      const newStatus = geofence.is_active === 1 ? 0 : 1;
      await geofence.update({ is_active: newStatus });

      return helper.success(res, `Geofence status updated to ${newStatus === 1 ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error("Error in toggleGeofenceStatus:", error);
      return helper.error(res, "Something went wrong updating status");
    }
  },

  // Remove/Delete a geofence boundary
  deleteGeofence: async (req, res) => {
    try {
      const { id } = req.params;
      const geofence = await geofences.findByPk(id);
      if (!geofence) {
        return helper.failed(res, "Geofence not found", {}, 404);
      }

      await geofence.destroy(); // Soft delete as model is paranoid
      return helper.success(res, "Geofence deleted successfully");
    } catch (error) {
      console.error("Error in deleteGeofence:", error);
      return helper.error(res, "Something went wrong deleting geofence");
    }
  },

  // ─── City Operations ───
  addCity: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, country, state, address, is_active, service_ids, subscription_ids } = req.body;

      if (!name) {
        return helper.failed(res, "City name is required");
      }

      const city = await geofence_cities.create({
        geofence_id: id,
        name,
        country,
        state,
        address,
        is_active: is_active !== undefined ? is_active : 1,
        service_ids: Array.isArray(service_ids) ? service_ids : [],
        subscription_ids: Array.isArray(subscription_ids) ? subscription_ids : []
      });

      return helper.success(res, "City added successfully", city);
    } catch (error) {
      console.error("Error in addCity:", error);
      return helper.error(res, "Something went wrong adding city");
    }
  },

  updateCity: async (req, res) => {
    try {
      const { cityId } = req.params;
      const { name, country, state, address, is_active, service_ids, subscription_ids } = req.body;

      const city = await geofence_cities.findByPk(cityId);
      if (!city) {
        return helper.failed(res, "City not found", {}, 404);
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (country !== undefined) updateData.country = country;
      if (state !== undefined) updateData.state = state;
      if (address !== undefined) updateData.address = address;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (service_ids !== undefined) updateData.service_ids = Array.isArray(service_ids) ? service_ids : [];
      if (subscription_ids !== undefined) updateData.subscription_ids = Array.isArray(subscription_ids) ? subscription_ids : [];

      await city.update(updateData);
      return helper.success(res, "City updated successfully", city);
    } catch (error) {
      console.error("Error in updateCity:", error);
      return helper.error(res, "Something went wrong updating city");
    }
  },

  deleteCity: async (req, res) => {
    try {
      const { cityId } = req.params;
      const city = await geofence_cities.findByPk(cityId);
      if (!city) {
        return helper.failed(res, "City not found", {}, 404);
      }
      await city.destroy();
      return helper.success(res, "City deleted successfully");
    } catch (error) {
      console.error("Error in deleteCity:", error);
      return helper.error(res, "Something went wrong deleting city");
    }
  },

  // ─── Area Operations ───
  addArea: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, coordinates, is_active } = req.body;

      if (!name || !coordinates) {
        return helper.failed(res, "Area name and coordinates are required");
      }

      const coordsStr = typeof coordinates === 'string' ? coordinates : JSON.stringify(coordinates);

      const area = await geofence_areas.create({
        geofence_id: id,
        name,
        coordinates: coordsStr,
        is_active: is_active !== undefined ? is_active : 1
      });

      return helper.success(res, "Area added successfully", area);
    } catch (error) {
      console.error("Error in addArea:", error);
      return helper.error(res, "Something went wrong adding area");
    }
  },

  deleteArea: async (req, res) => {
    try {
      const { areaId } = req.params;
      const area = await geofence_areas.findByPk(areaId);
      if (!area) {
        return helper.failed(res, "Area not found", {}, 404);
      }
      await area.destroy();
      return helper.success(res, "Area deleted successfully");
    } catch (error) {
      console.error("Error in deleteArea:", error);
      return helper.error(res, "Something went wrong deleting area");
    }
  },

  // ─── Pincode Operations ───
  addPincode: async (req, res) => {
    try {
      const { id } = req.params;
      const { pincode, city, state, country, is_active } = req.body;

      if (!pincode) {
        return helper.failed(res, "Pincode is required");
      }

      const pin = await geofence_pincodes.create({
        geofence_id: id,
        pincode,
        city,
        state,
        country,
        is_active: is_active !== undefined ? is_active : 1
      });

      return helper.success(res, "Pincode added successfully", pin);
    } catch (error) {
      console.error("Error in addPincode:", error);
      return helper.error(res, "Something went wrong adding pincode");
    }
  },

  deletePincode: async (req, res) => {
    try {
      const { pincodeId } = req.params;
      const pin = await geofence_pincodes.findByPk(pincodeId);
      if (!pin) {
        return helper.failed(res, "Pincode not found", {}, 404);
      }
      await pin.destroy();
      return helper.success(res, "Pincode deleted successfully");
    } catch (error) {
      console.error("Error in deletePincode:", error);
      return helper.error(res, "Something went wrong deleting pincode");
    }
  }
};
