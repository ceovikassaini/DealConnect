var express = require('express');
var router = express.Router();
const authenticateAdminJWT = require('../middleware/authMiddleware').authenticateAdminJWT;

const authController = require('../controllers/admin/authController');
const jobController = require('../controllers/admin/jobController');
const cmsController = require('../controllers/admin/cmsController');
const contactUsController = require('../controllers/admin/contactUsController');
const dashboardController = require('../controllers/admin/dashboardController');
const userController = require('../controllers/admin/userController');
const paymentController = require('../controllers/admin/paymentController');
const notificationController = require('../controllers/admin/notificationController');
const subscriptionController = require('../controllers/admin/subscriptionController');
const geofencesController = require('../controllers/admin/geofencesController');
const faqController = require('../controllers/admin/faqController');
const landingpageController = require('../controllers/admin/landingpageController');
const saftyController = require('../controllers/admin/saftycontroller');
const settingconfigController = require('../controllers/admin/settingconfigration');
const promoController = require('../controllers/admin/promoController');
const vehicleController = require('../controllers/admin/vehicleController');
const subadminController = require('../controllers/admin/subadmincontroller');

// ─── Public Admin Routes ───
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

// ─── Protected Admin Routes ───
router.use(authenticateAdminJWT);

// Profile
router.get('/adminProfile/:id', authController.adminProfile);
router.put('/updateProfile', authController.updateProfile);
router.put('/updatePassword', authController.updatePassword);

// Dashboard
router.get('/dashboard_data', dashboardController.dashboard_data);
router.get('/getMonthlyUserStats', dashboardController.getMonthlyUserStats);
// // User Management
router.get('/userList', userController.userList);
router.get('/userList2', userController.userList2);
router.get('/userListDeleted', userController.userListDeleted);
router.get('/viewUser/:id/:role', userController.viewUser);
router.put('/toggleUserStatus/:id', userController.toggleUserStatus);
router.delete('/deleteUser/:id', userController.deleteUser);
router.put('/restoreUser/:id', userController.restoreUser);
router.put('/approveDriver/:id', userController.approveDriver);
router.put('/approveVehicle/:id/:vehicleId', userController.approveVehicle);
router.put('/approveInsurance/:id', userController.approveInsurance);
router.put('/approveLicense/:id', userController.approveLicense);
router.put('/approveNSW/:id', userController.approveNSW);
router.put('/approveTaxRTO/:id', userController.approveTaxRTO);
router.put('/approveIdentityVerification/:id', userController.approveIdentityVerification);

// CMS  (type: 1=terms&condition, 2=privacypolicy, 3=aboutus)
router.get('/getCms', cmsController.getAllCms);
router.get('/getCms/:type', cmsController.getCms);
router.put('/updateCms/:type', cmsController.updateCms);
// // Contact Support
router.get('/contactUsList', contactUsController.contactUs_list);
router.get('/contactUs/:id', contactUsController.view_contactUs);
router.put('/contactUs/:id', contactUsController.update_contactUs);
router.delete('/deleteContactUs/:id', contactUsController.delete_contactUs);

// Payment Management
router.get('/payments', paymentController.paymentList);
router.get('/payments/stats', paymentController.paymentStats);
router.get('/payments/:id', paymentController.paymentDetail);

// Jobs (replacing bookings)
router.get('/jobs', jobController.jobList);
router.get('/jobs/:jobId/offers', jobController.jobOffers);
router.get('/jobs/:id', jobController.viewJob);
router.put('/jobs/:id/status', jobController.toggleJobStatus);

// Subscriptions
router.get('/subscriptions', subscriptionController.subscriptionList);
router.put('/subscriptions/:id', subscriptionController.updateSubscription);

// Notifications
router.post('/notifications/bulk', notificationController.sendBulkNotification);
router.get('/notifications', notificationController.notificationList);

// Geofence Management
router.get('/geofences', geofencesController.geofenceList);
router.get('/geofences/:id', geofencesController.viewGeofence);
router.post('/geofences', geofencesController.createGeofence);
router.put('/geofences/:id', geofencesController.updateGeofence);
router.put('/geofences/status/:id', geofencesController.toggleGeofenceStatus);
router.delete('/geofences/:id', geofencesController.deleteGeofence);

// Geofence Sub-entities (Cities, Areas, Pincodes)
router.post('/geofences/:id/cities', geofencesController.addCity);
router.put('/geofences/cities/:cityId', geofencesController.updateCity);
router.delete('/geofences/cities/:cityId', geofencesController.deleteCity);
router.post('/geofences/:id/areas', geofencesController.addArea);
router.delete('/geofences/areas/:areaId', geofencesController.deleteArea);
router.post('/geofences/:id/pincodes', geofencesController.addPincode);
router.delete('/geofences/pincodes/:pincodeId', geofencesController.deletePincode);

// FAQ Management
router.get('/faqs', faqController.faqList);
router.post('/faqs', faqController.createFaq);
router.put('/faqs/:id', faqController.updateFaq);
router.put('/faqs/status/:id', faqController.toggleFaqStatus);
router.delete('/faqs/:id', faqController.deleteFaq);

// Landing Page Management
router.get('/landingpage', landingpageController.getLandingPage);
router.put('/landingpage', landingpageController.updateLandingPage);

// Safety Management
router.get('/safety', saftyController.getSafety);
router.put('/safety', saftyController.updateSafety);

// Settings Configuration
router.get('/settings-config', settingconfigController.getSettings);
router.put('/settings-config', settingconfigController.updateSettings);

// Promo Codes
router.get('/promo-codes/users-list', promoController.usersList);
router.get('/promo-codes/locations-list', promoController.locationsList);
router.get('/promo-codes', promoController.list);
router.post('/promo-codes', promoController.create);
router.put('/promo-codes/:id/toggle', promoController.toggle);
router.delete('/promo-codes/:id', promoController.delete);

// Vehicle Settings Configuration
router.get('/vehicles/services', vehicleController.listServices);
router.post('/vehicles/services', vehicleController.createService);
router.put('/vehicles/services/:id', vehicleController.updateService);
router.delete('/vehicles/services/:id', vehicleController.deleteService);

// Sub Admin & Logs Management
router.get('/subadmins', subadminController.listSubAdmins);
router.post('/subadmins', subadminController.createSubAdmin);
router.put('/subadmins/:id', subadminController.updateSubAdmin);
router.delete('/subadmins/:id', subadminController.deleteSubAdmin);
router.get('/logs', subadminController.getLogs);

module.exports = router;
