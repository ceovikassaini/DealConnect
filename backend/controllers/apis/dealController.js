const db = require('../../models');
const { deal_connect, deal_connect_chat, property, property_images, users, subscription_buy } = db;

const STATUS_MAP = {
  1: "User showed interest",
  2: "Dealer accepted lead",
  3: "Dealer contacted user",
  4: "Site visit scheduled",
  5: "Site visit completed"
};

// Check if a dealer has an active Professional subscription
const isDealerProfessional = async (dealerId) => {
  if (!dealerId) return false;
  if (!subscription_buy) return false;
  try {
    const sub = await subscription_buy.findOne({
      where: {
        user_id: Number(dealerId),
        status: "Active"
      },
      order: [['id', 'DESC']]
    });

    if (!sub) return false;

    const planName = (sub.plan_name || "").toLowerCase();
    const subId = Number(sub.subscription_id);

    // Dealer Professional has subscription_id === 2 or plan_name containing "professional" or "pro"
    // and is not basic
    const isPro = (subId === 2 || planName.includes("professional") || planName.includes("pro")) && !planName.includes("basic");
    return Boolean(isPro);
  } catch (err) {
    console.error("Error checking dealer professional status:", err);
    return false;
  }
};

module.exports = {
  STATUS_MAP,
  isDealerProfessional,

  // POST /api/deals/connect
  // Triggered when a user clicks / shows interest on a property
  connectDeal: async (req, res) => {
    try {
      const { user_id, property_id, dealer_id } = req.body;

      if (!user_id || !property_id) {
        return res.status(400).json({
          success: false,
          message: "user_id and property_id are required"
        });
      }

      const propId = Number(property_id);
      const userId = Number(user_id);

      // Find property to get dealer_id if missing
      const propItem = await property.findByPk(propId, {
        include: property_images ? [{ model: property_images, as: 'property_images', required: false }] : []
      });

      if (!propItem) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const activeDealerId = Number(dealer_id || propItem.dealer_id || propItem.user_id || 0);

      // Check if deal already exists between user and this property
      let existingDeal = await deal_connect.findOne({
        where: {
          user_id: userId,
          property_id: propId
        },
        include: [
          { model: property, as: 'property', required: false, include: property_images ? [{ model: property_images, as: 'property_images', required: false }] : [] },
          { model: users, as: 'dealer', attributes: ['id', 'name', 'email', 'mobile_no', 'role'], required: false },
          { model: users, as: 'user', attributes: ['id', 'name', 'email', 'mobile_no', 'role'], required: false }
        ]
      });

      if (existingDeal) {
        return res.status(200).json({
          success: true,
          message: "Interest already recorded for this property",
          deal: existingDeal,
          statusText: STATUS_MAP[existingDeal.status] || "User showed interest"
        });
      }

      // Create new deal_connect record with Status = 1 (User showed interest)
      const newDeal = await deal_connect.create({
        user_id: userId,
        dealer_id: activeDealerId,
        property_id: propId,
        status: 1 // 1 => User showed interest
      });

      // Fetch created record with associations
      const createdDeal = await deal_connect.findByPk(newDeal.id, {
        include: [
          { model: property, as: 'property', required: false, include: property_images ? [{ model: property_images, as: 'property_images', required: false }] : [] },
          { model: users, as: 'dealer', attributes: ['id', 'name', 'email', 'mobile_no', 'role'], required: false },
          { model: users, as: 'user', attributes: ['id', 'name', 'email', 'mobile_no', 'role'], required: false }
        ]
      });

      // Realtime notification via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('new_deal_lead', {
          dealer_id: activeDealerId,
          deal_id: newDeal.id,
          property_id: propId,
          user_id: userId,
          deal: createdDeal
        });
      }

      return res.status(201).json({
        success: true,
        message: "Your interest has been shared with the dealer successfully!",
        deal: createdDeal,
        statusText: STATUS_MAP[1]
      });
    } catch (err) {
      console.error("Connect deal error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to record property interest"
      });
    }
  },

  // GET /api/dealer/deals?dealer_id=...
  getDealerDeals: async (req, res) => {
    try {
      const dealerId = Number(req.query.dealer_id || req.query.dealerId || req.user?.id || 0);

      const whereCond = {};
      if (dealerId && dealerId > 0) {
        whereCond.dealer_id = dealerId;
      }

      const list = await deal_connect.findAll({
        where: whereCond,
        include: [
          { 
            model: property, 
            as: 'property', 
            required: false,
            include: property_images ? [{ model: property_images, as: 'property_images', required: false }] : []
          },
          { 
            model: users, 
            as: 'user', 
            attributes: ['id', 'name', 'email', 'mobile_no', 'role', 'image'], 
            required: false 
          },
          {
            model: deal_connect_chat,
            as: 'chats',
            required: false,
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const dealerHasPro = await isDealerProfessional(dealerId);

      const formatted = list.map(item => {
        const d = item.toJSON ? item.toJSON() : item;
        const prop = d.property || {};
        let img = "/logo.png";
        if (prop.property_images && prop.property_images.length > 0) {
          img = prop.property_images[0].images || img;
        }

        return {
          ...d,
          statusText: STATUS_MAP[d.status] || `Status #${d.status}`,
          canChat: Number(d.status) >= 2 && dealerHasPro,
          requiresPro: !dealerHasPro,
          dealerHasPro,
          propertyTitle: prop.name || prop.title || "Property Listing",
          propertyLocation: prop.location || "Sonipat, Haryana",
          propertyPrice: prop.price || 0,
          propertyImage: img,
          userName: d.user?.name || "Interested Buyer",
          userEmail: d.user?.email || "N/A",
          userPhone: d.user?.mobile_no || "N/A"
        };
      });

      return res.status(200).json({
        success: true,
        count: formatted.length,
        dealerHasPro,
        deals: formatted,
        body: formatted
      });
    } catch (err) {
      console.error("Get dealer deals error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch dealer deals"
      });
    }
  },

  // GET /api/user/deals?user_id=...
  getUserDeals: async (req, res) => {
    try {
      const userId = Number(req.query.user_id || req.query.userId || req.user?.id || 0);

      const whereCond = {};
      if (userId && userId > 0) {
        whereCond.user_id = userId;
      }

      const list = await deal_connect.findAll({
        where: whereCond,
        include: [
          { 
            model: property, 
            as: 'property', 
            required: false,
            include: property_images ? [{ model: property_images, as: 'property_images', required: false }] : []
          },
          { 
            model: users, 
            as: 'dealer', 
            attributes: ['id', 'name', 'email', 'mobile_no', 'role'], 
            required: false 
          },
          {
            model: deal_connect_chat,
            as: 'chats',
            required: false,
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = list.map(item => {
        const d = item.toJSON ? item.toJSON() : item;
        const prop = d.property || {};
        let img = "/logo.png";
        if (prop.property_images && prop.property_images.length > 0) {
          img = prop.property_images[0].images || img;
        }

        return {
          ...d,
          statusText: STATUS_MAP[d.status] || `Status #${d.status}`,
          canChat: Number(d.status) >= 2,
          propertyTitle: prop.name || prop.title || "Property Listing",
          propertyLocation: prop.location || "Sonipat, Haryana",
          propertyPrice: prop.price || 0,
          propertyImage: img,
          dealerName: d.dealer?.name || prop.dealerName || "Property Dealer",
          dealerEmail: d.dealer?.email || "N/A",
          dealerPhone: d.dealer?.mobile_no || "N/A"
        };
      });

      return res.status(200).json({
        success: true,
        count: formatted.length,
        deals: formatted,
        body: formatted
      });
    } catch (err) {
      console.error("Get user deals error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch user deals"
      });
    }
  },

  // GET /api/deals/check?user_id=...&property_id=...
  checkDeal: async (req, res) => {
    try {
      const { user_id, property_id } = req.query;
      if (!user_id || !property_id) {
        return res.status(200).json({ success: true, hasDeal: false, deal: null });
      }

      const deal = await deal_connect.findOne({
        where: {
          user_id: Number(user_id),
          property_id: Number(property_id)
        },
        include: [
          { model: users, as: 'dealer', attributes: ['id', 'name', 'email', 'mobile_no'], required: false },
          { model: users, as: 'user', attributes: ['id', 'name', 'email', 'mobile_no'], required: false }
        ]
      });

      if (!deal) {
        return res.status(200).json({ success: true, hasDeal: false, deal: null });
      }

      return res.status(200).json({
        success: true,
        hasDeal: true,
        deal: {
          ...deal.toJSON(),
          statusText: STATUS_MAP[deal.status] || `Status #${deal.status}`,
          canChat: Number(deal.status) >= 2
        }
      });
    } catch (err) {
      console.error("Check deal error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/deals/:id/status or POST /api/deals/update_status
  // Updates deal status (1 => User showed interest, 2 => Dealer accepted lead, 3 => Dealer contacted user, 4 => Site visit scheduled, 5 => Site visit completed)
  updateDealStatus: async (req, res) => {
    try {
      const id = req.params.id || req.body.id;
      const status = Number(req.body.status);

      if (!id || !status || status < 1 || status > 5) {
        return res.status(400).json({
          success: false,
          message: "Valid deal ID and status (1-5) are required"
        });
      }

      const deal = await deal_connect.findByPk(id);
      if (!deal) {
        return res.status(404).json({
          success: false,
          message: "Deal not found"
        });
      }

      const prevStatus = deal.status;

      // Check if dealer has Professional subscription
      const dealerHasPro = await isDealerProfessional(deal.dealer_id);

      // If dealer is accepting lead (status === 2), chat starts here, so Professional subscription is strictly required
      if (status === 2 && !dealerHasPro) {
        return res.status(403).json({
          success: false,
          code: "PRO_REQUIRED",
          requiresPro: true,
          message: "Dealer side se chat start karne ke liye Professional Subscription le rakhi honi chahiye. Please upgrade to Professional Plan (₹999)."
        });
      }

      deal.status = status;
      await deal.save();

      // If dealer accepts lead (status becomes 2), ensure initial conversation / greeting message exists
      if (status === 2 && prevStatus !== 2 && deal_connect_chat) {
        const existingChatCount = await deal_connect_chat.count({ where: { deal_connect_id: deal.id } });
        if (existingChatCount === 0) {
          await deal_connect_chat.create({
            deal_connect_id: deal.id,
            sender_id: deal.dealer_id,
            reciver_id: deal.user_id,
            message: "Hello! I have accepted your interest in this property. How can I assist you today?"
          });
        }
      }

      // Fetch refreshed deal with associations
      const updatedDeal = await deal_connect.findByPk(id, {
        include: [
          { model: property, as: 'property', required: false },
          { model: users, as: 'dealer', attributes: ['id', 'name', 'email', 'mobile_no'], required: false },
          { model: users, as: 'user', attributes: ['id', 'name', 'email', 'mobile_no'], required: false }
        ]
      });

      // Socket emit
      const io = req.app.get('io');
      if (io) {
        io.emit('deal_status_updated', {
          deal_id: deal.id,
          status,
          statusText: STATUS_MAP[status],
          deal: updatedDeal
        });
      }

      return res.status(200).json({
        success: true,
        message: `Deal status updated to: ${STATUS_MAP[status]}`,
        status,
        statusText: STATUS_MAP[status],
        dealerHasPro,
        deal: updatedDeal
      });
    } catch (err) {
      console.error("Update deal status error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to update deal status"
      });
    }
  },

  // GET /api/deals/:id/messages
  getDealChats: async (req, res) => {
    try {
      const dealId = Number(req.params.id || req.query.deal_connect_id);
      if (!dealId) {
        return res.status(400).json({ success: false, message: "Deal ID is required" });
      }

      const deal = await deal_connect.findByPk(dealId);
      const dealerHasPro = deal ? await isDealerProfessional(deal.dealer_id) : false;

      const messages = await deal_connect_chat.findAll({
        where: { deal_connect_id: dealId },
        include: [
          { model: users, as: 'sender', attributes: ['id', 'name', 'role'], required: false },
          { model: users, as: 'receiver', attributes: ['id', 'name', 'role'], required: false }
        ],
        order: [['createdAt', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        count: messages.length,
        dealerHasPro,
        dealStatus: deal ? deal.status : 1,
        canChat: deal ? (Number(deal.status) >= 2 && dealerHasPro) : false,
        messages
      });
    } catch (err) {
      console.error("Get deal chats error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch chat messages"
      });
    }
  },

  // POST /api/deals/:id/messages or POST /api/deals/chat
  sendDealChat: async (req, res) => {
    try {
      const dealId = Number(req.params.id || req.body.deal_connect_id);
      const senderId = Number(req.body.sender_id || req.user?.id);
      const { message } = req.body;

      if (!dealId || !senderId || !message || message.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "deal_connect_id, sender_id, and message are required"
        });
      }

      const deal = await deal_connect.findByPk(dealId);
      if (!deal) {
        return res.status(404).json({ success: false, message: "Deal not found" });
      }

      // Check if lead has been accepted (Status >= 2)
      if (Number(deal.status) < 2) {
        return res.status(403).json({
          success: false,
          message: "Chat tab tak start nahi ho sakti jab tak dealer lead accept na kare (Status 2: Dealer accepted lead)."
        });
      }

      // Check if sender is dealer and if dealer has Professional subscription
      const isSenderDealer = Number(senderId) === Number(deal.dealer_id);
      const dealerHasPro = await isDealerProfessional(deal.dealer_id);

      if (isSenderDealer && !dealerHasPro) {
        return res.status(403).json({
          success: false,
          code: "PRO_REQUIRED",
          requiresPro: true,
          message: "Dealer side se chat start karne ke liye Professional Subscription zaroori hai. Please upgrade to Professional Plan (₹999)."
        });
      }

      // Automatically determine reciver_id
      let reciverId = Number(req.body.reciver_id || 0);
      if (!reciverId || reciverId === 0) {
        reciverId = senderId === Number(deal.dealer_id) ? Number(deal.user_id) : Number(deal.dealer_id);
      }

      const newChat = await deal_connect_chat.create({
        deal_connect_id: dealId,
        sender_id: senderId,
        reciver_id: reciverId,
        message: message.trim()
      });

      const messageWithSender = await deal_connect_chat.findByPk(newChat.id, {
        include: [
          { model: users, as: 'sender', attributes: ['id', 'name', 'role'], required: false },
          { model: users, as: 'receiver', attributes: ['id', 'name', 'role'], required: false }
        ]
      });

      // Socket emit
      const io = req.app.get('io');
      if (io) {
        io.emit('new_deal_message', {
          deal_connect_id: dealId,
          message: messageWithSender
        });
      }

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        chat: messageWithSender
      });
    } catch (err) {
      console.error("Send deal chat error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to send chat message"
      });
    }
  }
};
