import {
  PrismaClient,
  Role,
  AssetStatus,
  AssetCategory,
  LicenseStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type OrgStructure = {
  name: string;
  departments: {
    name: string;
    jobTitles: string[];
  }[];
}[];

async function ensureDepartment(name: string, businessUnitId: string) {
  const existingDepartment = await prisma.department.findFirst({
    where: { name, businessUnitId },
  });

  if (existingDepartment) return existingDepartment;

  return prisma.department.create({
    data: { name, businessUnitId },
  });
}

async function ensureJobTitle(name: string, departmentId: string) {
  const existingJobTitle = await prisma.jobTitle.findFirst({
    where: { name, departmentId },
  });

  if (existingJobTitle) return existingJobTitle;

  return prisma.jobTitle.create({
    data: { name, departmentId },
  });
}

async function getOrgIds(
  businessUnitName: string,
  departmentName: string,
  jobTitleName: string,
) {
  const businessUnit = await prisma.businessUnit.findUnique({
    where: { name: businessUnitName },
  });
  if (!businessUnit)
    throw new Error(`Business unit not found: ${businessUnitName}`);

  const department = await prisma.department.findFirst({
    where: { name: departmentName, businessUnitId: businessUnit.id },
  });
  if (!department) throw new Error(`Department not found: ${departmentName}`);

  const jobTitle = await prisma.jobTitle.findFirst({
    where: { name: jobTitleName, departmentId: department.id },
  });
  if (!jobTitle) throw new Error(`Job title not found: ${jobTitleName}`);

  return {
    businessUnitId: businessUnit.id,
    departmentId: department.id,
    jobTitleId: jobTitle.id,
  };
}

async function ensureActiveAssignment(assetId: string, employeeId: string) {
  const existingAssignment = await prisma.employee_Assets.findFirst({
    where: {
      assetId,
      employeeId,
      returnDate: null,
    },
  });

  if (existingAssignment) return existingAssignment;

  return prisma.employee_Assets.create({
    data: { assetId, employeeId },
  });
}

async function ensureLicenseAssignment(licenseId: string, employeeId: string) {
  const existingAssignment = await prisma.licenseAssignment.findFirst({
    where: {
      licenseId,
      employeeId,
    },
  });

  if (existingAssignment) return existingAssignment;

  return prisma.licenseAssignment.create({
    data: { licenseId, employeeId },
  });
}

async function main() {
  console.log("Start seeding organizational hierarchy...");

  // 1. Organizational Hierarchy Setup
  const orgStructure: OrgStructure = [
    {
      name: "Tech",
      departments: [
        {
          name: "Development",
          jobTitles: [
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
          ],
        },
        {
          name: "IT Support",
          jobTitles: ["IT Support Engineer", "System Administrator"],
        },
      ],
    },
    {
      name: "Business",
      departments: [
        {
          name: "Marketing",
          jobTitles: ["Marketing Analyst", "Content Creator"],
        },
        {
          name: "Analytics",
          jobTitles: ["Data Analyst", "Business Analyst"],
        },
      ],
    },
    {
      name: "Operations",
      departments: [
        {
          name: "HR",
          jobTitles: ["HR Officer", "Recruiter"],
        },
        {
          name: "Finance",
          jobTitles: ["Accountant", "Financial Analyst"],
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
      const dept = await ensureDepartment(deptData.name, bu.id);

      for (const title of deptData.jobTitles) {
        await ensureJobTitle(title, dept.id);
      }
    }
  }

  // 2. Create Employees and UserLogins
  const adminOrg = await getOrgIds("Tech", "Development", "Frontend Developer");
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const adminEmployee = await prisma.employee.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin User",
      phone: null,
      ...adminOrg,
    },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      ...adminOrg,
      userLogin: {
        create: {
          username: "admin",
          password: hashedPasswordAdmin,
          role: Role.admin,
        },
      },
    },
  });

  await prisma.userLogin.upsert({
    where: { employeeId: adminEmployee.id },
    update: {
      username: "admin",
      role: Role.admin,
    },
    create: {
      username: "admin",
      password: hashedPasswordAdmin,
      role: Role.admin,
      employeeId: adminEmployee.id,
    },
  });

  const userOrg = await getOrgIds("Business", "Marketing", "Marketing Analyst");
  const hashedPasswordUser = await bcrypt.hash("user123", 10);
  const regularUserEmployee = await prisma.employee.upsert({
    where: { email: "user@example.com" },
    update: {
      name: "Regular User",
      phone: null,
      ...userOrg,
    },
    create: {
      name: "Regular User",
      email: "user@example.com",
      ...userOrg,
      userLogin: {
        create: {
          username: "user",
          password: hashedPasswordUser,
          role: Role.user,
        },
      },
    },
  });

  await prisma.userLogin.upsert({
    where: { employeeId: regularUserEmployee.id },
    update: {
      username: "user",
      role: Role.user,
    },
    create: {
      username: "user",
      password: hashedPasswordUser,
      role: Role.user,
      employeeId: regularUserEmployee.id,
    },
  });

  const zenOrg = await getOrgIds("Tech", "Development", "Backend Developer");
  const zenEmployee = await prisma.employee.upsert({
    where: { email: "zen@a.com" },
    update: {
      name: "Zen Pandora",
      phone: null,
      ...zenOrg,
    },
    create: {
      name: "Zen Pandora",
      email: "zen@a.com",
      ...zenOrg,
    },
  });

  const spriteOrg = await getOrgIds("Operations", "HR", "Recruiter");
  const spriteEmployee = await prisma.employee.upsert({
    where: { email: "sprite@a.com" },
    update: {
      name: "Sprite Pandora",
      phone: null,
      ...spriteOrg,
    },
    create: {
      name: "Sprite Pandora",
      email: "sprite@a.com",
      ...spriteOrg,
    },
  });

  const mheeyaiOrg = await getOrgIds(
    "Tech",
    "Development",
    "Full Stack Developer",
  );
  const mheeyaiEmployee = await prisma.employee.upsert({
    where: { email: "mheeyai@a.com" },
    update: {
      name: "Ei Mheeyai",
      phone: null,
      ...mheeyaiOrg,
    },
    create: {
      name: "Ei Mheeyai",
      email: "mheeyai@a.com",
      ...mheeyaiOrg,
    },
  });

  // 3. Create Initial Assets
  await prisma.asset.upsert({
    where: { serialNumber: "SN-MBP-001" },
    update: {
      name: "MacBook Pro M3",
      description: "14-inch, Space Black",
      category: AssetCategory.LAPTOP,
      status: AssetStatus.AVAILABLE,
      purchaseDate: null,
      warrantyExpiry: null,
    },
    create: {
      name: "MacBook Pro M3",
      description: "14-inch, Space Black",
      serialNumber: "SN-MBP-001",
      category: AssetCategory.LAPTOP,
      status: AssetStatus.AVAILABLE,
    },
  });

  const studioDisplay = await prisma.asset.upsert({
    where: { serialNumber: "SN-MN-001" },
    update: {
      name: "Studio Display",
      description: "27-inch 5K Retina",
      category: AssetCategory.MONITOR,
      status: AssetStatus.IN_USE,
      purchaseDate: null,
      warrantyExpiry: null,
    },
    create: {
      name: "Studio Display",
      description: "27-inch 5K Retina",
      serialNumber: "SN-MN-001",
      category: AssetCategory.MONITOR,
      status: AssetStatus.IN_USE,
      employeeAssets: {
        create: {
          employeeId: adminEmployee.id,
        },
      },
    },
  });

  await ensureActiveAssignment(studioDisplay.id, adminEmployee.id);

  await prisma.asset.upsert({
    where: { serialNumber: "SN-MN-002" },
    update: {
      name: "Mac M5 Pro",
      description: null,
      category: AssetCategory.LAPTOP,
      status: AssetStatus.MAINTENANCE,
      purchaseDate: new Date("2026-05-28T00:00:00.000Z"),
      warrantyExpiry: new Date("2026-05-18T00:00:00.000Z"),
    },
    create: {
      name: "Mac M5 Pro",
      serialNumber: "SN-MN-002",
      category: AssetCategory.LAPTOP,
      status: AssetStatus.MAINTENANCE,
      purchaseDate: new Date("2026-05-28T00:00:00.000Z"),
      warrantyExpiry: new Date("2026-05-18T00:00:00.000Z"),
    },
  });

  await prisma.asset.upsert({
    where: { serialNumber: "SN-MN-003" },
    update: {
      name: "Mac Neon Yellow",
      description: null,
      category: AssetCategory.LAPTOP,
      status: AssetStatus.RETIRED,
      purchaseDate: new Date("2026-05-10T00:00:00.000Z"),
      warrantyExpiry: new Date("2026-05-31T00:00:00.000Z"),
    },
    create: {
      name: "Mac Neon Yellow",
      serialNumber: "SN-MN-003",
      category: AssetCategory.LAPTOP,
      status: AssetStatus.RETIRED,
      purchaseDate: new Date("2026-05-10T00:00:00.000Z"),
      warrantyExpiry: new Date("2026-05-31T00:00:00.000Z"),
    },
  });

  // 4. Create Licenses
  const adobeLicense = await prisma.license.upsert({
    where: { name: "Adobe Creative Cloud" },
    update: {
      vendor: "Adobe",
      type: "Subscription",
      totalSeats: 50,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2026-12-15T00:00:00.000Z"),
      price: "$2,400",
      billingCycle: "Monthly",
      annualCost: "$28,800",
      color: "rose",
    },
    create: {
      name: "Adobe Creative Cloud",
      vendor: "Adobe",
      type: "Subscription",
      totalSeats: 50,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2026-12-15T00:00:00.000Z"),
      price: "$2,400",
      billingCycle: "Monthly",
      annualCost: "$28,800",
      color: "rose",
    },
  });

  const microsoftLicense = await prisma.license.upsert({
    where: { name: "Microsoft 365 Business" },
    update: {
      vendor: "Microsoft",
      type: "Subscription",
      totalSeats: 250,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2027-01-20T00:00:00.000Z"),
      price: "$5,500",
      billingCycle: "Annual",
      annualCost: "$5,500",
      color: "blue",
    },
    create: {
      name: "Microsoft 365 Business",
      vendor: "Microsoft",
      type: "Subscription",
      totalSeats: 250,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2027-01-20T00:00:00.000Z"),
      price: "$5,500",
      billingCycle: "Annual",
      annualCost: "$5,500",
      color: "blue",
    },
  });

  const codexLicense = await prisma.license.upsert({
    where: { name: "Codex" },
    update: {
      vendor: "OpenAI",
      type: "Subscription",
      totalSeats: 30,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2026-08-05T00:00:00.000Z"),
      price: "$1,200",
      billingCycle: "Monthly",
      annualCost: "$14,400",
      color: "indigo",
    },
    create: {
      name: "Codex",
      vendor: "OpenAI",
      type: "Subscription",
      totalSeats: 30,
      status: LicenseStatus.ACTIVE,
      expiryDate: new Date("2026-08-05T00:00:00.000Z"),
      price: "$1,200",
      billingCycle: "Monthly",
      annualCost: "$14,400",
      color: "indigo",
    },
  });

  const claudeLicense = await prisma.license.upsert({
    where: { name: "Claude" },
    update: {
      vendor: "Anthropic",
      type: "Subscription",
      totalSeats: 20,
      status: LicenseStatus.WARNING,
      expiryDate: new Date("2026-07-31T00:00:00.000Z"),
      price: "$700",
      billingCycle: "Monthly",
      annualCost: "$8,400",
      color: "emerald",
    },
    create: {
      name: "Claude",
      vendor: "Anthropic",
      type: "Subscription",
      totalSeats: 20,
      status: LicenseStatus.WARNING,
      expiryDate: new Date("2026-07-31T00:00:00.000Z"),
      price: "$700",
      billingCycle: "Monthly",
      annualCost: "$8,400",
      color: "emerald",
    },
  });

  const awsLicense = await prisma.license.upsert({
    where: { name: "AWS" },
    update: {
      vendor: "Amazon Web Services",
      type: "Cloud Subscription",
      totalSeats: 15,
      status: LicenseStatus.CRITICAL,
      expiryDate: new Date("2026-06-30T00:00:00.000Z"),
      price: "$2,000",
      billingCycle: "Monthly",
      annualCost: "$24,000",
      color: "amber",
    },
    create: {
      name: "AWS",
      vendor: "Amazon Web Services",
      type: "Cloud Subscription",
      totalSeats: 15,
      status: LicenseStatus.CRITICAL,
      expiryDate: new Date("2026-06-30T00:00:00.000Z"),
      price: "$2,000",
      billingCycle: "Monthly",
      annualCost: "$24,000",
      color: "amber",
    },
  });

  await ensureLicenseAssignment(adobeLicense.id, adminEmployee.id);
  await ensureLicenseAssignment(adobeLicense.id, regularUserEmployee.id);
  await ensureLicenseAssignment(adobeLicense.id, mheeyaiEmployee.id);

  await ensureLicenseAssignment(microsoftLicense.id, adminEmployee.id);
  await ensureLicenseAssignment(microsoftLicense.id, regularUserEmployee.id);
  await ensureLicenseAssignment(microsoftLicense.id, zenEmployee.id);

  await ensureLicenseAssignment(codexLicense.id, zenEmployee.id);
  await ensureLicenseAssignment(codexLicense.id, mheeyaiEmployee.id);

  await ensureLicenseAssignment(claudeLicense.id, spriteEmployee.id);
  await ensureLicenseAssignment(claudeLicense.id, adminEmployee.id);

  await ensureLicenseAssignment(awsLicense.id, adminEmployee.id);
  await ensureLicenseAssignment(awsLicense.id, regularUserEmployee.id);
  await ensureLicenseAssignment(awsLicense.id, spriteEmployee.id);

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
