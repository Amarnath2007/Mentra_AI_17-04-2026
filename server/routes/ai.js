const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const supabase = require('../supabase');

let groq = null;
try {
  const Groq = require('groq-sdk');
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== 'gsk_your_groq_api_key_here') {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() });
  }
} catch (e) {
  console.warn('Groq initialization failed:', e.message);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const getMockLearningPath = (interests, skillLevel) => ({
  title: `Personalized ${interests[0] || 'Technology'} Learning Path`,
  description: `A curated learning journey tailored for a ${skillLevel} learner interested in ${interests.join(', ')}.`,
  category: interests[0] || 'Technology',
  totalEstimatedHours: 45,
  topics: [
    { title: 'Foundations & Core Concepts', description: 'Build a solid understanding of the fundamentals.', estimatedHours: 8, difficulty: 'beginner', order: 1, resources: [{ title: 'Official Documentation', url: '#', type: 'docs' }, { title: 'Beginner Video Course', url: '#', type: 'video' }] },
    { title: 'Intermediate Patterns & Best Practices', description: 'Learn how professionals approach common problems.', estimatedHours: 12, difficulty: 'intermediate', order: 2, resources: [{ title: 'Advanced Tutorial Series', url: '#', type: 'video' }, { title: 'GitHub Examples', url: '#', type: 'code' }] },
    { title: 'Building Real Projects', description: 'Apply your knowledge to hands-on projects.', estimatedHours: 15, difficulty: 'intermediate', order: 3, resources: [{ title: 'Project Ideas', url: '#', type: 'article' }] },
    { title: 'Advanced Topics & Optimization', description: 'Deep-dive into performance and advanced patterns.', estimatedHours: 10, difficulty: 'advanced', order: 4, resources: [{ title: 'Research Papers', url: '#', type: 'paper' }] },
  ],
});

const getMockQuiz = (topic) => ({
  topic,
  questions: [
    { id: 1, question: `What is the primary purpose of ${topic}?`, options: ['To simplify complex logic', 'To enhance performance', 'To structure code better', 'All of the above'], answer: 3 },
    { id: 2, question: `Which of the following best describes a key concept in ${topic}?`, options: ['Encapsulation', 'Polymorphism', 'Abstraction', 'Inheritance'], answer: 0 },
    { id: 3, question: `What tool is commonly used alongside ${topic}?`, options: ['Git', 'Docker', 'Kubernetes', 'All of the above'], answer: 3 },
    { id: 4, question: `In ${topic}, what does "state management" refer to?`, options: ['Managing server state', 'Managing UI data over time', 'Managing database records', 'Managing API calls'], answer: 1 },
    { id: 5, question: `Which is a best practice when working with ${topic}?`, options: ['Write large, monolithic functions', 'Avoid testing', 'Use modular, reusable components', 'Ignore error handling'], answer: 2 },
  ],
});

// ─── AI Helpers ───────────────────────────────────────────────────────────────

const repairJSON = (str) => {
  try {
    // Attempt to extract JSON from markdown code blocks or general text
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return str;
  } catch (e) {
    return str;
  }
};

const callAI = async (systemPrompt, userMessage, jsonMode = false) => {
  if (!groq) return null;
  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const response = await groq.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" },
    });
    
    let content = response.choices[0]?.message?.content;
    if (jsonMode) content = repairJSON(content || "");
    return content;
  } catch (err) {
    console.warn('Groq error:', err.message);
    return null;
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /ai/generate-path
router.post('/generate-path', auth, async (req, res) => {
  try {
    const { interests = ['JavaScript'], skillLevel = 'beginner', goals = '' } = req.body;

    const systemPrompt = `You are an expert curriculum designer. Generate a personalized learning path as JSON with this exact structure:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "totalEstimatedHours": number,
  "topics": [
    {
      "title": "string",
      "description": "string",
      "estimatedHours": number,
      "difficulty": "beginner|intermediate|advanced",
      "order": number,
      "resources": [{"title": "string", "url": "string", "type": "docs|video|article|code"}]
    }
  ]
}
Return ONLY valid JSON.`;

    const userMsg = `Create a learning path for: Interests: ${interests.join(', ')}, Skill level: ${skillLevel}, Goals: ${goals}`;
    const aiResponse = await callAI(systemPrompt, userMsg, true);

    let learningPath;
    if (aiResponse) {
      try { learningPath = JSON.parse(aiResponse); } catch(e) { learningPath = getMockLearningPath(interests, skillLevel); }
    } else {
      learningPath = getMockLearningPath(interests, skillLevel);
    }

    // Save to DB if available
    try {
      if (supabase) {
        const { data: saved, error } = await supabase.from('learning_paths').insert([{
           user_id: req.user.id,
           title: learningPath.title,
           description: learningPath.description,
           category: learningPath.category,
           totalEstimatedHours: learningPath.totalEstimatedHours,
           topics: learningPath.topics
        }]).select().single();
        
        if (saved && !error) {
           await supabase.from('users').update({ learningPath: saved.id }).eq('id', req.user.id);
           return res.json({ ...learningPath, id: saved.id, source: aiResponse ? 'ai' : 'mock' });
        }
      }
    } catch(e) {}

    res.json({ ...learningPath, source: aiResponse ? 'ai' : 'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const systemPrompt = `You are Mentra, an expert AI learning assistant and mentor. You help students learn programming, technology, and academic subjects. You're encouraging, clear, and provide practical examples. Keep answers concise but complete. Format code using markdown code blocks.`;

    let reply;
    if (groq) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map(m => ({ role: m.role || 'user', content: m.content || m })), // Keep last 6 messages
          { role: 'user', content: message },
        ];
        const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
        const response = await groq.chat.completions.create({
          model: model,
          messages,
          max_tokens: 800,
          temperature: 0.7,
        });
        reply = response.choices[0]?.message?.content;
      } catch(e) {
        console.warn('Groq chat error:', e.message);
      }
    }

    if (!reply) {
      // Smart mock responses
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('react')) reply = "React is a JavaScript library for building user interfaces using a component-based architecture. Key concepts include:\n\n1. **Components** – Reusable UI building blocks\n2. **State** – Data that changes over time (`useState`)\n3. **Props** – Data passed between components\n4. **Hooks** – Functions like `useEffect`, `useMemo`\n\nStart with the official docs at react.dev — they have excellent interactive tutorials!";
      else if (lowerMsg.includes('javascript') || lowerMsg.includes('js')) reply = "JavaScript is the language of the web! Key things to learn:\n\n- **Variables**: `let`, `const`, `var`\n- **Functions**: Arrow functions, callbacks\n- **Async**: Promises, async/await\n- **DOM**: Manipulating web pages\n\nI recommend starting with JavaScript.info — it's the best free resource online.";
      else if (lowerMsg.includes('python')) reply = "Python is excellent for beginners and professionals alike. Great for:\n\n- **Web Dev**: Django, FastAPI\n- **Data Science**: Pandas, NumPy\n- **AI/ML**: TensorFlow, PyTorch\n- **Automation**: Scripting, bots\n\nStart with `print('Hello World!')` and explore from there!";
      else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) reply = "Hello! 👋 I'm Mentra, your AI learning assistant. I'm here to help you with programming, technology, and academic questions. What would you like to learn today?";
      else reply = `Great question about "${message}"! As your AI mentor, I can help you dive deep into this topic. Here's what I'd suggest:\n\n1. **Break it down** – Start with the fundamentals\n2. **Practice** – Build small projects\n3. **Ask questions** – Don't hesitate to explore further\n\nCould you tell me more specifically what aspect you'd like to explore? I'll tailor my explanation to your level.`;
    }

    res.json({ reply, source: groq ? 'ai' : 'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/quiz
router.post('/quiz', auth, async (req, res) => {
  try {
    const { topic = 'JavaScript', difficulty = 'intermediate' } = req.body;

    const systemPrompt = `You are a quiz generator. Generate exactly 5 multiple-choice questions as JSON:
{
  "topic": "string",
  "questions": [
    {
      "id": number,
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": number (0-3, index of correct option)
    }
  ]
}
Return ONLY valid JSON.`;

    const aiResponse = await callAI(systemPrompt, `Generate a ${difficulty} quiz about: ${topic}`, true);

    let quiz;
    if (aiResponse) {
      try { quiz = JSON.parse(aiResponse); } catch(e) { quiz = getMockQuiz(topic); }
    } else {
      quiz = getMockQuiz(topic);
    }

    res.json({ ...quiz, source: aiResponse ? 'ai' : 'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/recommendations
router.post('/recommendations', auth, async (req, res) => {
  try {
    const { completedTopics = [], interests = [] } = req.body;
    const recommendations = [
      { title: 'Next.js Advanced Patterns', category: 'Frontend', reason: 'Based on your React progress', difficulty: 'intermediate' },
      { title: 'System Design Fundamentals', category: 'Architecture', reason: 'Popular among developers at your level', difficulty: 'intermediate' },
      { title: 'TypeScript Deep Dive', category: 'Languages', reason: 'Complements your JavaScript skills', difficulty: 'intermediate' },
      { title: 'Docker & Containerization', category: 'DevOps', reason: 'High demand skill in the industry', difficulty: 'beginner' },
    ];
    res.json({ recommendations, source: 'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
