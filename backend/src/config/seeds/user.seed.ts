import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { UserProfile } from '../../users/entities/user-profile.entity';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../master.config';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const profileRepository = dataSource.getRepository(UserProfile);

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_ROUNDS);

  // Create Admin User
  const adminUser = userRepository.create({
    email: 'admin@lexiflow.com',
    passwordHash: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.SUPER_ADMIN,
    department: 'Administration',
    title: 'System Administrator',
    phone: '555-0100',
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });
  await userRepository.save(adminUser);

  const adminProfile = profileRepository.create({
    userId: adminUser.id,
    bio: 'System administrator with full access to all features.',
    skills: ['Administration', 'System Management', 'User Management'],
    yearsOfExperience: 10,
  });
  await profileRepository.save(adminProfile);

  // Create Partner
  const partnerUser = userRepository.create({
    email: 'john.partner@lexiflow.com',
    passwordHash: hashedPassword,
    firstName: 'John',
    lastName: 'Partner',
    role: UserRole.PARTNER,
    department: 'Litigation',
    title: 'Senior Partner',
    phone: '555-0101',
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });
  await userRepository.save(partnerUser);

  const partnerProfile = profileRepository.create({
    userId: partnerUser.id,
    barNumber: 'CA123456',
    jurisdictions: ['California', 'New York', 'Federal'],
    barAdmissionDate: new Date('2005-01-15'),
    practiceAreas: ['Civil Litigation', 'Corporate Law', 'Contract Disputes'],
    skills: ['Trial Advocacy', 'Mediation', 'Contract Negotiation'],
    bio: 'Experienced litigation partner with over 18 years of practice.',
    lawSchool: 'Harvard Law School',
    degree: 'J.D.',
    graduationYear: 2004,
    defaultHourlyRate: 500,
    yearsOfExperience: 18,
    targetBillableHours: 1800,
  });
  await profileRepository.save(partnerProfile);

  // Create Senior Associate
  const seniorAssociateUser = userRepository.create({
    email: 'sarah.smith@lexiflow.com',
    passwordHash: hashedPassword,
    firstName: 'Sarah',
    lastName: 'Smith',
    role: UserRole.SENIOR_ASSOCIATE,
    department: 'Corporate',
    title: 'Senior Associate',
    phone: '555-0102',
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });
  await userRepository.save(seniorAssociateUser);

  const seniorAssociateProfile = profileRepository.create({
    userId: seniorAssociateUser.id,
    barNumber: 'CA234567',
    jurisdictions: ['California', 'Delaware'],
    barAdmissionDate: new Date('2013-06-01'),
    practiceAreas: ['Corporate Law', 'Mergers & Acquisitions', 'Securities'],
    skills: ['Due Diligence', 'Contract Drafting', 'Corporate Governance'],
    bio: 'Corporate law specialist focusing on M&A transactions.',
    lawSchool: 'Stanford Law School',
    degree: 'J.D.',
    graduationYear: 2012,
    defaultHourlyRate: 350,
    yearsOfExperience: 10,
    targetBillableHours: 2000,
  });
  await profileRepository.save(seniorAssociateProfile);

  // Create Associate
  const associateUser = userRepository.create({
    email: 'michael.jones@lexiflow.com',
    passwordHash: hashedPassword,
    firstName: 'Michael',
    lastName: 'Jones',
    role: UserRole.ASSOCIATE,
    department: 'Litigation',
    title: 'Associate Attorney',
    phone: '555-0103',
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });
  await userRepository.save(associateUser);

  const associateProfile = profileRepository.create({
    userId: associateUser.id,
    barNumber: 'CA345678',
    jurisdictions: ['California'],
    barAdmissionDate: new Date('2018-11-01'),
    practiceAreas: ['Civil Litigation', 'Discovery', 'Motion Practice'],
    skills: ['Legal Research', 'Brief Writing', 'Deposition Preparation'],
    bio: 'Dedicated litigator with strong research and writing skills.',
    lawSchool: 'UCLA School of Law',
    degree: 'J.D.',
    graduationYear: 2018,
    defaultHourlyRate: 250,
    yearsOfExperience: 5,
    targetBillableHours: 2100,
  });
  await profileRepository.save(associateProfile);

  // Create Paralegal
  const paralegalUser = userRepository.create({
    email: 'emily.davis@lexiflow.com',
    passwordHash: hashedPassword,
    firstName: 'Emily',
    lastName: 'Davis',
    role: UserRole.PARALEGAL,
    department: 'Litigation',
    title: 'Senior Paralegal',
    phone: '555-0104',
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });
  await userRepository.save(paralegalUser);

  const paralegalProfile = profileRepository.create({
    userId: paralegalUser.id,
    skills: [
      'Document Management',
      'E-Discovery',
      'Trial Preparation',
      'Client Communication',
    ],
    bio: 'Experienced paralegal specializing in complex litigation support.',
    yearsOfExperience: 8,
  });
  await profileRepository.save(paralegalProfile);

  console.log('✅ Users seeded successfully');
}
