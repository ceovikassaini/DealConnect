require('dotenv').config();
const { users, bookings, followers, users_vehicle, users_license, vehicle_images, users_identity_verification, users_nsw, users_vehicle_insurance, tax_rto, ratings, users_sos } = require('../../models');
const db = require("../../models");
const sequelize = db.sequelize;
const Sequelize = require("sequelize");
const { Op, fn, col } = Sequelize;
const helper = require('../../helpers/helper');
const path = require('path');
const { logActivity } = require('../../helpers/loggerHelper');

module.exports = {
    userList: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const is_approve = req.query.is_approve;
            const offset = (page - 1) * limit;
            let role = req.query.role || 'user';
            let whereClause = { role, deletedAt: null };

            if (is_approve !== undefined && is_approve !== null && is_approve !== '') {
                if (Number(is_approve) === 0) {
                    whereClause[Op.or] = [
                        { is_approve: 0 },
                        { is_approve: null }
                    ];
                } else {
                    whereClause.is_approve = Number(is_approve);
                }
            }

            if (search) {
                const searchCondition = {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },

                        Sequelize.where(
                            Sequelize.fn(
                                "CONCAT",
                                Sequelize.col("name"),
                                " "
                            ),
                            { [Op.like]: `%${search}%` }
                        ),
                    ],
                };

                if (whereClause[Op.or]) {
                    const pendingCond = { [Op.or]: whereClause[Op.or] };
                    delete whereClause[Op.or];
                    whereClause[Op.and] = [pendingCond, searchCondition];
                } else {
                    whereClause[Op.and] = [searchCondition];
                }
            }
            const include = [];
            if (role === 'driver') {
                include.push({
                    model: db.jobs,
                    as: 'driverJobs',
                    attributes: ['id']
                });
            } else {
                include.push({
                    model: db.jobs,
                    as: 'userJobs',
                    attributes: ['id']
                });
            }

            const { count, rows } = await users.findAndCountAll({
                where: whereClause,
                include,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                distinct: true
            });



            return helper.success(res, 'user list fetched', {
                user_list: rows,
                total: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    userList2: async (req, res) => {
        try {
            const user_list = await users.findAll({
                where: {
                    role: "individual"
                },
                order: [['createdAt', 'DESC']],
            });
            return helper.success(res, 'user list fetched',
                user_list);
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    userListDeleted: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const offset = (page - 1) * limit;
            const role = req.query.role || 'user';
            let whereClause = {
                role,
                deletedAt: { [Op.ne]: null },
            };

            if (search) {
                whereClause = {
                    [Op.and]: [
                        { role, deletedAt: { [Op.ne]: null } },
                        {
                            [Op.or]: [
                                { name: { [Op.like]: `%${search}%` } },
                                { email: { [Op.like]: `%${search}%` } },

                                Sequelize.where(
                                    Sequelize.fn(
                                        "CONCAT",
                                        Sequelize.col("name"),
                                        " ",

                                    ),
                                    { [Op.like]: `%${search}%` }
                                ),
                            ],
                        },
                    ],
                };
            }
            const { count, rows: user_list } = await users.findAndCountAll({
                where: whereClause, paranoid: false,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });

            return helper.success(res, 'user list fetched', {
                user_list,
                total: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    viewUser: async (req, res) => {

        const { id, role } = req.params;
        try {
            const include = [
                {
                    model: users_vehicle,
                    as: 'vehicles',
                    include: [
                        {
                            model: vehicle_images,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: users_license,
                    as: 'license'
                },
                {
                    model: users_identity_verification,
                    as: 'identity_verification'
                },
                {
                    model: users_nsw,
                    as: 'nsw_documents'
                },
                {
                    model: users_vehicle_insurance,
                    as: 'vehicle_insurance'
                },
                {
                    model: tax_rto,
                    as: 'tax_rto'
                },
                {
                    model: users_sos,
                    as: 'sos_details'
                }
            ];

            if (role === 'driver') {
                include.push({
                    model: ratings,
                    as: 'ratings',
                    attributes: ['id', 'rating', 'description', 'createdAt', 'user_id', 'driver_id'],
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: users,
                        as: 'reviewer',
                        attributes: ['id', 'name', 'profileImage']
                    }]
                });
                include.push({
                    model: db.jobs,
                    as: 'driverJobs',
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: users,
                        as: 'rider',
                        attributes: ['id', 'name', 'email', 'phone', 'profileImage']
                    }]
                });
            } else {
                include.push({
                    model: db.jobs,
                    as: 'userJobs',
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: users,
                        as: 'jobDriver',
                        attributes: ['id', 'name', 'email', 'phone', 'profileImage']
                    }]
                });
            }

            const user_details = await users.findOne({
                where: { id },
                include,
                // paranoid: false,
            });

            console.log(user_details, ">>>>>>>>>>>");


            if (!user_details) {
                return helper.failed(res, "User not found");
            }





            return helper.success(res, "user view", user_details);

        } catch (error) {
            console.error('viewUser error:', error);
            return helper.failed(res, error.message || "Something went wrong");
        }
    },
    toggleUserStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const user_exists = await users.findOne({ where: { id } });
            if (!user_exists) {
                return helper.failed(res, "Account not found")
            }

            const newStatus = status || (user_exists.status === 'active' ? 'inactive' : 'active');
            await user_exists.update({ status: newStatus });
            return helper.success(res, "User status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.params;



        try {
            const user_exists = await users.findOne({
                where: { id },

            });

            if (!user_exists) {

                return helper.failed(res, "Account not found");
            }

            await users.destroy({
                where: { id },

            });



            return helper.success(res, "Account deleted");

        } catch (error) {
            console.log(error);
            await t.rollback();
            return helper.failed(res, "Something went wrong");
        }
    },
    restoreUser: async (req, res) => {
        const { id } = req.params;

        try {

            console.log("Restore ID:", id);

            // find deleted user
            const user_exists = await users.findOne({
                where: { id },
                paranoid: false
            });

            console.log("User Found:", user_exists);

            if (!user_exists) {
                return helper.failed(res, "User not found");
            }

            if (!user_exists.deletedAt) {
                return helper.failed(res, "User is not deleted");
            }

            // restore user
            await users.restore({
                where: { id }
            });

            return helper.success(res, "User restored successfully");

        } catch (error) {

            console.log(error, "Restore Error");
            return helper.failed(res, "Something went wrong");

        }
    },
    approveDriver: async (req, res) => {
        const { id } = req.params;
        const { is_approve } = req.body;

        try {
            const user_exists = await users.findOne({ where: { id, role: 'driver' } });
            if (!user_exists) {
                return helper.failed(res, "Driver not found")
            }

            if (is_approve === undefined || ![0, 1, 2].includes(Number(is_approve))) {
                return helper.failed(res, "Invalid approval status");
            }

            await user_exists.update({ is_approve: Number(is_approve) });
            const clientType = req.user?.role === 'admin' ? 'Admin' : 'Sub Admin';
            await logActivity(req, 'Driver', `${clientType} Updated driver status: ${user_exists.name} ${user_exists.last_name || ''}`.trim(), {
                id: user_exists.id,
                name: user_exists.name,
                is_approve: Number(is_approve)
            });
            return helper.success(res, "Driver approval status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    approveVehicle: async (req, res) => {
        const { id, vehicleId } = req.params;
        const { is_reg } = req.body;

        try {
            const vehicle = await users_vehicle.findOne({ where: { id: vehicleId, users_id: id } });
            if (!vehicle) {
                return helper.failed(res, "Vehicle not found")
            }

            if (is_reg === undefined || ![0, 1, 2].includes(Number(is_reg))) {
                return helper.failed(res, "Invalid vehicle approval status");
            }

            await vehicle.update({ is_reg: Number(is_reg) });
            return helper.success(res, "Vehicle approval status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    approveInsurance: async (req, res) => {
        const { id } = req.params;
        const { is_insurance } = req.body;
        const approvalNumber = Number(is_insurance);

        try {
            const user_exists = await users.findOne({ where: { id, role: 'driver' } });
            if (!user_exists) {
                return helper.failed(res, "Driver not found")
            }

            if (!Number.isInteger(approvalNumber) || ![0, 1, 2].includes(approvalNumber)) {
                return helper.failed(res, "Invalid insurance approval status");
            }

            const vehicleInsurance = await users_vehicle_insurance.findOne({ where: { users_id: id } });
            if (!vehicleInsurance) {
                return helper.failed(res, "Vehicle insurance record not found")
            }


            await vehicleInsurance.update({ is_insurance: approvalNumber });
            return helper.success(res, "Vehicle insurance approval status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    approveLicense: async (req, res) => {
        const { id } = req.params;
        const { is_license } = req.body;
        const approvalNumber = Number(is_license);

        try {
            const user_exists = await users.findOne({ where: { id, role: 'driver' } });
            if (!user_exists) {
                return helper.failed(res, "Driver not found")
            }

            if (!Number.isInteger(approvalNumber) || ![0, 1, 2].includes(approvalNumber)) {
                return helper.failed(res, "Invalid license approval status");
            }

            const licenseRecord = await users_license.findOne({ where: { users_id: id } });
            if (!licenseRecord) {
                return helper.failed(res, "License record not found")
            }

            await licenseRecord.update({ is_license: approvalNumber });
            return helper.success(res, "License approval status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    approveNSW: async (req, res) => {
        const { id } = req.params;
        const { approval_status } = req.body;
        const approvalNumber = Number(approval_status);

        try {
            const nswRecord = await users_nsw.findOne({ where: { id } });
            if (!nswRecord) {
                return helper.failed(res, "NSW record not found")
            }

            if (!Number.isInteger(approvalNumber) || ![0, 1, 2].includes(approvalNumber)) {
                return helper.failed(res, "Invalid NSW approval status");
            }

            await nswRecord.update({ approval_status: approvalNumber });
            return helper.success(res, "NSW document approval status updated successfully")
        } catch (error) {
            console.log(error)
            return helper.failed(res, 'Something went wrong')
        }
    },
    approveTaxRTO: async (req, res) => {
        const { id } = req.params;
        const { is_policy, is_declaration } = req.body;

        try {
            const user_exists = await users.findOne({ where: { id, role: 'driver' } });
            if (!user_exists) {
                return helper.failed(res, "Driver not found")
            }

            const updateFields = {};
            if (is_policy !== undefined) {
                const policyStatus = Number(is_policy);
                if (!Number.isInteger(policyStatus) || ![0, 1, 2].includes(policyStatus)) {
                    return helper.failed(res, "Invalid tax policy status");
                }
                updateFields.is_policy = policyStatus;
            }
            if (is_declaration !== undefined) {
                const declarationStatus = Number(is_declaration);
                if (!Number.isInteger(declarationStatus) || ![0, 1, 2].includes(declarationStatus)) {
                    return helper.failed(res, "Invalid declaration status");
                }
                updateFields.is_declaration = declarationStatus;
            }

            if (Object.keys(updateFields).length === 0) {
                return helper.failed(res, "Nothing to update")
            }

            const [taxRecord] = await tax_rto.findOrCreate({
                where: { users_id: id },
                defaults: {
                    users_id: id,
                    business_no: "",
                    gst_registration: "",
                    is_policy: updateFields.is_policy ?? 0,
                    declaration: "",
                    is_declaration: updateFields.is_declaration ?? 0,
                },
            });

            await taxRecord.update(updateFields);
            return helper.success(res, "Tax & declaration approval status updated successfully")
        } catch (error) {
            console.error('approveTaxRTO error:', error);
            return helper.failed(res, error.message || 'Something went wrong')
        }
    },
    approveIdentityVerification: async (req, res) => {
        const { id } = req.params;
        const { visa_allow, is_notify } = req.body;

        try {
            const identityRecord = await users_identity_verification.findOne({ where: { users_id: id } });
            if (!identityRecord) {
                return helper.failed(res, "Identity verification record not found")
            }

            const updateFields = {};
            if (visa_allow !== undefined) {
                const allowStatus = Number(visa_allow);
                if (!Number.isInteger(allowStatus) || ![0, 1, 2].includes(allowStatus)) {
                    return helper.failed(res, "Invalid work rights authorization status");
                }
                updateFields.visa_allow = allowStatus;
            }
            if (is_notify !== undefined) {
                const notifyStatus = Number(is_notify);
                if (!Number.isInteger(notifyStatus) || ![0, 1, 2].includes(notifyStatus)) {
                    return helper.failed(res, "Invalid notification status");
                }
                updateFields.is_notify = notifyStatus;
            }

            if (Object.keys(updateFields).length === 0) {
                return helper.failed(res, "Nothing to update")
            }

            await identityRecord.update(updateFields);
            return helper.success(res, "Identity verification status updated successfully")
        } catch (error) {
            console.error('approveIdentityVerification error:', error);
            return helper.failed(res, error.message || 'Something went wrong')
        }
    },
}