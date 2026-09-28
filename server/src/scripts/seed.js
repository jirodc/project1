/**
 * Creates the first administrator (and optionally a demo teacher) so there is
 * someone who can sign in. Existing accounts are left untouched.
 *
 *   npm run seed
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { assertRequiredEnv, env } from '../config/environment.js';
import { User } from '../models/User.js';
import { passwordSchema } from '../validators/auth.validators.js';

const accounts = [
  {
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    required: true,
  },
  {
    email: process.env.SEED_TEACHER_EMAIL,
    password: process.env.SEED_TEACHER_PASSWORD,
    firstName: 'Demo',
    lastName: 'Teacher',
    role: 'teacher',
    required: false,
  },
];

async function seedAccount({ email, password, firstName, lastName, role, required }) {
  const label = `${role} account`;

  if (!email || !password) {
    if (required) {
      throw new Error(`SEED_${role.toUpperCase()}_EMAIL and SEED_${role.toUpperCase()}_PASSWORD must be set`);
    }
    console.log(`Skipping ${label}: no credentials configured`);
    return;
  }

  const passwordCheck = passwordSchema.safeParse(password);
  if (!passwordCheck.success) {
    throw new Error(`SEED_${role.toUpperCase()}_PASSWORD: ${passwordCheck.error.issues[0].message}`);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    console.log(`Skipping ${label}: ${normalizedEmail} already exists`);
    return;
  }

  await User.create({ email: normalizedEmail, password, firstName, lastName, role, status: 'active' });
  console.log(`Created ${label}: ${normalizedEmail}`);
}

async function seed() {
  assertRequiredEnv();
  await connectDatabase(env.mongodbUri);
  await User.init(); // ensure the unique email index exists

  try {
    for (const account of accounts) {
      await seedAccount(account);
    }
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((err) => {
  console.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
