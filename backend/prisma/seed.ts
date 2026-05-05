import { PrismaClient, Role, AssetStatus, AssetCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding organizational hierarchy...');

  // 1. Organizational Hierarchy Setup
  const orgStructure = [
    {
      name: 'Tech',
      departments: [
        {
          name: 'Development',
          jobTitles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
        },
        {
          name: 'IT Support',
          jobTitles: ['IT Support Engineer', 'System Administrator'],
        },
      ],
    },
    {
      name: 'Business',
      departments: [
        {
          name: 'Marketing',
          jobTitles: ['Marketing Analyst', 'Content Creator'],
        },
        {
          name: 'Analytics',
          jobTitles: ['Data Analyst', 'Business Analyst'],
        },
      ],
    },
    {
      name: 'Operations',
      departments: [
        {
          name: 'HR',
          jobTitles: ['HR Officer', 'Recruiter'],
        },
        {
          name: 'Finance',
          jobTitles: ['Accountant', 'Financial Analyst'],
        },
      ],
    },
  ];

  for (const buData of orgStructure) {
    const bu = await prisma.businessUnit.upsert({
      where: { name: buData.name },
      update: {},
      create: { name: buData.name },
    });

    for (const deptData of buData.departments) {
      const dept = await prisma.department.create({
        data: {
          name: deptData.name,
          businessUnitId: bu.id,
        },
      });

      for (const title of deptData.jobTitles) {
        await prisma.jobTitle.create({
          data: {
            name: title,
            departmentId: dept.id,
          },
        });
      }
    }
  }

  // Get some IDs for default users
  const firstBU = await prisma.businessUnit.findFirst({ include: { departments: { include: { jobTitles: true } } } });
  if (!firstBU) throw new Error('Failed to seed hierarchy');
  
  const techDept = firstBU.departments[0];
  const devJob = techDept.jobTitles[0];

  // 2. Create Employees and UserLogins
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const adminEmployee = await prisma.employee.upsert({
    where: { email: 'admin@example.com' },
    update: {
      businessUnitId: firstBU.id,
      departmentId: techDept.id,
      jobTitleId: devJob.id,
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      businessUnitId: firstBU.id,
      departmentId: techDept.id,
      jobTitleId: devJob.id,
      userLogin: {
        create: {
          username: 'admin',
          password: hashedPasswordAdmin,
          role: Role.admin,
        },
      },
    },
  });

  const hashedPasswordUser = await bcrypt.hash('user123', 10);
  await prisma.employee.upsert({
    where: { email: 'user@example.com' },
    update: {
      businessUnitId: firstBU.id,
      departmentId: techDept.id,
      jobTitleId: devJob.id,
    },
    create: {
      name: 'Regular User',
      email: 'user@example.com',
      businessUnitId: firstBU.id,
      departmentId: techDept.id,
      jobTitleId: devJob.id,
      userLogin: {
        create: {
          username: 'user',
          password: hashedPasswordUser,
          role: Role.user,
        },
      },
    },
  });

  // 3. Create Initial Assets
  await prisma.asset.upsert({
    where: { serialNumber: 'SN-MBP-001' },
    update: {},
    create: {
      name: 'MacBook Pro M3',
      description: '14-inch, Space Black',
      serialNumber: 'SN-MBP-001',
      category: AssetCategory.LAPTOP,
      status: AssetStatus.AVAILABLE,
    },
  });

  await prisma.asset.upsert({
    where: { serialNumber: 'SN-MN-001' },
    update: {},
    create: {
      name: 'Studio Display',
      description: '27-inch 5K Retina',
      serialNumber: 'SN-MN-001',
      category: AssetCategory.MONITOR,
      status: AssetStatus.IN_USE,
      employeeAssets: {
        create: {
          employeeId: adminEmployee.id,
        }
      }
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
