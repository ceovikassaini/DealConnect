const db = require('../../models');
const helper = require('../../helpers/helper');
const { Op } = require('sequelize');

module.exports = {
  notificationList: async (req, res) => {
    try {
      const list = await db.notifications.findAll({ order: [['id', 'DESC']], limit: 50 });
      return helper.success(res, "Notifications fetched", list);
    } catch (err) {
      return helper.error(res, "Internal server error");
    }
  },
  sendBulkNotification: async (req, res) => {
    try {
      const { target, recipient_id, recipient_ids, title, message } = req.body;

      if (!title || !message) {
        return helper.failed(res, "Title and message are required");
      }

      const adminId = req.auth ? req.auth.id : 1;

      if (
        target === 'single_user' ||
        target === 'single_driver' ||
        target === 'single' ||
        target === 'custom_users' ||
        target === 'custom_drivers' ||
        target === 'custom'
      ) {
        let idsArray = [];
        if (Array.isArray(recipient_ids) && recipient_ids.length > 0) {
          idsArray = recipient_ids;
        } else if (Array.isArray(recipient_id) && recipient_id.length > 0) {
          idsArray = recipient_id;
        } else if (recipient_ids) {
          idsArray = [recipient_ids];
        } else if (recipient_id) {
          idsArray = [recipient_id];
        }

        if (idsArray.length === 0) {
          return helper.failed(res, "Please select at least one recipient");
        }

        const recipients = await db.users.findAll({
          where: { id: { [Op.in]: idsArray } }
        });

        if (!recipients || recipients.length === 0) {
          return helper.failed(res, "Selected recipients not found");
        }

        let pushedCount = 0;
        for (const u of recipients) {
          const notifType = u.role === 'driver' ? 2 : 0;
          await db.notifications.create({
            sender_id: adminId,
            reciver_id: u.id,
            title: title,
            message: message,
            type: notifType,
            is_read: 0
          });

          if (u.fcmToken) {
            try {
              await helper.sendPushNotification({
                token: u.fcmToken,
                title: title,
                body: message,
                type: 'system',
                sender_id: adminId,
              });
              pushedCount++;
            } catch (e) {
              console.error("Firebase push failed for recipient " + u.id, e);
            }
          }
        }

        const namesList = recipients.map(r => r.name || `ID #${r.id}`).join(', ');

        return helper.success(
          res,
          `Notification sent successfully to ${recipients.length} recipient(s): ${namesList} (${pushedCount} push delivered)`
        );
      } else if (target === 'all') {
        const usersList = await db.users.findAll({
          where: { role: 'user' },
          attributes: ['id', 'fcmToken']
        });
        const driversList = await db.users.findAll({
          where: { role: 'driver' },
          attributes: ['id', 'fcmToken']
        });

        // Create TWO database entries: one for User (type = 0), one for Driver (type = 2)
        await Promise.all([
          db.notifications.create({
            sender_id: adminId,
            reciver_id: 0,
            title: title,
            message: message,
            type: 0,
            is_read: 0
          }),
          db.notifications.create({
            sender_id: adminId,
            reciver_id: 0,
            title: title,
            message: message,
            type: 2,
            is_read: 0
          })
        ]);

        // Send Push Notifications
        let pushedCount = 0;
        const allRecipients = [...usersList, ...driversList];
        for (const u of allRecipients) {
          if (u.fcmToken) {
            try {
              await helper.sendPushNotification({
                token: u.fcmToken,
                title: title,
                body: message,
                type: 'system',
                sender_id: 1,
              });
              pushedCount++;
            } catch (e) {
              console.error("Firebase push failed for user " + u.id);
            }
          }
        }

        return helper.success(res, `Notification sent successfully to ${allRecipients.length} users and drivers (${pushedCount} push delivered)`);

      } else if (target === 'users') {
        const usersList = await db.users.findAll({
          where: { role: 'user' },
          attributes: ['id', 'fcmToken']
        });

        if (!usersList || usersList.length === 0) {
          return helper.failed(res, "No users found matching the selected target");
        }

        // Create ONE database entry: User (type = 0)
        await db.notifications.create({
          sender_id: adminId,
          reciver_id: 0,
          title: title,
          message: message,
          type: 0,
          is_read: 0
        });

        // Send Push Notifications
        let pushedCount = 0;
        for (const u of usersList) {
          if (u.fcmToken) {
            try {
              await helper.sendPushNotification({
                token: u.fcmToken,
                title: title,
                body: message,
                type: 'system',
                sender_id: 1,
              });
              pushedCount++;
            } catch (e) {
              console.error("Firebase push failed for user " + u.id);
            }
          }
        }

        return helper.success(res, `Notification sent successfully to ${usersList.length} users (${pushedCount} push delivered)`);

      } else if (target === 'driver') {
        const driversList = await db.users.findAll({
          where: { role: 'driver' },
          attributes: ['id', 'fcmToken']
        });

        if (!driversList || driversList.length === 0) {
          return helper.failed(res, "No drivers found matching the selected target");
        }

        // Create ONE database entry: Driver (type = 2)
        await db.notifications.create({
          sender_id: adminId,
          reciver_id: 0,
          title: title,
          message: message,
          type: 2,
          is_read: 0
        });

        // Send Push Notifications
        let pushedCount = 0;
        for (const u of driversList) {
          if (u.fcmToken) {
            try {
              await helper.sendPushNotification({
                token: u.fcmToken,
                title: title,
                body: message,
                type: 'system',
                sender_id: 1,
              });
              pushedCount++;
            } catch (e) {
              console.error("Firebase push failed for user " + u.id);
            }
          }
        }

        return helper.success(res, `Notification sent successfully to ${driversList.length} drivers (${pushedCount} push delivered)`);

      } else {
        return helper.failed(res, "Invalid target selected");
      }
    } catch (err) {
      console.error(err);
      return helper.error(res, "Internal server error");
    }
  }
};
