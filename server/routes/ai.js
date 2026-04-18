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

// ─── AI Helpers ───────────────────────────────────────────────────────────────

const repairJSON = (str) => {
  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return str;
  } catch (e) {
    return str;
  }
};

const callAI = async (systemPrompt, userMessage, jsonMode = false, maxTokens = 1500) => {
  if (!groq) return null;
  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
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

const callAIChat = async (messages, maxTokens = 1200) => {
  if (!groq) return null;
  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const response = await groq.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.5,
    });
    return response.choices[0]?.message?.content;
  } catch (err) {
    console.warn('Groq chat error:', err.message);
    return null;
  }
};

// ─── POST /ai/generate-profile ───────────────────────────────────────────────
// Called after onboarding to generate a personalized AI profile
router.post('/generate-profile', auth, async (req, res) => {
  try {
    const { role, education, skills, experience_level, interests, goals, time_commitment, learning_style, strengths, weaknesses, target_timeline } = req.body;

    const systemPrompt = `You are an expert career counselor and learning architect. Based on a user's profile, generate a detailed, personalized AI learning profile as JSON with this EXACT structure:
{
  "level": "beginner|intermediate|advanced",
  "recommended_paths": [
    { "title": "string", "description": "string", "skills": ["string"], "estimatedWeeks": number, "priority": "primary|secondary" }
  ],
  "weak_areas": [
    { "area": "string", "suggestion": "string" }
  ],
  "strengths": [
    { "area": "string", "detail": "string" }
  ],
  "roadmap": [
    { "week": "string", "title": "string", "tasks": ["string"], "milestone": "string" }
  ],
  "alternative_paths": [
    { "title": "string", "description": "string", "reason": "string" }
  ]
}
Generate 3-4 recommended_paths, 3-4 weak_areas, 2-3 strengths, 8-12 weeks of roadmap, and 2-3 alternative_paths.
Return ONLY valid JSON.`;

    const userMsg = `Generate a learning profile for:
- Role: ${role}
- Education: ${education}
- Current Skills: ${(skills || []).join(', ')}
- Experience Level: ${experience_level}
- Interests: ${(interests || []).join(', ')}
- Career Goals: ${goals}
- Time Commitment: ${time_commitment}
- Learning Style: ${learning_style}
- Strengths: ${strengths}
- Weaknesses: ${weaknesses}
- Target Timeline: ${target_timeline}`;

    const aiResponse = await callAI(systemPrompt, userMsg, true, 2500);

    let profile;
    if (aiResponse) {
      try { profile = JSON.parse(aiResponse); } catch(e) { profile = getDefaultProfile(skills, experience_level, interests, goals); }
    } else {
      profile = getDefaultProfile(skills, experience_level, interests, goals);
    }

    // Store in ai_profiles table (upsert)
    if (supabase) {
      const { data: existing } = await supabase.from('ai_profiles').select('id').eq('user_id', req.user.id).single();
      
      if (existing) {
        await supabase.from('ai_profiles').update({
          level: profile.level,
          recommended_paths: profile.recommended_paths,
          weak_areas: profile.weak_areas,
          strengths: profile.strengths,
          roadmap: profile.roadmap,
          alternative_paths: profile.alternative_paths,
        }).eq('user_id', req.user.id);
      } else {
        await supabase.from('ai_profiles').insert([{
          user_id: req.user.id,
          level: profile.level,
          recommended_paths: profile.recommended_paths,
          weak_areas: profile.weak_areas,
          strengths: profile.strengths,
          roadmap: profile.roadmap,
          alternative_paths: profile.alternative_paths,
        }]);
      }
    }

    res.json({ profile, source: aiResponse ? 'ai' : 'fallback' });
  } catch (err) {
    console.error('generate-profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /ai/profile ─────────────────────────────────────────────────────────
// Fetch the user's AI profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('ai_profiles').select('*').eq('user_id', req.user.id).single();
      if (data && !error) return res.json(data);
    }
    res.json(null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai/mentor-chat ────────────────────────────────────────────────────
// Individual AI mentor interaction (No history saved)
router.post('/mentor-chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Fetch user data and AI profile for context
    let userContext = '';
    if (supabase) {
      const [{ data: userData }, { data: profileData }] = await Promise.all([
        supabase.from('users').select('name, role, skills, interests, experience_level, goals, strengths, weaknesses').eq('id', req.user.id).single(),
        supabase.from('ai_profiles').select('level, weak_areas').eq('user_id', req.user.id).single(),
      ]);
      if (userData) {
        userContext = `\n\nUser Context:
- Name: ${userData.name}
- Interests: ${(userData.interests || []).join(', ')}
- Goal: ${userData.goals || 'Improve skills'}`;
      }
    }

    const systemPrompt = `You are Mentra, a personalized AI mentor. 
GUIDELINES:
1. Be direct and actionable.
2. By default, keep responses concise (1-3 paragraphs).
3. If the user asks for more detail or a specific length, fulfill their request accurately.
4. No excessive pleasantries or fluff.
${userContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const reply = await callAIChat(messages, 800); 

    if (!reply) {
      return res.json({ 
        reply: `I understand your question about "${message}". Start with project-based learning and build something small today!`,
        source: 'fallback' 
      });
    }

    // Chat history saving removed as per request

    res.json({ reply, source: 'ai' });
  } catch (err) {
    console.error('mentor-chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /ai/mentor-chat/history ─────────────────────────────────────────────
router.get('/mentor-chat/history', auth, async (req, res) => {
  // Return empty history as per request
  res.json({ messages: [] });
});

// ─── GET /ai/next-action ─────────────────────────────────────────────────────
// Fetch or generate the next actionable task for the user
router.get('/next-action', auth, async (req, res) => {
  try {
    if (supabase) {
      // Check for a pending action
      const { data: existing } = await supabase.from('next_actions')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (existing) return res.json(existing);
    }

    // Generate a new one
    const { data: userData } = await supabase.from('users').select('*').eq('id', req.user.id).single();
    const { data: history } = await supabase.from('user_activity').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(5);
    const { data: chat } = await supabase.from('ai_chats').select('messages').eq('user_id', req.user.id).limit(1).single();

    const systemPrompt = `You are Mentra, a hyper-focused AI coach. Your goal is to give the user ONE specific "Next Action" to take today. 
The action should be manageable (15-60 mins) and directly related to their interests: ${(userData?.interests || []).join(', ')}.
Output EXACTLY this JSON:
{
  "action": "Brief title of the task",
  "reason": "Why this is important now",
  "estimated_time": "Time in mins (e.g. 30 mins)"
}
Return ONLY valid JSON.`;

    const userMsg = `Username: ${userData?.name}. Skills: ${(userData?.skills || []).join(', ')}. Recent history: ${JSON.stringify(history)}. Recent Chat: ${JSON.stringify(chat?.messages?.slice(-3))}. Generate my next action.`;

    const aiRes = await callAI(systemPrompt, userMsg, true, 800);
    let actionData;
    try {
      actionData = JSON.parse(aiRes);
    } catch(e) {
      actionData = {
        action: "Build a small mini-project",
        reason: "Applying your skills to a real-world use case is the fastest way to learn.",
        estimated_time: "45 mins"
      };
    }

    if (supabase) {
      const { data: savedAction } = await supabase.from('next_actions').insert([{
        user_id: req.user.id,
        ...actionData,
        status: 'pending'
      }]).select().single();
      return res.json(savedAction);
    }

    res.json(actionData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai/next-action/status ─────────────────────────────────────────────
router.post('/next-action/status', auth, async (req, res) => {
  try {
    const { id, status } = req.body; // status: 'completed' or 'skipped'
    if (supabase) {
      await supabase.from('next_actions').update({ status }).eq('id', id).eq('user_id', req.user.id);
      
      // If completed, add to user activity
      if (status === 'completed') {
        const { data: action } = await supabase.from('next_actions').select('action').eq('id', id).single();
        await supabase.from('user_activity').insert([{
          user_id: req.user.id,
          activity_type: 'next_action_complete',
          question: action?.action || 'Action Completed',
          answer: 'Completed successfully'
        }]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai/chat (kept for AI assistant page) ──────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const systemPrompt = `You are Mentra, an expert AI learning assistant and mentor. You help students learn programming, technology, and academic subjects. You're encouraging, clear, and provide practical examples. Keep answers concise but complete. Format code using markdown code blocks.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(m => ({ role: m.role || 'user', content: m.content || m })),
      { role: 'user', content: message },
    ];

    const reply = await callAIChat(messages);

    if (!reply) {
      return res.json({ 
        reply: `Great question about "${message}"! Let me break it down:\n\n1. **Start with fundamentals** — Build a solid foundation\n2. **Practice** — Build small projects\n3. **Explore further** — Dive deeper as you gain confidence\n\nWould you like me to elaborate on any of these?`,
        source: 'fallback' 
      });
    }

    res.json({ reply, source: 'ai' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai/quiz ───────────────────────────────────────────────────────────
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
      try { quiz = JSON.parse(aiResponse); } catch(e) { quiz = getDefaultQuiz(topic); }
    } else {
      quiz = getDefaultQuiz(topic);
    }

    res.json({ ...quiz, source: aiResponse ? 'ai' : 'fallback' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai/recommendations (now dynamic) ─────────────────────────────────
router.post('/recommendations', auth, async (req, res) => {
  try {
    // Fetch user AI profile for context
    let profileContext = '';
    if (supabase) {
      const { data: profile } = await supabase.from('ai_profiles').select('*').eq('user_id', req.user.id).single();
      if (profile) {
        profileContext = `User level: ${profile.level}. Current paths: ${JSON.stringify(profile.recommended_paths?.slice(0, 2))}. Weak areas: ${JSON.stringify(profile.weak_areas)}`;
      }
    }

    if (profileContext && groq) {
      const systemPrompt = `Based on the user's AI profile, generate 4 personalized learning recommendations as JSON:
{
  "recommendations": [
    { "title": "string", "category": "string", "reason": "string", "difficulty": "beginner|intermediate|advanced" }
  ]
}
Return ONLY valid JSON.`;
      const aiResponse = await callAI(systemPrompt, profileContext, true);
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          return res.json({ recommendations: parsed.recommendations, source: 'ai' });
        } catch(e) {}
      }
    }

    // Fallback
    const { interests = [] } = req.body;
    const topic = interests[0] || 'Technology';
    res.json({
      recommendations: [
        { title: `Advanced ${topic} Patterns`, category: topic, reason: 'Based on your profile', difficulty: 'intermediate' },
        { title: 'System Design Fundamentals', category: 'Architecture', reason: 'Essential for career growth', difficulty: 'intermediate' },
        { title: 'Data Structures & Algorithms', category: 'CS Fundamentals', reason: 'Core competency', difficulty: 'intermediate' },
      ],
      source: 'fallback'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Fallback Generators ─────────────────────────────────────────────────────

function getDefaultProfile(skills, experience_level, interests, goals) {
  return {
    level: experience_level || 'beginner',
    recommended_paths: [
      { title: `${(interests || ['Web Development'])[0]} Mastery`, description: `A comprehensive path to master ${(interests || ['Web Development'])[0]}`, skills: skills || ['JavaScript'], estimatedWeeks: 12, priority: 'primary' },
      { title: 'CS Fundamentals', description: 'Strengthen your computer science foundations', skills: ['Data Structures', 'Algorithms'], estimatedWeeks: 8, priority: 'secondary' },
    ],
    weak_areas: [
      { area: 'System Design', suggestion: 'Start with basic design patterns and scale up' },
      { area: 'Testing', suggestion: 'Learn unit testing frameworks for your primary language' },
    ],
    strengths: [
      { area: (skills || ['Problem Solving'])[0], detail: 'Strong foundation to build upon' },
    ],
    roadmap: [
      { week: 'Week 1-2', title: 'Foundations', tasks: ['Review core concepts', 'Set up development environment', 'Complete introductory tutorials'], milestone: 'Environment ready' },
      { week: 'Week 3-4', title: 'Core Skills', tasks: ['Deep dive into primary technology', 'Build first mini-project', 'Practice exercises'], milestone: 'First project complete' },
      { week: 'Week 5-6', title: 'Intermediate', tasks: ['Learn design patterns', 'Build portfolio project', 'Code review practices'], milestone: 'Portfolio project started' },
      { week: 'Week 7-8', title: 'Advanced Practice', tasks: ['Tackle complex problems', 'Contribute to open source', 'Practice interviews'], milestone: 'Ready for challenges' },
    ],
    alternative_paths: [
      { title: 'DevOps & Cloud', description: 'Learn cloud infrastructure and CI/CD', reason: 'High demand and complements development skills' },
      { title: 'Mobile Development', description: 'Build cross-platform mobile apps', reason: 'Growing market with strong career prospects' },
    ],
  };
}

function getDefaultLearningPath(interests, skillLevel) {
  return {
    title: `Personalized ${interests[0] || 'Technology'} Learning Path`,
    description: `A curated learning journey tailored for a ${skillLevel} learner interested in ${interests.join(', ')}.`,
    category: interests[0] || 'Technology',
    totalEstimatedHours: 45,
    topics: [
      { title: 'Foundations & Core Concepts', description: 'Build a solid understanding of the fundamentals.', estimatedHours: 8, difficulty: 'beginner', order: 1, resources: [{ title: 'Official Documentation', url: '#', type: 'docs' }, { title: 'Beginner Video Course', url: '#', type: 'video' }] },
      { title: 'Intermediate Patterns & Best Practices', description: 'Learn how professionals approach common problems.', estimatedHours: 12, difficulty: 'intermediate', order: 2, resources: [{ title: 'Advanced Tutorial Series', url: '#', type: 'video' }] },
      { title: 'Building Real Projects', description: 'Apply your knowledge to hands-on projects.', estimatedHours: 15, difficulty: 'intermediate', order: 3, resources: [{ title: 'Project Ideas', url: '#', type: 'article' }] },
      { title: 'Advanced Topics & Optimization', description: 'Deep-dive into performance and advanced patterns.', estimatedHours: 10, difficulty: 'advanced', order: 4, resources: [{ title: 'Research Papers', url: '#', type: 'paper' }] },
    ],
  };
}

function getDefaultQuiz(topic) {
  return {
    topic,
    questions: [
      { id: 1, question: `What is the primary purpose of ${topic}?`, options: ['To simplify complex logic', 'To enhance performance', 'To structure code better', 'All of the above'], answer: 3 },
      { id: 2, question: `Which of the following best describes a key concept in ${topic}?`, options: ['Encapsulation', 'Polymorphism', 'Abstraction', 'Inheritance'], answer: 0 },
      { id: 3, question: `What tool is commonly used alongside ${topic}?`, options: ['Git', 'Docker', 'Kubernetes', 'All of the above'], answer: 3 },
      { id: 4, question: `In ${topic}, what does "state management" refer to?`, options: ['Managing server state', 'Managing UI data over time', 'Managing database records', 'Managing API calls'], answer: 1 },
      { id: 5, question: `Which is a best practice when working with ${topic}?`, options: ['Write large, monolithic functions', 'Avoid testing', 'Use modular, reusable components', 'Ignore error handling'], answer: 2 },
    ],
  };
}

module.exports = router;
