module.exports = (db) => {
  if (db._associationsLoaded) return;
  db._associationsLoaded = true;

  const { users, property, property_images, properties, dealer_requirements, requirements, categories, sub_categories, deals, dealer_subscriptions, users_vehicle, users_license, vehicle_images, payments, notifications, jobs, users_identity_verification, users_nsw, users_vehicle_insurance, tax_rto, geofences, geofence_cities, geofence_areas, geofence_pincodes, ratings, promo_codes, promo_code_users, vehicle_services, users_sos, activity_logs } = db;

  if (requirements && categories) {
    requirements.belongsTo(categories, { foreignKey: 'category_id', as: 'category' });
  }
  if (requirements && sub_categories) {
    requirements.belongsTo(sub_categories, { foreignKey: 'subcategory_id', as: 'subcategory' });
  }
  if (requirements && users) {
    requirements.belongsTo(users, { foreignKey: 'dealer_id', as: 'dealer' });
    requirements.belongsTo(users, { foreignKey: 'user_id', as: 'user' });
  }

  if (property && property_images) {
    property.hasMany(property_images, { foreignKey: 'property_id', as: 'property_images' });
    property_images.belongsTo(property, { foreignKey: 'property_id', as: 'property' });
  }

  if (property && categories) {
    property.belongsTo(categories, { foreignKey: 'category_id', as: 'category' });
  }
  if (property && sub_categories) {
    property.belongsTo(sub_categories, { foreignKey: 'subcategory_id', as: 'subcategory' });
  }

  if (property && dealer_requirements) {
    property.hasOne(dealer_requirements, { foreignKey: 'property_id', as: 'dealer_requirement', onDelete: 'CASCADE' });
  }

  if (users && property) {
    users.hasMany(property, { foreignKey: 'user_id', as: 'user_properties' });
    property.belongsTo(users, { foreignKey: 'user_id', as: 'user' });
  }

  if (users && properties) {
    users.hasMany(properties, { foreignKey: 'dealerId', as: 'properties' });
    properties.belongsTo(users, { foreignKey: 'dealerId', as: 'dealer' });
  }

  if (properties && dealer_requirements) {
    properties.hasOne(dealer_requirements, { foreignKey: 'property_id', as: 'dealer_requirement', onDelete: 'CASCADE' });
    dealer_requirements.belongsTo(properties, { foreignKey: 'property_id', as: 'property' });
  }

  if (users && dealer_requirements) {
    users.hasMany(dealer_requirements, { foreignKey: 'dealer_id', as: 'dealer_requirements' });
    dealer_requirements.belongsTo(users, { foreignKey: 'dealer_id', as: 'dealer' });
  }

  if (users && dealer_subscriptions) {
    users.hasOne(dealer_subscriptions, { foreignKey: 'dealerId', as: 'subscription' });
    dealer_subscriptions.belongsTo(users, { foreignKey: 'dealerId', as: 'dealer' });
  }

  if (activity_logs && users) {
    activity_logs.belongsTo(users, { foreignKey: 'user_id', as: 'user' });
    users.hasMany(activity_logs, { foreignKey: 'user_id', as: 'logs' });
  }

  if (users && users_sos) {
    users.hasMany(users_sos, {
      foreignKey: 'user_id',
      as: 'sos_details'
    });
    users_sos.belongsTo(users, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }

  if (geofences) {
    if (geofence_cities) {
      geofences.hasMany(geofence_cities, { foreignKey: 'geofence_id', as: 'cities' });
      geofence_cities.belongsTo(geofences, { foreignKey: 'geofence_id', as: 'geofence' });
    }
    if (geofence_areas) {
      geofences.hasMany(geofence_areas, { foreignKey: 'geofence_id', as: 'areas' });
      geofence_areas.belongsTo(geofences, { foreignKey: 'geofence_id', as: 'geofence' });
    }
    if (geofence_pincodes) {
      geofences.hasMany(geofence_pincodes, { foreignKey: 'geofence_id', as: 'pincodes' });
      geofence_pincodes.belongsTo(geofences, { foreignKey: 'geofence_id', as: 'geofence' });
    }
  }

  if (users && users_identity_verification) {
    users.hasOne(users_identity_verification, {
      foreignKey: 'users_id',
      as: 'identity_verification'
    });
    users_identity_verification.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && users_nsw) {
    users.hasMany(users_nsw, {
      foreignKey: 'users_id',
      as: 'nsw_documents'
    });
    users_nsw.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && users_vehicle) {
    users.hasMany(users_vehicle, {
      foreignKey: 'users_id',
      as: 'vehicles'
    });
    users_vehicle.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && users_license) {
    users.hasOne(users_license, {
      foreignKey: 'users_id',
      as: 'license'
    });
    users_license.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && users_vehicle_insurance) {
    users.hasOne(users_vehicle_insurance, {
      foreignKey: 'users_id',
      as: 'vehicle_insurance'
    });
    users_vehicle_insurance.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && tax_rto) {
    users.hasOne(tax_rto, {
      foreignKey: 'users_id',
      as: 'tax_rto'
    });
    tax_rto.belongsTo(users, {
      foreignKey: 'users_id',
      as: 'user'
    });
  }

  if (users && ratings) {
    users.hasMany(ratings, {
      foreignKey: 'driver_id',
      as: 'ratings'
    });
    ratings.belongsTo(users, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
    ratings.belongsTo(users, {
      foreignKey: 'user_id',
      as: 'reviewer'
    });
  }

  if (users_vehicle && vehicle_images) {
    users_vehicle.hasMany(vehicle_images, {
      foreignKey: 'users_vehicle_id',
      as: 'images'
    });
    vehicle_images.belongsTo(users_vehicle, {
      foreignKey: 'users_vehicle_id',
      as: 'vehicle'
    });
  }

  if (payments && users) {
    payments.belongsTo(users, {
      foreignKey: 'userId',
      as: 'payer'
    });
    payments.belongsTo(users, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
    users.hasMany(payments, {
      foreignKey: 'userId',
      as: 'payments'
    });
    users.hasMany(payments, {
      foreignKey: 'driver_id',
      as: 'driverPayments'
    });
  }

  if (notifications && users) {
    notifications.belongsTo(users, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
    notifications.belongsTo(users, {
      foreignKey: 'sender_id',
      as: 'senderName'
    });
    notifications.belongsTo(users, {
      foreignKey: 'reciver_id',
      as: 'receiver'
    });
  }
  if (jobs && users) {
    jobs.belongsTo(users, { foreignKey: 'userId', as: 'rider' });
    jobs.belongsTo(users, { foreignKey: 'driver_id', as: 'jobDriver' });
    users.hasMany(jobs, { foreignKey: 'userId', as: 'userJobs' });
    users.hasMany(jobs, { foreignKey: 'driver_id', as: 'driverJobs' });
  }

  // Promo codes ↔ users (via promo_code_users junction table)
  if (promo_codes && promo_code_users && users) {
    promo_codes.hasMany(promo_code_users, { foreignKey: 'promo_code_id', as: 'promoUsers' });
    promo_code_users.belongsTo(promo_codes, { foreignKey: 'promo_code_id', as: 'promoCode' });

    promo_code_users.belongsTo(users, { foreignKey: 'user_id', as: 'user' });
    users.hasMany(promo_code_users, { foreignKey: 'user_id', as: 'promoAssignments' });
  }
};
