import {
  PrismaClient,
  Role,
  AssetStatus,
  AssetCategory,
  LicenseStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// Data extracted from pg_dump: it-assets-inventory_2026-05-14_153701.sql
const businessUnits = [
  { id: "804dbc7a-6033-4dd9-a293-b81621d9164e", name: "Tech" },
  { id: "1554adf5-55e4-4787-b90b-a80f1480cdc6", name: "Business" },
  { id: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211", name: "Operations" },
];

const departments = [
  { id: "d445e86c-9bc4-4903-b808-38b4c575d21b", name: "Development", businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e" },
  { id: "f00e46cd-ca00-48e2-80fc-75c2a5d139dc", name: "IT Support", businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e" },
  { id: "dff0fd30-73b8-4232-8778-547938a222b2", name: "Marketing", businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6" },
  { id: "776477f8-f5f6-4c22-932a-434d9d2ed4a0", name: "Analytics", businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6" },
  { id: "675e4937-3227-41e3-be3a-bf5270ecb454", name: "HR", businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211" },
  { id: "48289ba7-7ce6-477b-bea8-1e503c133151", name: "Finance", businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211" },
];

const jobTitles = [
  { id: "bcc097bb-75b7-41c9-9f77-9eb92d0cfec6", name: "Frontend Developer", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b" },
  { id: "c942fa49-7f71-4320-bb07-2498d951983e", name: "Backend Developer", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b" },
  { id: "2b0e07ce-afbb-4684-9478-6e174e90f074", name: "Full Stack Developer", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b" },
  { id: "41af3238-d664-4186-8106-3c95c3948d44", name: "IT Support Engineer", departmentId: "f00e46cd-ca00-48e2-80fc-75c2a5d139dc" },
  { id: "44987a3b-9dbd-4b4d-aba6-4e0ebbd09c01", name: "System Administrator", departmentId: "f00e46cd-ca00-48e2-80fc-75c2a5d139dc" },
  { id: "99b4d79c-efab-43b0-a507-2abd510111da", name: "Marketing Analyst", departmentId: "dff0fd30-73b8-4232-8778-547938a222b2" },
  { id: "4fcaf8ac-fedb-4178-b580-9ab1779cbba1", name: "Content Creator", departmentId: "dff0fd30-73b8-4232-8778-547938a222b2" },
  { id: "1aa1a159-47dd-4387-bbce-f24314b2fb54", name: "Data Analyst", departmentId: "776477f8-f5f6-4c22-932a-434d9d2ed4a0" },
  { id: "d903f940-25d6-4c1a-8807-e7d8ac1b74f6", name: "Business Analyst", departmentId: "776477f8-f5f6-4c22-932a-434d9d2ed4a0" },
  { id: "69530e41-35b9-45c1-b1a3-1bda5f2eb7db", name: "HR Officer", departmentId: "675e4937-3227-41e3-be3a-bf5270ecb454" },
  { id: "4d08ade7-28c1-47da-93b0-ea78a2d3cdb4", name: "Recruiter", departmentId: "675e4937-3227-41e3-be3a-bf5270ecb454" },
  { id: "d2118a62-6f62-454e-8e53-2a00ac188226", name: "Accountant", departmentId: "48289ba7-7ce6-477b-bea8-1e503c133151" },
  { id: "b35d626a-9fae-4b3c-bae8-6aed8173545a", name: "Financial Analyst", departmentId: "48289ba7-7ce6-477b-bea8-1e503c133151" },
];

const employees = [
  { id: "5b82f6ce-4042-41b7-86d0-f47a697f6226", name: "Regular User", email: "user@example.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "dff0fd30-73b8-4232-8778-547938a222b2", jobTitleId: "99b4d79c-efab-43b0-a507-2abd510111da", avatarUrl: null },
  { id: "066b6860-c3c8-47c3-9965-ad23dd925ec8", name: "Ei Mheeyai", email: "mheeyai@a.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "2b0e07ce-afbb-4684-9478-6e174e90f074", avatarUrl: null },
  { id: "4d1bf14d-6543-4077-98d0-378b6cbc0025", name: "Stefan Flim", email: "flim@a.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "dff0fd30-73b8-4232-8778-547938a222b2", jobTitleId: "4fcaf8ac-fedb-4178-b580-9ab1779cbba1", avatarUrl: null },
  { id: "0c310d4e-be7b-43a2-8db3-dc9992091e69", name: "Vinny Rodzo", email: "vinny@a.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "776477f8-f5f6-4c22-932a-434d9d2ed4a0", jobTitleId: "d903f940-25d6-4c1a-8807-e7d8ac1b74f6", avatarUrl: "/uploads/image-1778655253303-252161534.png" },
  { id: "18af2430-be1c-4140-9801-4b9964ffa595", name: "Arthur Pandora", email: "arther@a.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "c942fa49-7f71-4320-bb07-2498d951983e", avatarUrl: "/uploads/image-1778656245453-688300231.png" },
  { id: "e29ee5ea-e48f-4134-b091-03f3680c0825", name: "Sprite Pandora", email: "sprite@a.com", phone: null, businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211", departmentId: "675e4937-3227-41e3-be3a-bf5270ecb454", jobTitleId: "4d08ade7-28c1-47da-93b0-ea78a2d3cdb4", avatarUrl: "/uploads/image-1778656435606-515509659.png" },
  { id: "221dd13c-9e36-4be8-92d8-8b9d8204a340", name: "Admin User", email: "admin@example.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "bcc097bb-75b7-41c9-9f77-9eb92d0cfec6", avatarUrl: "/uploads/image-1778656462612-887161948.jpg" },
  { id: "2c7c9bc1-d9cf-4546-8a8e-d0d62170877c", name: "Lee Christmas", email: "lee@a.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "c942fa49-7f71-4320-bb07-2498d951983e", avatarUrl: null },
  { id: "499505ab-802f-4f30-ab15-56045b97803a", name: "Lupin Chogun", email: "lupin@a.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "dff0fd30-73b8-4232-8778-547938a222b2", jobTitleId: "4fcaf8ac-fedb-4178-b580-9ab1779cbba1", avatarUrl: null },
  { id: "906d9808-a9ab-4c6c-b3fd-be9e9a45d569", name: "Silver TurTle", email: "turtle@a.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "776477f8-f5f6-4c22-932a-434d9d2ed4a0", jobTitleId: "1aa1a159-47dd-4387-bbce-f24314b2fb54", avatarUrl: null },
  { id: "716c1cff-aeda-4d72-be20-900b68f43db3", name: "Tuy Silver", email: "tuy@a.com", phone: null, businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211", departmentId: "48289ba7-7ce6-477b-bea8-1e503c133151", jobTitleId: "b35d626a-9fae-4b3c-bae8-6aed8173545a", avatarUrl: null },
  { id: "10fcbad4-d5f8-456c-9a69-7561aceef8f7", name: "Spy Silver", email: "spy@a.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "c942fa49-7f71-4320-bb07-2498d951983e", avatarUrl: null },
  { id: "851fd009-c225-41a8-8328-5c02eeb76ecf", name: "Cam Kamacho", email: "kla@a.com", phone: null, businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211", departmentId: "675e4937-3227-41e3-be3a-bf5270ecb454", jobTitleId: "69530e41-35b9-45c1-b1a3-1bda5f2eb7db", avatarUrl: null },
  { id: "39511563-ba5e-4863-b669-4e241492f7b8", name: "Bunny Skaletwitch", email: "bunny@a.com", phone: null, businessUnitId: "1554adf5-55e4-4787-b90b-a80f1480cdc6", departmentId: "776477f8-f5f6-4c22-932a-434d9d2ed4a0", jobTitleId: "d903f940-25d6-4c1a-8807-e7d8ac1b74f6", avatarUrl: null },
  { id: "6740fa9f-78e8-44d5-8309-6a160b2849b0", name: "Jasmine JR", email: "jasmine@a.com", phone: null, businessUnitId: "804dbc7a-6033-4dd9-a293-b81621d9164e", departmentId: "d445e86c-9bc4-4903-b808-38b4c575d21b", jobTitleId: "2b0e07ce-afbb-4684-9478-6e174e90f074", avatarUrl: null },
  { id: "4d5da493-c4aa-4e16-bbc1-683629d9b8c7", name: "Yumiko Lucino", email: "yumiko@a.com", phone: null, businessUnitId: "4d9e86a2-da2b-48bd-8d9c-a4e595ae7211", departmentId: "675e4937-3227-41e3-be3a-bf5270ecb454", jobTitleId: "4d08ade7-28c1-47da-93b0-ea78a2d3cdb4", avatarUrl: null }
];

const userLogins = [
  { id: "7cb7ee67-1a4b-4df7-bf20-75260176276e", username: "admin", password: "$2b$10$4/d/1hDBOzworl8dfnWb/.Cq6B1LOej5K0SvQ3Op0ofLoM7f6mP3u", role: Role.admin, employeeId: "221dd13c-9e36-4be8-92d8-8b9d8204a340" },
  { id: "d01b61e7-8ab2-4cc4-83a3-83c4cdb1fc92", username: "user", password: "$2b$10$Jk9aWkxZLaq/RrO76HpdBOGct4b7EMduMtSRCgQkbR9L97ovqeS/G", role: Role.user, employeeId: "5b82f6ce-4042-41b7-86d0-f47a697f6226" }
];

const assets = [
  { id: "2bbd7948-28af-4fcc-873c-0cc5b028fff8", name: "Studio Display", description: "27-inch 5K Retina", category: AssetCategory.MONITOR, purchaseDate: null, serialNumber: "SN-MN-001", status: AssetStatus.IN_USE, warrantyExpiry: null, imageUrl: null },
  { id: "a0965136-2e9d-47db-9114-22da3322f159", name: "Mac Neon Yellow", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-10T00:00:00.000Z"), serialNumber: "SN-MN-003", status: AssetStatus.RETIRED, warrantyExpiry: new Date("2026-05-31T00:00:00.000Z"), imageUrl: null },
  { id: "0353a79d-e5cf-4ae8-b4a7-b2badf8d12f8", name: "MacBook Pro M3", description: "14-inch, Space Black", category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-13T00:00:00.000Z"), serialNumber: "SN-MBP-0011", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-05-22T00:00:00.000Z"), imageUrl: null },
  { id: "a5efdeca-241b-44b8-b910-4b1698fe337c", name: "Mac M5 Pro", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-28T00:00:00.000Z"), serialNumber: "SN-MN-002", status: AssetStatus.MAINTENANCE, warrantyExpiry: new Date("2026-05-18T00:00:00.000Z"), imageUrl: null },
  { id: "5ba5fe51-4839-4668-863d-79f40890e7d1", name: "MacBook Pro M5 Max", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-15T00:00:00.000Z"), serialNumber: "SN-MN-004", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2027-05-15T00:00:00.000Z"), imageUrl: null },
  { id: "f3f9a8e7-73e8-4347-9d3d-11d913b73364", name: "MacBook Air M3", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-14T00:00:00.000Z"), serialNumber: "SN-MN-005", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-05-15T00:00:00.000Z"), imageUrl: null },
  { id: "d1c3f36e-0b1b-4383-9e4e-84473bad7257", name: "Dell XPS 15", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2026-05-18T00:00:00.000Z"), serialNumber: "SN-MN-006", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-05-22T00:00:00.000Z"), imageUrl: null },
  { id: "0a5d7807-511f-493c-92fa-b715a9f4cfc9", name: "Lenovo ThinkPad X1 Carbon", description: null, category: AssetCategory.LAPTOP, purchaseDate: new Date("2027-05-16T00:00:00.000Z"), serialNumber: "SN-MN-007", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2027-05-18T00:00:00.000Z"), imageUrl: null },
  { id: "2bf0f25a-a949-4885-86ad-ef0818bfa78b", name: "iPhone 16 Pro", description: null, category: AssetCategory.MOBILE, purchaseDate: new Date("2026-05-10T00:00:00.000Z"), serialNumber: "SN-MB-001", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-06T00:00:00.000Z"), imageUrl: null },
  { id: "778b2420-f7e6-4aa7-9c23-e4739d79e488", name: "Samsung Galaxy S25 Ultra", description: null, category: AssetCategory.MOBILE, purchaseDate: new Date("2026-05-17T00:00:00.000Z"), serialNumber: "SN-MB-002", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-02T00:00:00.000Z"), imageUrl: null },
  { id: "7a5538a6-9d16-4001-8fc6-1f11f217789c", name: "iPad Pro", description: null, category: AssetCategory.MOBILE, purchaseDate: new Date("2026-05-26T00:00:00.000Z"), serialNumber: "SN-MB-101", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-01T00:00:00.000Z"), imageUrl: null },
  { id: "49794d32-a001-410f-b9af-2e1711b70fa4", name: "Apple Vision Pro", description: null, category: AssetCategory.PERIPHERAL, purchaseDate: new Date("2026-05-17T00:00:00.000Z"), serialNumber: "SN-RD-001", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-05-28T00:00:00.000Z"), imageUrl: null },
  { id: "1de42a39-2fde-47be-a515-c17239002492", name: "LG UltraFine 5K Monitor", description: null, category: AssetCategory.MONITOR, purchaseDate: new Date("2026-05-27T00:00:00.000Z"), serialNumber: "SN-MN-008", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-02T00:00:00.000Z"), imageUrl: null },
  { id: "ec4f5d41-c0ec-4b64-b353-83d6db4b2691", name: "Logitech MX Master 3S", description: null, category: AssetCategory.PERIPHERAL, purchaseDate: new Date("2026-05-25T00:00:00.000Z"), serialNumber: "SN-RD-002", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-02T00:00:00.000Z"), imageUrl: null },
  { id: "15327f1b-4e94-449c-8062-0bab0121150d", name: "AirPods Pro", description: null, category: AssetCategory.PERIPHERAL, purchaseDate: new Date("2026-05-26T00:00:00.000Z"), serialNumber: "SN-RD-003", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-01T00:00:00.000Z"), imageUrl: null },
  { id: "ce815548-66ad-4d4b-bb8e-75e73aecef7a", name: "Sony WH-1000XM6", description: null, category: AssetCategory.PERIPHERAL, purchaseDate: new Date("2026-05-31T00:00:00.000Z"), serialNumber: "SN-RD-004", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-06T00:00:00.000Z"), imageUrl: null },
  { id: "eb38f38e-5a33-4498-954d-8b95c98582a8", name: "Logitech MX Keys", description: null, category: AssetCategory.PERIPHERAL, purchaseDate: new Date("2026-05-31T00:00:00.000Z"), serialNumber: "SN-RD-005", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-06T00:00:00.000Z"), imageUrl: null },
  { id: "9a7baaff-8efe-41d4-8d46-6e24d58c011c", name: "Standing Desk", description: null, category: AssetCategory.OTHER, purchaseDate: new Date("2026-05-26T00:00:00.000Z"), serialNumber: "SN-CTL-001", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-01T00:00:00.000Z"), imageUrl: null },
  { id: "c178f2b1-2a70-44af-89dd-6fdb0b0c0e9f", name: "Herman Miller Aeron Chair", description: null, category: AssetCategory.OTHER, purchaseDate: new Date("2026-05-25T00:00:00.000Z"), serialNumber: "SN-CTL-002", status: AssetStatus.AVAILABLE, warrantyExpiry: new Date("2026-06-01T00:00:00.000Z"), imageUrl: null },
];

const employeeAssets = [
  { id: "c844553b-2d8d-443f-b658-87cf84faeae0", employeeId: "221dd13c-9e36-4be8-92d8-8b9d8204a340", assetId: "2bbd7948-28af-4fcc-873c-0cc5b028fff8", assignedDate: new Date("2026-05-13T06:45:45.469Z"), returnDate: null },
  { id: "edb3c7d8-2adf-4e66-ac1e-b2c493997293", employeeId: "18af2430-be1c-4140-9801-4b9964ffa595", assetId: "a0965136-2e9d-47db-9114-22da3322f159", assignedDate: new Date("2026-05-14T03:29:18.209Z"), returnDate: null },
  { id: "c48c54d5-c53a-440a-a2b3-e1386b1ac723", employeeId: "5b82f6ce-4042-41b7-86d0-f47a697f6226", assetId: "a5efdeca-241b-44b8-b910-4b1698fe337c", assignedDate: new Date("2026-05-14T03:50:38.240Z"), returnDate: null }
];

const licenses = [
  { id: "6531f90f-3ee9-4f5b-9a24-e48f5da17f80", name: "Adobe Creative Cloud", vendor: "Adobe", type: "Subscription", totalSeats: 50, status: LicenseStatus.ACTIVE, expiryDate: new Date("2026-12-15T00:00:00.000Z"), price: 2400.0, billingCycle: "Monthly", annualCost: 28800.0, color: "rose", currency: "USD" },
  { id: "779b4128-e586-485a-a5a8-2cced8b5ee21", name: "Claude", vendor: "Anthropic", type: "Subscription", totalSeats: 20, status: LicenseStatus.WARNING, expiryDate: new Date("2026-07-31T00:00:00.000Z"), price: 700.0, billingCycle: "Monthly", annualCost: 8400.0, color: "emerald", currency: "USD" },
  { id: "655920c5-9b83-4dad-a205-066509d2b87e", name: "AWS", vendor: "Amazon Web Services", type: "Cloud Subscription", totalSeats: 15, status: LicenseStatus.WARNING, expiryDate: new Date("2026-06-30T00:00:00.000Z"), price: 2000.0, billingCycle: "Monthly", annualCost: 24000.0, color: "amber", currency: "USD" },
  { id: "20751ed1-3389-4587-979c-3349d7fa432d", name: "Microsoft 365 Business", vendor: "Microsoft", type: "Subscription", totalSeats: 1, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-01-20T00:00:00.000Z"), price: 5500.0, billingCycle: "Annual", annualCost: 5500.0, color: "blue", currency: "USD" },
  { id: "52aa58a7-c42e-4802-9851-76c0f0380f5e", name: "Codex", vendor: "OpenAI", type: "Subscription", totalSeats: 30, status: LicenseStatus.ACTIVE, expiryDate: new Date("2026-08-05T00:00:00.000Z"), price: 700.0, billingCycle: "Monthly", annualCost: 8400.0, color: "indigo", currency: "USD" },
  { id: "de880e58-65a3-47b9-84eb-291cba12957c", name: "Gemini", vendor: "Google", type: "Subscription", totalSeats: 10, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 700.0, billingCycle: "Annually", annualCost: 8400.0, color: "amber", currency: "USD" },
  { id: "ef215d53-8d1a-47b0-8c2e-f18dfcfff316", name: "Google Workspace", vendor: "Google", type: "Subscription", totalSeats: 100, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 57.0, billingCycle: "Annually", annualCost: 684.0, color: "amber", currency: "USD" },
  { id: "81a134e2-4965-4bcf-b452-74bf987fa592", name: "GitHub Enterprise", vendor: "GitHub", type: "Subscription", totalSeats: 10, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 21.0, billingCycle: "Annually", annualCost: 252.0, color: "emerald", currency: "USD" },
  { id: "dedd8f01-0bb7-450a-8612-c63dae79257d", name: "Atlassian Jira Enterprise", vendor: "Atlassian", type: "Subscription", totalSeats: 500, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 12900.0, billingCycle: "Annually", annualCost: 155000.0, color: "blue", currency: "USD" },
  { id: "4dff9da8-f8cf-4ae3-9f66-f0b3277c54b4", name: "GitLab Ultimate", vendor: "GitLab", type: "Subscription", totalSeats: 5, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 99.0, billingCycle: "Annually", annualCost: 1100.0, color: "emerald", currency: "USD" },
  { id: "164ea973-f778-4800-9e7b-45aa9e5e0716", name: "Slack Enterprise Grid", vendor: "Salesforce", type: "Subscription", totalSeats: 20, status: LicenseStatus.ACTIVE, expiryDate: new Date("2027-05-14T00:00:00.000Z"), price: 22.0, billingCycle: "Annually", annualCost: 264.0, color: "rose", currency: "USD" },
];

const licenseAssignments = [
  { id: "e15adbb5-edbf-4b88-b607-631e17c7a67e", licenseId: "6531f90f-3ee9-4f5b-9a24-e48f5da17f80", employeeId: "221dd13c-9e36-4be8-92d8-8b9d8204a340", assignedDate: new Date("2026-05-13T06:45:45.482Z") },
  { id: "1761dac3-2d85-4124-baa9-78bf833d0848", licenseId: "6531f90f-3ee9-4f5b-9a24-e48f5da17f80", employeeId: "5b82f6ce-4042-41b7-86d0-f47a697f6226", assignedDate: new Date("2026-05-13T06:45:45.485Z") },
  { id: "25f04d4f-074f-45e5-998c-60d08856d70d", licenseId: "6531f90f-3ee9-4f5b-9a24-e48f5da17f80", employeeId: "066b6860-c3c8-47c3-9965-ad23dd925ec8", assignedDate: new Date("2026-05-13T06:45:45.486Z") },
  { id: "cd09dacb-9cc4-49c4-ba9d-18872ef49dfe", licenseId: "52aa58a7-c42e-4802-9851-76c0f0380f5e", employeeId: "18af2430-be1c-4140-9801-4b9964ffa595", assignedDate: new Date("2026-05-13T06:45:45.490Z") },
  { id: "b70d12c4-e53b-4a31-861b-c1d42ccc0900", licenseId: "52aa58a7-c42e-4802-9851-76c0f0380f5e", employeeId: "066b6860-c3c8-47c3-9965-ad23dd925ec8", assignedDate: new Date("2026-05-13T06:45:45.491Z") },
  { id: "bdeae5a8-0020-45f0-9ff7-bc36771a9470", licenseId: "779b4128-e586-485a-a5a8-2cced8b5ee21", employeeId: "e29ee5ea-e48f-4134-b091-03f3680c0825", assignedDate: new Date("2026-05-13T06:45:45.492Z") },
  { id: "7f80e77c-d998-44b0-bf97-eb4e622d00b6", licenseId: "655920c5-9b83-4dad-a205-066509d2b87e", employeeId: "221dd13c-9e36-4be8-92d8-8b9d8204a340", assignedDate: new Date("2026-05-13T06:45:45.494Z") },
  { id: "eef9b2d8-71f3-4d6d-b359-951741afb522", licenseId: "655920c5-9b83-4dad-a205-066509d2b87e", employeeId: "5b82f6ce-4042-41b7-86d0-f47a697f6226", assignedDate: new Date("2026-05-13T06:45:45.495Z") },
  { id: "4a424d7d-9383-42c4-ab28-f09501ea86ed", licenseId: "655920c5-9b83-4dad-a205-066509d2b87e", employeeId: "e29ee5ea-e48f-4134-b091-03f3680c0825", assignedDate: new Date("2026-05-13T06:45:45.496Z") },
  { id: "064c0e6e-6f1a-458a-a584-6c094bc17628", licenseId: "655920c5-9b83-4dad-a205-066509d2b87e", employeeId: "2c7c9bc1-d9cf-4546-8a8e-d0d62170877c", assignedDate: new Date("2026-05-13T07:52:07.602Z") },
  { id: "425b82d9-8760-48ed-a202-7e607af9d69a", licenseId: "655920c5-9b83-4dad-a205-066509d2b87e", employeeId: "10fcbad4-d5f8-456c-9a69-7561aceef8f7", assignedDate: new Date("2026-05-13T07:52:19.023Z") },
  { id: "4f5c4e98-193c-4778-b30c-2f2d38668c75", licenseId: "779b4128-e586-485a-a5a8-2cced8b5ee21", employeeId: "066b6860-c3c8-47c3-9965-ad23dd925ec8", assignedDate: new Date("2026-05-13T07:52:55.506Z") },
  { id: "85317896-e622-4761-8999-aaa4b46b2a0c", licenseId: "20751ed1-3389-4587-979c-3349d7fa432d", employeeId: "0c310d4e-be7b-43a2-8db3-dc9992091e69", assignedDate: new Date("2026-05-13T07:53:07.892Z") },
];

async function main() {
  console.log("Start seeding backup data from May 14, 2026...");

  // 1. BusinessUnit
  for (const bu of businessUnits) {
    await prisma.businessUnit.upsert({
      where: { id: bu.id },
      update: { name: bu.name },
      create: bu,
    });
  }
  console.log("BusinessUnits seeded.");

  // 2. Department
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: { name: dept.name, businessUnitId: dept.businessUnitId },
      create: dept,
    });
  }
  console.log("Departments seeded.");

  // 3. JobTitle
  for (const jt of jobTitles) {
    await prisma.jobTitle.upsert({
      where: { id: jt.id },
      update: { name: jt.name, departmentId: jt.departmentId },
      create: jt,
    });
  }
  console.log("JobTitles seeded.");

  // 4. Employee
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        businessUnitId: emp.businessUnitId,
        departmentId: emp.departmentId,
        jobTitleId: emp.jobTitleId,
        avatarUrl: emp.avatarUrl,
      },
      create: emp,
    });
  }
  console.log("Employees seeded.");

  // 5. UserLogin
  for (const ul of userLogins) {
    await prisma.userLogin.upsert({
      where: { id: ul.id },
      update: {
        username: ul.username,
        password: ul.password,
        role: ul.role,
        employeeId: ul.employeeId,
      },
      create: ul,
    });
  }
  console.log("UserLogins seeded.");

  // 6. Asset
  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: {
        name: asset.name,
        description: asset.description,
        category: asset.category,
        purchaseDate: asset.purchaseDate,
        serialNumber: asset.serialNumber,
        status: asset.status,
        warrantyExpiry: asset.warrantyExpiry,
        imageUrl: asset.imageUrl,
      },
      create: asset,
    });
  }
  console.log("Assets seeded.");

  // 7. Employee_Assets
  for (const ea of employeeAssets) {
    await prisma.employee_Assets.upsert({
      where: { id: ea.id },
      update: {
        employeeId: ea.employeeId,
        assetId: ea.assetId,
        assignedDate: ea.assignedDate,
        returnDate: ea.returnDate,
      },
      create: ea,
    });
  }
  console.log("Employee_Assets seeded.");

  // 8. License
  for (const lic of licenses) {
    await prisma.license.upsert({
      where: { id: lic.id },
      update: {
        name: lic.name,
        vendor: lic.vendor,
        type: lic.type,
        totalSeats: lic.totalSeats,
        status: lic.status,
        expiryDate: lic.expiryDate,
        price: lic.price,
        billingCycle: lic.billingCycle,
        annualCost: lic.annualCost,
        color: lic.color,
        currency: lic.currency,
      },
      create: lic,
    });
  }
  console.log("Licenses seeded.");

  // 9. LicenseAssignment
  for (const la of licenseAssignments) {
    await prisma.licenseAssignment.upsert({
      where: { id: la.id },
      update: {
        licenseId: la.licenseId,
        employeeId: la.employeeId,
        assignedDate: la.assignedDate,
      },
      create: la,
    });
  }
  console.log("LicenseAssignments seeded.");

  console.log("Seed backup completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
