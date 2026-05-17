const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../models/db');

const genAI = new GoogleGenerativeAI('AIzaSyAuG5fnMQzSuD_8x_VeC-5VBuXmO1hztCI');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const PROMPTS = {
  summary: (body) => `You are an expert note summarizer. Summarize the following note in 2-3 clear, concise sentences that capture the essential information and main points.

Note content:
${body}

Respond with ONLY the summary text. No labels, no preamble, no markdown.`,

  actions: (body) => `You are a productivity expert. Extract concrete action items from the following note. Each action item should be a clear, actionable task starting with a strong verb.

Note content:
${body}

Respond with ONLY a JSON array of strings, each being one action item. Example: ["Review the API design", "Schedule follow-up meeting"]. If no action items are found, respond with an empty array: []`,

  title: (body) => `You are a creative writing assistant. Suggest a concise, descriptive, and engaging title for the following note. The title should be 4-8 words and capture the essence of the content.

Note content:
${body}

Respond with ONLY the title text. No quotes, no labels, no explanation.`,
};

const generateAI = async (type, body, userId, noteId) => {
  const prompt = PROMPTS[type](body.substring(0, 4000));

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

  // Log AI usage
  await db.query(
    `INSERT INTO ai_usage (user_id, note_id, action_type, tokens_used) VALUES ($1,$2,$3,$4)`,
    [userId, noteId, type, tokensUsed]
  );

  if (type === 'summary') {
    return { summary: text, tokensUsed };
  } else if (type === 'actions') {
    let actionItems = [];
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      actionItems = JSON.parse(cleaned);
      if (!Array.isArray(actionItems)) actionItems = [];
    } catch {
      // fallback: split by newlines
      actionItems = text.split('\n').map(l => l.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean);
    }
    return { actionItems, tokensUsed };
  } else {
    return { suggestedTitle: text, tokensUsed };
  }
};

module.exports = { generateAI };