var express = require('express');
var router = express.Router();
const authenticateHeader = require('../middleware/authMiddleware').authenticateHeader;
const authenticateJWT = require('../middleware/authMiddleware').authenticateJWT;

const authController = require('../controllers/apis/authController');
const requirementcontroller = require('../controllers/apis/requirementcontroller');
const propertycontroller = require('../controllers/apis/propertycontroller');

module.exports = (io) => {

  // ─── Public Routes ───
  router.get('/encryption', authController.encryption);
  router.post('/fileUpload', authController.fileUpload);
  router.post('/upload', propertycontroller.uploadImage);
  router.get('/get_cms', authController.get_cms);
  router.get('/resetPasswordPage', authController.resetPasswordPage);
  router.post('/resetPassword', authController.resetPassword);

  // ─── Public Auth & Requirement Routes ───
  router.post('/signUp', authController.signUp);
  router.post('/register', authController.signUp);
  router.post('/login', authController.login);
  router.post('/forgotPassword', authController.forgotPassword);
  router.post('/edit_profile', authController.edit_profile);
  router.post('/change_password', authController.change_password);

  // Categories & Requirements
  router.get('/categories', requirementcontroller.getCategories);
  router.get('/subcategories', requirementcontroller.getSubCategories);
  router.post('/add_requirement', requirementcontroller.addRequirement);
  router.post('/requirements', requirementcontroller.addRequirement);
  router.get('/get_requirements', requirementcontroller.getRequirements);
  router.get('/requirements', requirementcontroller.getRequirements);
  router.post('/edit_requirement', requirementcontroller.editRequirement);
  router.put('/edit_requirement', requirementcontroller.editRequirement);
  router.delete('/delete_requirement/:id', requirementcontroller.deleteRequirement);
  router.post('/delete_requirement', requirementcontroller.deleteRequirement);

  // Properties Routes
  router.get('/properties', propertycontroller.getProperties);
  router.get('/get_properties', propertycontroller.getProperties);
  router.get('/properties/:id', propertycontroller.getPropertyById);
  router.post('/add_property', propertycontroller.addProperty);
  router.post('/properties', propertycontroller.addProperty);
  router.delete('/delete_property/:id', propertycontroller.deleteProperty);
  router.delete('/properties/:id', propertycontroller.deleteProperty);
  router.post('/delete_property', propertycontroller.deleteProperty);

  // ─── Header Auth ───
  router.use(authenticateHeader);
  router.post('/socialLogin', authController.socialLogin);

  // ─── JWT Auth ───
  router.use(authenticateJWT);

  // Auth
  router.post('/logout', authController.logout);
  router.put('/notification_off_on', authController.notification_off_on);
  router.put('/location_update', authController.location_update);





  return router;
};
