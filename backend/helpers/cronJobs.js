const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require('../models');
const helper = require('../helpers/helper');

const sendReminder = async (job, hoursLabel) => {
  try {
    const [rider, driver] = await Promise.all([
      db.users.findOne({ where: { id: job.userId } }),
      db.users.findOne({ where: { id: job.driverId } })
    ]);

    const message = `Reminder: Job #${job.id} is scheduled in ${hoursLabel}.`;

    for (const recipient of [rider, driver].filter(Boolean)) {
      await db.notifications.create({
        userId: recipient.id,
        title: 'Job Reminder',
        message,
        type: 'job',
        referenceId: job.id
      });

      if (recipient.fcmToken) {
        await helper.sendPushNotification({
          token: recipient.fcmToken,
          title: 'Job Reminder',
          body: message,
          type: 'job',
          request_id: job.id
        });
      }
    }
  } catch (err) {
    console.log('Job reminder error:', err.message);
  }
};

module.exports = () => {
  // Run every hour — send reminders for jobs in next 24h and 1h
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      const upcoming = await db.jobs.findAll({
        where: {
          status: { [Op.in]: [0, 1] }, // 0=pending,1=active
          jobDate: { [Op.gte]: now.toISOString().split('T')[0] }
        }
      });

      for (const job of upcoming) {
        const jobDateTime = new Date(`${job.jobDate}T${job.jobTime || '00:00:00'}`);
        const diffHours = (jobDateTime - now) / (1000 * 60 * 60);

        if (diffHours > 23 && diffHours <= 24) {
          await sendReminder(job, '24 hours');
        } else if (diffHours > 0 && diffHours <= 1) {
          await sendReminder(job, '1 hour');
        }
      }
    } catch (err) {
      console.log('Cron job reminder failed:', err.message);
    }
  });

  console.log('Job reminder cron scheduled');
};
