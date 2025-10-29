import bcrypt from 'bcrypt';
import prisma from '../src/config/db.js';

try {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  // Create users
  const usersData = [
    {
      email: 'alice@student.edu',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1234567890',
    },
    {
      email: 'bob@student.edu',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Bob',
      lastName: 'Smith',
      phone: '+0987654321',
    },
    {
      email: 'admin@student.edu',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      phone: null,
      role: 'ADMIN',
    },
  ];

  const users = await Promise.all(
    usersData.map((user) => prisma.user.create({ data: user }))
  );
  console.log(`✅ Created ${users.length} users`);

  // Create listings
  const listingsData = [
    {
      title: 'Introduction to Computer Science Textbook',
      description: 'CS101 textbook in excellent condition. Barely used, no highlighting or writing. Perfect for incoming freshmen!',
      price: 45.00,
      condition: 'LIKE_NEW',
      category: 'TEXTBOOKS',
      images: ['https://example.com/cs-book.jpg'],
      sellerId: users[0].id,
    },
    {
      title: 'Scientific Calculator TI-84',
      description: 'Texas Instruments TI-84 Plus graphing calculator. Works perfectly, comes with cover.',
      price: 75.50,
      condition: 'GOOD',
      category: 'ELECTRONICS',
      images: ['https://example.com/calculator.jpg'],
      sellerId: users[0].id,
    },
    {
      title: 'Desk Lamp - Adjustable LED',
      description: 'Modern LED desk lamp with adjustable brightness and color temperature. Great for late-night studying!',
      price: 25.00,
      condition: 'NEW',
      category: 'FURNITURE',
      images: [],
      sellerId: users[1].id,
    },
    {
      title: 'Organic Chemistry Lab Manual',
      description: 'CHEM 201 lab manual. Some wear but all pages intact. Required for sophomore chemistry.',
      price: 30.00,
      condition: 'FAIR',
      category: 'TEXTBOOKS',
      images: ['https://example.com/chem-manual.jpg'],
      sellerId: users[1].id,
    },
    {
      title: 'Laptop Stand - Aluminum',
      description: 'Portable aluminum laptop stand. Helps with ergonomics and posture. Folds flat for easy transport.',
      price: 20.00,
      condition: 'USED',
      category: 'ELECTRONICS',
      images: ['https://example.com/laptop-stand.jpg'],
      sellerId: users[0].id,
    },
    {
      title: 'College Hoodie - Size M',
      description: 'Official college hoodie, size medium. Worn a few times, still in great shape.',
      price: 15.00,
      condition: 'GOOD',
      category: 'CLOTHING',
      images: [],
      sellerId: users[1].id,
    },
  ];

  const listings = await Promise.all(
    listingsData.map((listing) => prisma.listing.create({ data: listing }))
  );
  console.log(`✅ Created ${listings.length} listings`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Student 1: alice@student.edu / password123');
  console.log('   Student 2: bob@student.edu / password123');
  console.log('   Admin: admin@student.edu / admin123');

} catch (error) {
  console.error('❌ Seed failed:', error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}