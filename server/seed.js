const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/database');
const User = require('./src/models/User');
const Category = require('./src/models/Category');

const seed = async () => {
  await connectDB();

  // Create admin user
  const existingAdmin = await User.findOne({ email: 'admin@eventflow.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'EventFlow Admin',
      email: 'admin@eventflow.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log('✅ Admin user created: admin@eventflow.com');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed 10 core categories
  const categories = [
    { name: 'Technology', icon: 'Cpu', color: '#6366f1', description: 'Tech conferences, hackathons, and developer meetups' },
    { name: 'Music', icon: 'Music', color: '#ec4899', description: 'Concerts, festivals, and music performances' },
    { name: 'Business', icon: 'Briefcase', color: '#f59e0b', description: 'Networking events, seminars, and corporate conferences' },
    { name: 'Arts & Culture', icon: 'Palette', color: '#8b5cf6', description: 'Art exhibitions, cultural events, and creative workshops' },
    { name: 'Sports & Fitness', icon: 'Dumbbell', color: '#10b981', description: 'Sports events, marathons, and fitness workshops' },
    { name: 'Food & Drink', icon: 'UtensilsCrossed', color: '#f97316', description: 'Food festivals, wine tastings, and culinary experiences' },
    { name: 'Education', icon: 'GraduationCap', color: '#3b82f6', description: 'Workshops, seminars, and learning events' },
    { name: 'Health & Wellness', icon: 'Heart', color: '#ef4444', description: 'Wellness retreats, yoga events, and health conferences' },
    { name: 'Gaming', icon: 'Gamepad2', color: '#a855f7', description: 'Gaming tournaments, eSports events, and game launches' },
    { name: 'Community', icon: 'Users', color: '#14b8a6', description: 'Community meetups, volunteer events, and social gatherings' },
  ];

  for (const cat of categories) {
    const existing = await Category.findOne({ name: cat.name });
    if (!existing) {
      await Category.create(cat);
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  console.log('\n🎉 EventFlow Database Seeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed Error] Failed to complete database seeding.');
  process.exit(1);
});
