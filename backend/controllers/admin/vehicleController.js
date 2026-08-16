const { vehicle_services } = require("../../models");
const helper = require('../../helpers/helper');
const { logActivity } = require("../../helpers/loggerHelper");

module.exports = {
  // Services API
  listServices: async (req, res) => {
    try {
      const list = await vehicle_services.findAll({
        order: [['createdAt', 'ASC']]
      });
      return helper.success(res, "Services list retrieved successfully", list);
    } catch (error) {
      console.error("Error in listServices:", error);
      return helper.error(res, "Something went wrong retrieving services list");
    }
  },

  createService: async (req, res) => {
    try {
      const { name, base_charge } = req.body;
      if (!name || name.trim() === "") {
        return helper.failed(res, "Service name cannot be empty");
      }
      const newService = await vehicle_services.create({
        name: name.trim(),
        base_charge: base_charge !== undefined ? parseFloat(base_charge) || 0.00 : 0.00
      });

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      await logActivity(req, 'Vehicle Settings', `${clientType} Added Vehicle Service: ${newService.name}`, newService);

      return helper.success(res, "Service added successfully", newService);
    } catch (error) {
      console.error("Error in createService:", error);
      return helper.error(res, "Something went wrong adding service");
    }
  },

  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, base_charge } = req.body;
      const service = await vehicle_services.findByPk(id);
      if (!service) {
        return helper.failed(res, "Service not found", {}, 404);
      }
      const updateData = {};
      if (name !== undefined) {
        if (!name.trim()) {
          return helper.failed(res, "Service name cannot be empty");
        }
        updateData.name = name.trim();
      }
      if (base_charge !== undefined) {
        updateData.base_charge = parseFloat(base_charge) || 0.00;
      }
      await service.update(updateData);

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      await logActivity(req, 'Vehicle Settings', `${clientType} Updated Vehicle Settings: ${service.id}`, service);

      return helper.success(res, "Service updated successfully", service);
    } catch (error) {
      console.error("Error in updateService:", error);
      return helper.error(res, "Something went wrong updating service");
    }
  },

  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await vehicle_services.findByPk(id);
      if (!service) {
        return helper.failed(res, "Service not found", {}, 404);
      }
      const name = service.name;
      await service.destroy();

      const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
      await logActivity(req, 'Vehicle Settings', `${clientType} Deleted Vehicle Service: ${name}`, { id, name });

      return helper.success(res, "Service deleted successfully");
    } catch (error) {
      console.error("Error in deleteService:", error);
      return helper.error(res, "Something went wrong deleting service");
    }
  }
};
