const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const WellnessTip = require('../models/WellnessTip');
const WellnessResource = require('../models/WellnessResource');
const MeditationResource = require('../models/MeditationResource');
const Notification = require('../models/Notification');

dotenv.config();

const tipsData = [
  {
    title: '4-7-8 Breathing for Immediate Calm',
    description: 'When feeling overwhelmed, inhale quietly through your nose for 4 seconds, hold your breath for 7 seconds, and exhale completely through your mouth for 8 seconds. Repeat 4 cycles.',
    category: 'Stress Relief',
    condition: 'stress_high',
    active: true
  },
  {
    title: 'Decompress with the 20-20-20 Rule',
    description: 'Prolonged screen study sessions trigger mental fatigue. Every 20 minutes, look at an object 20 feet away for 20 seconds to release ocular and neurological tension.',
    category: 'Stress Relief',
    condition: 'stress_high',
    active: true
  },
  {
    title: 'Talk to Someone You Trust',
    description: 'High academic stress feels significantly lighter when shared. Send a message to a friend, counselor, or family member today.',
    category: 'Stress Relief',
    condition: 'stress_high',
    active: true
  },
  {
    title: 'Wind-Down Routine Before Sleep',
    description: 'Turn off blue-light devices at least 45 minutes prior to sleep. Reading a physical book or listening to low-tempo ambient sound cues melatonin production.',
    category: 'Sleep Hygiene',
    condition: 'sleep_low',
    active: true
  },
  {
    title: 'Consistent Sleep & Wake Windows',
    description: 'Going to bed and waking up at consistent times anchors your circadian clock, improving deep sleep phases and daytime memory retention.',
    category: 'Sleep Hygiene',
    condition: 'sleep_low',
    active: true
  },
  {
    title: 'Gentle Sunlight & Morning Movement',
    description: 'When you wake up feeling low in energy, step outside for 10 minutes of direct sunlight. Natural light elevates serotonin levels and resets wakefulness.',
    category: 'Mood Boost',
    condition: 'mood_low',
    active: true
  },
  {
    title: 'Daily Gratitude & Journaling',
    description: 'Jot down 3 small wins or things you are grateful for in your MindCare journal. Shifting attention to positive micro-moments rewires negative cognitive loops.',
    category: 'Mood Boost',
    condition: 'mood_low',
    active: true
  },
  {
    title: 'Hydration and Brain Performance',
    description: 'Even mild 2% dehydration impairs concentration and induces headaches during study sessions. Keep a water bottle at your desk and sip regularly.',
    category: 'Physical Health',
    condition: 'general',
    active: true
  },
  {
    title: 'The Pomodoro Academic Flow',
    description: 'Study with full focus for 25 minutes, then take a genuine 5-minute break (away from screens). After 4 cycles, reward yourself with a 20-minute break.',
    category: 'Study Life Balance',
    condition: 'general',
    active: true
  },
  {
    title: 'Mindful Grounding with 5-4-3-2-1',
    description: 'Notice 5 things you can see, 4 things you can touch, 3 sounds you can hear, 2 scents you can smell, and 1 positive affirmation.',
    category: 'Mindfulness',
    condition: 'general',
    active: true
  }
];

const resourcesData = [
  {
    title: 'Tele-MANAS Comprehensive Mental Health Care',
    description: 'Government of India 24x7 free national tele-mental health helpline providing immediate psychological support to students across languages.',
    category: 'Support',
    url: 'https://telemanas.mohfw.gov.in/',
    icon: '📞',
    active: true
  },
  {
    title: 'KIRAN National Mental Health Helpline (1800-599-0019)',
    description: 'Toll-free 24/7 helpline by the Ministry of Social Justice and Empowerment for anxiety, depressive episodes, exam pressure, and suicide prevention.',
    category: 'Support',
    url: 'https://disabilityaffairs.gov.in/content/page/kiran.php',
    icon: '🆘',
    active: true
  },
  {
    title: 'Harvard Health: Understanding the Stress Response',
    description: 'Medical insights on how academic stress impacts the student nervous system and evidence-backed lifestyle counter-measures.',
    category: 'Stress Management',
    url: 'https://www.health.harvard.edu/staying-healthy/understanding-the-stress-response',
    icon: '🧠',
    active: true
  },
  {
    title: 'UCLA Mindful Awareness Research Center',
    description: 'Free guided audio meditations and scientific research into how mindfulness enhances student cognitive resilience.',
    category: 'Meditation',
    url: 'https://www.uclahealth.org/programs/marc/free-guided-meditations',
    icon: '🧘',
    active: true
  },
  {
    title: 'National Sleep Foundation: Sleep for College Students',
    description: 'Detailed guidelines on optimal sleep architecture, circadian rhythm alignment, and avoiding exam-week sleep deprivation.',
    category: 'Sleep',
    url: 'https://www.thensf.org/sleep-for-college-students/',
    icon: '🌙',
    active: true
  },
  {
    title: 'MIT Academic Work-Life Balance Guide',
    description: 'Practical scheduling strategies and boundaries to excel in coursework while preserving mental and physical health.',
    category: 'Study Balance',
    url: 'https://studentlife.mit.edu/wellness',
    icon: '⚖️',
    active: true
  },
  {
    title: 'Time Management Matrix for Higher Education',
    description: 'Eisenhower matrix framework adapted for college workloads, assignments, exam preparation, and personal downtime.',
    category: 'Time Management',
    url: 'https://students.dartmouth.edu/academic-skills/learning-resources/time-management',
    icon: '⏱️',
    active: true
  },
  {
    title: 'Mayo Clinic: Exercise and Stress Relief',
    description: 'Exploration of endorphin release, mood enhancement, and cardiovascular benefits from moderate daily student physical activity.',
    category: 'Exercise',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/exercise-and-stress/art-20044469',
    icon: '🏃',
    active: true
  },
  {
    title: 'Mindful.org: Mindful Breathing Techniques',
    description: 'Clear illustrated instructions for beginners on body scan, box breathing, and somatic awareness during study breaks.',
    category: 'Mindfulness',
    url: 'https://www.mindful.org/how-to-meditate/',
    icon: '🌿',
    active: true
  },
  {
    title: 'WHO Student Mental Well-being Guidelines',
    description: 'World Health Organization framework for youth mental health promotion and preventative self-care strategies.',
    category: 'General Wellness',
    url: 'https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health',
    icon: '🌐',
    active: true
  }
];

const meditationData = [
  {
    title: 'Box Breathing (Sama Vritti)',
    description: 'Equal duration 4-count breathing technique used by athletes and students to quickly restore nervous system equilibrium.',
    category: 'Breathing',
    duration: 5,
    url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    active: true
  },
  {
    title: '4-7-8 Deep Sleep Induction Breathing',
    description: 'Dr. Andrew Weil technique that acts as a natural tranquilizer for the nervous system, helping ease restlessness before bedtime.',
    category: 'Sleep Meditation',
    duration: 7,
    url: 'https://www.youtube.com/watch?v=1Dv-ldGLnIY',
    active: true
  },
  {
    title: 'Quick 3-Minute Academic Reset',
    description: 'A brief pause designed for between study lectures to release tension in the shoulders, neck, and mind.',
    category: 'Focus & Study',
    duration: 3,
    url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    active: true
  },
  {
    title: 'Full Body Scan Relaxation',
    description: 'Systematically bring gentle awareness to each part of your body from head to toe, letting go of stored physical strain.',
    category: 'Body Scan',
    duration: 10,
    url: 'https://www.youtube.com/watch?v=15q-N-_kkrU',
    active: true
  },
  {
    title: 'Exam Anxiety Relief Meditation',
    description: 'Guided visualization and soothing breathing instructions to dissolve anticipatory stress before tests and presentations.',
    category: 'Stress Release',
    duration: 8,
    url: 'https://www.youtube.com/watch?v=MIr3RsUWrdo',
    active: true
  },
  {
    title: 'Mindful Awareness of Breath & Sound',
    description: 'Learn to anchor your attention in the present moment without judging thoughts or distractions.',
    category: 'Mindfulness',
    duration: 10,
    url: 'https://www.youtube.com/watch?v=YFSc7Ck0Ao0',
    active: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare');
    console.log('[Seed] Connected to MongoDB Atlas...');

    // 1. Seed Demo Accounts
    await User.deleteMany({ email: { $in: ['admin@mindcare.edu', 'student@mindcare.edu'] } });

    const adminUser = await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@mindcare.edu',
      password: 'Admin@123',
      role: 'admin',
      emailVerified: true,
      isActive: true,
      bio: 'Campus Wellness Director & Lead Mental Health Advisor'
    });

    const studentUser = await User.create({
      name: 'Alex Morgan',
      email: 'student@mindcare.edu',
      password: 'Student@123',
      role: 'student',
      emailVerified: true,
      isActive: true,
      bio: 'BSc IT Final Year Student passionate about mindful living'
    });

    // 2. Seed Tips
    await WellnessTip.deleteMany({});
    await WellnessTip.insertMany(tipsData);
    console.log(`[Seed] Seeded ${tipsData.length} wellness tips.`);

    // 3. Seed Resources
    await WellnessResource.deleteMany({});
    await WellnessResource.insertMany(resourcesData);
    console.log(`[Seed] Seeded ${resourcesData.length} wellness resources.`);

    // 4. Seed Meditation Guides
    await MeditationResource.deleteMany({});
    await MeditationResource.insertMany(meditationData);
    console.log(`[Seed] Seeded ${meditationData.length} meditation resources.`);

    // 5. Seed Welcome Notification for student
    await Notification.deleteMany({ userId: studentUser._id });
    await Notification.create({
      userId: studentUser._id,
      type: 'wellness',
      title: 'Welcome to MindCare! 🌿',
      message: 'Take a moment to record your mood today, check your stress levels, and explore the interactive breathing timer.',
      read: false
    });

    console.log('\n[Seed Complete] Demonstration Database Populated:');
    console.log('  👉 Admin Account   : admin@mindcare.edu / Admin@123 (Verified Admin)');
    console.log('  👉 Student Account : student@mindcare.edu / Student@123 (Verified Student)');
    console.log('  👉 Content Seeded  : Tips, Resources, Meditation Guides, Notifications.\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
