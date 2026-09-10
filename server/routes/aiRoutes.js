import express from "express";
import { generateSchemeChatResponse } from "../services/openaiService.js";

const router = express.Router();

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, userContext, recommendations, selectedScheme, supportPath } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please ask a question about your scheme recommendations.",
      });
    }

    if (userContext !== undefined && (typeof userContext !== "object" || userContext === null)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user context supplied.",
      });
    }

    const response = await generateSchemeChatResponse({
      message,
      userContext: userContext || {},
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      selectedScheme: selectedScheme || {},
      supportPath: supportPath && typeof supportPath === "object" ? supportPath : null,
    });

    return res.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get AI guidance right now. Please try again.",
    });
  }
});

export default router;
