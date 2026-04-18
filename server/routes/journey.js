const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// ─── AI Helper (Groq) ───────────────────────────────────────────────────────
let groq = null;
try {
  const Groq = require('groq-sdk');
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== 'gsk_your_groq_api_key_here') {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() });
  }
} catch (e) {}

/**
 * Generate journey days with topics, resources, and quiz questions
 */
const generateJourneyDays = async (goal, experienceLevel, durationDays) => {
  if (!groq) return null;
  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert learning path designer. Generate a structured day-by-day learning plan with quizzes.

For each day, provide:
- topic: The specific concept to learn
- title: A concise task title
- description: What the user should do (2-3 sentences)
- resource: A relevant YouTube search URL in format "https://www.youtube.com/results?search_query=TOPIC+tutorial+${experienceLevel}"
- questions: Exactly 5 multiple-choice questions about that day's topic

Output EXACTLY this JSON:
{
  "days": [
    {
      "day": 1,
      "topic": "Topic Name",
      "title": "Day 1: Task title",
      "description": "Detailed description",
      "resource": "https://www.youtube.com/results?search_query=...",
      "questions": [
        { "question": "Question text?", "options": ["Correct Text", "Wrong Text 1", "Wrong Text 2", "Wrong Text 3"], "answer": "Correct Text" }
      ]
    }
  ]
}

Generate exactly ${durationDays} days. Each day must have exactly 5 questions. The "answer" field MUST match one of the strings in the "options" array exactly. Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: `Create a ${durationDays}-day journey for: "${goal}". Level: ${experienceLevel}.`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('Journey AI error:', err.message);
    return null;
  }
};

/**
 * Fallback day generator when AI fails
 */
const generateFallbackDays = (goal, level, durationDays) => {
  const days = [];
  for (let d = 1; d <= durationDays; d++) {
    const phase = d <= durationDays / 3 ? 'Fundamentals' : d <= (2 * durationDays) / 3 ? 'Practice' : 'Advanced';
    days.push({
      day: d,
      topic: `${goal} - ${phase} (Day ${d})`,
      title: `Day ${d}: ${phase}`,
      description: `Study ${goal} ${phase.toLowerCase()} concepts at ${level} level. Watch tutorials and practice.`,
      resource: `https://www.youtube.com/results?search_query=${encodeURIComponent(goal)}+${phase.toLowerCase()}+tutorial+${level}`,
      questions: [
        { question: `What is a key concept in ${goal} ${phase.toLowerCase()}?`, options: ['Foundation building', 'Random guessing', 'Skipping ahead', 'Ignoring basics'], answer: 'Foundation building' },
        { question: `Best approach for learning ${goal}?`, options: ['Consistent practice', 'Cramming', 'Memorization only', 'Passive reading'], answer: 'Consistent practice' },
        { question: `Which resource helps most for ${level} learners?`, options: ['Structured tutorials', 'Advanced papers', 'Random blogs', 'Social media'], answer: 'Structured tutorials' },
        { question: `What should you do after watching a tutorial?`, options: ['Practice immediately', 'Watch another', 'Take a long break', 'Skip exercises'], answer: 'Practice immediately' },
        { question: `How do you measure progress in ${goal}?`, options: ['Build projects', 'Count hours', 'Read more theory', 'Avoid testing'], answer: 'Build projects' },
      ],
    });
  }
  return days;
};

// ─── POST /journey/start ─────────────────────────────────────────────────────
// Create a new journey with AI-generated content, quizzes, and locked progression
router.post('/start', auth, async (req, res) => {
  try {
    const { goal, experience_level, duration_days } = req.body;
    if (!goal?.trim()) return res.status(400).json({ error: 'Goal is required' });

    const days = Math.min(Math.max(parseInt(duration_days) || 7, 3), 30);
    const level = experience_level || 'beginner';

    // Deactivate existing active journeys
    await supabase.from('journeys').update({ status: 'completed' }).eq('user_id', req.user.id).eq('status', 'active');

    // Create journey record
    const { data: journey, error: jErr } = await supabase.from('journeys').insert([{
      user_id: req.user.id,
      goal: goal.trim(),
      experience_level: level,
      duration_days: days,
      status: 'active',
    }]).select().single();

    if (jErr) throw jErr;

    // Generate days with AI (or fallback)
    const aiResult = await generateJourneyDays(goal, level, days);
    const dayList = aiResult?.days?.length > 0 ? aiResult.days : generateFallbackDays(goal, level, days);

    // Insert tasks — only day 1 is unlocked
    const taskRows = dayList.map(d => ({
      journey_id: journey.id,
      title: d.title,
      description: d.description,
      day_number: d.day,
      topic: d.topic || '',
      resource_link: d.resource || '',
      quiz: d.questions || [],
      is_completed: false,
      is_unlocked: d.day === 1, // Only day 1 starts unlocked
      score: 0,
    }));

    const { data: savedTasks, error: tErr } = await supabase.from('journey_tasks').insert(taskRows).select();
    if (tErr) throw tErr;

    res.status(201).json({ journey, tasks: savedTasks });
  } catch (err) {
    console.error('Journey start error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /journey/me ─────────────────────────────────────────────────────────
// Get the user's active journey + all tasks
router.get('/me', auth, async (req, res) => {
  try {
    const { data: journey } = await supabase.from('journeys')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!journey) return res.json(null);

    const { data: tasks } = await supabase.from('journey_tasks')
      .select('*')
      .eq('journey_id', journey.id)
      .order('day_number', { ascending: true });

    const total = tasks?.length || 0;
    const completed = tasks?.filter(t => t.is_completed).length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Current day = first unlocked but not completed, or last day
    const currentTask = tasks?.find(t => t.is_unlocked && !t.is_completed);
    const currentDay = currentTask?.day_number || (completed === total ? total : 1);

    res.json({ ...journey, tasks: tasks || [], progress, currentDay, completedDays: completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /journey/tasks/today ────────────────────────────────────────────────
// Get the current unlocked task for dashboard
router.get('/tasks/today', auth, async (req, res) => {
  try {
    const { data: journey } = await supabase.from('journeys')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!journey) return res.json({ tasks: [], journey: null });

    // Get the current unlocked + incomplete task
    const { data: currentTasks } = await supabase.from('journey_tasks')
      .select('*')
      .eq('journey_id', journey.id)
      .eq('is_unlocked', true)
      .eq('is_completed', false)
      .order('day_number', { ascending: true })
      .limit(1);

    // Progress
    const { data: allTasks } = await supabase.from('journey_tasks')
      .select('is_completed')
      .eq('journey_id', journey.id);

    const total = allTasks?.length || 0;
    const completed = allTasks?.filter(t => t.is_completed).length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const currentDay = currentTasks?.[0]?.day_number || (completed === total ? total : 1);

    res.json({ tasks: currentTasks || [], journey, progress, currentDay, completedDays: completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /journey/task/:taskId/submit-quiz ──────────────────────────────────
// Submit quiz answers, evaluate, unlock next day if passed
router.post('/task/:taskId/submit-quiz', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { answers } = req.body; // Array of user's answer strings

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Fetch the task
    const { data: task } = await supabase.from('journey_tasks')
      .select('*, journeys!inner(user_id, id)')
      .eq('id', taskId)
      .single();

    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.journeys.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    if (!task.is_unlocked) return res.status(403).json({ error: 'This day is locked' });

    // Calculate score
    const quiz = task.quiz || [];
    let correct = 0;
    const results = quiz.map((q, i) => {
      const rawUserAns = (answers[i] || "").toString().trim();
      const rawCorrectAns = (q.answer || "").toString().trim();
      
      console.log(`Checking Q${i+1}: User='${rawUserAns}', Correct='${rawCorrectAns}'`);
      
      let isCorrect = rawUserAns.toLowerCase() === rawCorrectAns.toLowerCase();
      
      // Fallback: If AI provided a letter (A, B, C, D) as the answer
      if (!isCorrect && rawCorrectAns.length === 1) {
        const letterMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        const index = letterMap[rawCorrectAns.toLowerCase()];
        if (index !== undefined && q.options && q.options[index]) {
          const mappedAns = q.options[index].toString().trim();
          console.log(`  Letter fallback: Mapped '${rawCorrectAns}' to '${mappedAns}'`);
          isCorrect = rawUserAns.toLowerCase() === mappedAns.toLowerCase();
        }
      }
      
      console.log(`  Result: ${isCorrect ? 'MATCH ✅' : 'FAIL ❌'}`);
      
      if (isCorrect) correct++;
      return { question: q.question, userAnswer: answers[i], correctAnswer: q.answer, isCorrect };
    });

    const score = quiz.length > 0 ? Math.round((correct / quiz.length) * 100) : 0;
    const passed = score >= 80;

    // Update task score
    await supabase.from('journey_tasks').update({ score }).eq('id', taskId);

    if (passed) {
      // Mark task as completed
      await supabase.from('journey_tasks').update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        score,
      }).eq('id', taskId);

      // Unlock next day
      const nextDay = task.day_number + 1;
      await supabase.from('journey_tasks').update({ is_unlocked: true })
        .eq('journey_id', task.journeys.id)
        .eq('day_number', nextDay);

      // Check for 7-day streak rewards
      const { data: allTasks } = await supabase.from('journey_tasks')
        .select('is_completed')
        .eq('journey_id', task.journeys.id);

      const completedCount = allTasks?.filter(t => t.is_completed).length || 0;
      let reward = null;

      if (completedCount > 0 && completedCount % 7 === 0) {
        // Award a streak reward
        const rewardTexts = [
          '🎉 7-Day Learning Champion! You earned a "Focus Master" badge!',
          '🔥 14-Day Streak! You earned a "Consistency King" badge!',
          '💎 21-Day Streak! You earned a "Knowledge Pro" badge + 20% off courses!',
          '🏆 28-Day Streak! You earned a "Learning Legend" badge + Premium Access!',
        ];

        const rewardText = rewardTexts[Math.min(Math.floor(completedCount / 7) - 1, rewardTexts.length - 1)];

        const { data: savedReward } = await supabase.from('rewards').insert([{
          user_id: req.user.id,
          reward_text: rewardText,
          milestone_days: completedCount,
        }]).select().single();

        reward = savedReward;
      }

      // Check if journey is fully complete
      const totalTasks = allTasks?.length || 0;
      if (completedCount === totalTasks) {
        await supabase.from('journeys').update({ status: 'completed' }).eq('id', task.journeys.id);
      }

      return res.json({
        passed: true,
        score,
        correct,
        total: quiz.length,
        results,
        reward,
        journeyComplete: completedCount === totalTasks,
      });
    }

    // Failed
    res.json({
      passed: false,
      score,
      correct,
      total: quiz.length,
      results,
      message: 'You need at least 80% to pass. Review the material and try again!',
    });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /journey/rewards ────────────────────────────────────────────────────
// Get user's earned rewards
router.get('/rewards', auth, async (req, res) => {
  try {
    const { data } = await supabase.from('rewards')
      .select('*')
      .eq('user_id', req.user.id)
      .order('unlocked_at', { ascending: false });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
