const { faqs } = require("../../models");
const helper = require('../../helpers/helper');

module.exports = {
  // GET /faqs - Get list of FAQs
  faqList: async (req, res) => {
    try {
      const list = await faqs.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      // Return both frontend 'data' & standard 'body' formats to ensure compatibility
      return res.status(200).json({
        success: true,
        status: true,
        code: 200,
        message: "FAQs list retrieved successfully",
        body: list,
        data: list
      });
    } catch (error) {
      console.error("Error in faqList:", error);
      return helper.error(res, "Something went wrong retrieving FAQs list");
    }
  },

  // POST /faqs - Add new FAQ
  createFaq: async (req, res) => {
    try {
      const { question, answer } = req.body;
      
      if (!question || question.trim() === "") {
        return helper.failed(res, "Question cannot be empty");
      }
      if (!answer || answer.trim() === "") {
        return helper.failed(res, "Answer cannot be empty");
      }

      const newFaq = await faqs.create({
        question: question.trim(),
        answer: answer.trim(),
        status: 'active'
      });

      return helper.success(res, "FAQ added successfully", newFaq);
    } catch (error) {
      console.error("Error in createFaq:", error);
      return helper.error(res, "Something went wrong adding FAQ");
    }
  },

  // PUT /faqs/:id - Edit FAQ
  updateFaq: async (req, res) => {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;

      const faq = await faqs.findByPk(id);
      if (!faq) {
        return helper.failed(res, "FAQ not found", {}, 404);
      }

      if (!question || question.trim() === "") {
        return helper.failed(res, "Question cannot be empty");
      }
      if (!answer || answer.trim() === "") {
        return helper.failed(res, "Answer cannot be empty");
      }

      await faq.update({
        question: question.trim(),
        answer: answer.trim()
      });

      return helper.success(res, "FAQ updated successfully", faq);
    } catch (error) {
      console.error("Error in updateFaq:", error);
      return helper.error(res, "Something went wrong updating FAQ");
    }
  },

  // PUT /faqs/status/:id - Toggle FAQ status
  toggleFaqStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await faqs.findByPk(id);
      if (!faq) {
        return helper.failed(res, "FAQ not found", {}, 404);
      }

      const newStatus = faq.status === 'active' ? 'inactive' : 'active';
      await faq.update({ status: newStatus });

      return helper.success(res, `FAQ status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error in toggleFaqStatus:", error);
      return helper.error(res, "Something went wrong toggling FAQ status");
    }
  },

  // DELETE /faqs/:id - Delete/Remove FAQ
  deleteFaq: async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await faqs.findByPk(id);
      if (!faq) {
        return helper.failed(res, "FAQ not found", {}, 404);
      }

      await faq.destroy(); // Soft delete as paranoid: true is set on models/faqs.js
      return helper.success(res, "FAQ deleted successfully");
    } catch (error) {
      console.error("Error in deleteFaq:", error);
      return helper.error(res, "Something went wrong deleting FAQ");
    }
  }
};
