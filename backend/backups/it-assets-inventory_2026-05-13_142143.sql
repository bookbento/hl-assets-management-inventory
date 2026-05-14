--
-- PostgreSQL database dump
--

\restrict Qtcf8nDJvKA7hL7EvsrhJUUcuo6KaF1fsx5MfVS8Ff8N2IBG0F7U6bxYFEtd5UH

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetCategory" AS ENUM (
    'LAPTOP',
    'MONITOR',
    'PERIPHERAL',
    'NETWORKING',
    'MOBILE',
    'OTHER'
);


ALTER TYPE public."AssetCategory" OWNER TO postgres;

--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'MAINTENANCE',
    'RETIRED'
);


ALTER TYPE public."AssetStatus" OWNER TO postgres;

--
-- Name: LicenseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseStatus" AS ENUM (
    'ACTIVE',
    'WARNING',
    'CRITICAL',
    'EXPIRED'
);


ALTER TYPE public."LicenseStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    category public."AssetCategory" NOT NULL,
    "purchaseDate" timestamp(3) without time zone,
    "serialNumber" text NOT NULL,
    status public."AssetStatus" DEFAULT 'AVAILABLE'::public."AssetStatus" NOT NULL,
    "warrantyExpiry" timestamp(3) without time zone,
    "imageUrl" text
);


ALTER TABLE public."Asset" OWNER TO postgres;

--
-- Name: BusinessUnit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BusinessUnit" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BusinessUnit" OWNER TO postgres;

--
-- Name: Department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "businessUnitId" text NOT NULL
);


ALTER TABLE public."Department" OWNER TO postgres;

--
-- Name: Employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Employee" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "businessUnitId" text NOT NULL,
    "departmentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "jobTitleId" text NOT NULL,
    "avatarUrl" text
);


ALTER TABLE public."Employee" OWNER TO postgres;

--
-- Name: Employee_Assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Employee_Assets" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "assetId" text NOT NULL,
    "assignedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "returnDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Employee_Assets" OWNER TO postgres;

--
-- Name: JobTitle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."JobTitle" (
    id text NOT NULL,
    name text NOT NULL,
    "departmentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JobTitle" OWNER TO postgres;

--
-- Name: License; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."License" (
    id text NOT NULL,
    name text NOT NULL,
    vendor text NOT NULL,
    type text NOT NULL,
    "totalSeats" integer NOT NULL,
    status public."LicenseStatus" DEFAULT 'ACTIVE'::public."LicenseStatus" NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    price text NOT NULL,
    "billingCycle" text NOT NULL,
    "annualCost" text NOT NULL,
    color text DEFAULT 'blue'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."License" OWNER TO postgres;

--
-- Name: LicenseAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LicenseAssignment" (
    id text NOT NULL,
    "licenseId" text NOT NULL,
    "employeeId" text NOT NULL,
    "assignedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LicenseAssignment" OWNER TO postgres;

--
-- Name: UserLogin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserLogin" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    "employeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserLogin" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Asset" (id, name, "createdAt", "updatedAt", description, category, "purchaseDate", "serialNumber", status, "warrantyExpiry", "imageUrl") FROM stdin;
0353a79d-e5cf-4ae8-b4a7-b2badf8d12f8	MacBook Pro M3	2026-05-13 06:45:45.467	2026-05-13 06:45:45.467	14-inch, Space Black	LAPTOP	\N	SN-MBP-001	AVAILABLE	\N	\N
2bbd7948-28af-4fcc-873c-0cc5b028fff8	Studio Display	2026-05-13 06:45:45.469	2026-05-13 06:45:45.469	27-inch 5K Retina	MONITOR	\N	SN-MN-001	IN_USE	\N	\N
a5efdeca-241b-44b8-b910-4b1698fe337c	Mac M5 Pro	2026-05-13 06:45:45.473	2026-05-13 06:45:45.473	\N	LAPTOP	2026-05-28 00:00:00	SN-MN-002	MAINTENANCE	2026-05-18 00:00:00	\N
a0965136-2e9d-47db-9114-22da3322f159	Mac Neon Yellow	2026-05-13 06:45:45.474	2026-05-13 06:45:45.474	\N	LAPTOP	2026-05-10 00:00:00	SN-MN-003	RETIRED	2026-05-31 00:00:00	\N
\.


--
-- Data for Name: BusinessUnit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BusinessUnit" (id, name, "createdAt", "updatedAt") FROM stdin;
804dbc7a-6033-4dd9-a293-b81621d9164e	Tech	2026-05-13 06:45:45.3	2026-05-13 06:45:45.3
1554adf5-55e4-4787-b90b-a80f1480cdc6	Business	2026-05-13 06:45:45.316	2026-05-13 06:45:45.316
4d9e86a2-da2b-48bd-8d9c-a4e595ae7211	Operations	2026-05-13 06:45:45.323	2026-05-13 06:45:45.323
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Department" (id, name, "createdAt", "updatedAt", "businessUnitId") FROM stdin;
d445e86c-9bc4-4903-b808-38b4c575d21b	Development	2026-05-13 06:45:45.306	2026-05-13 06:45:45.306	804dbc7a-6033-4dd9-a293-b81621d9164e
f00e46cd-ca00-48e2-80fc-75c2a5d139dc	IT Support	2026-05-13 06:45:45.313	2026-05-13 06:45:45.313	804dbc7a-6033-4dd9-a293-b81621d9164e
dff0fd30-73b8-4232-8778-547938a222b2	Marketing	2026-05-13 06:45:45.318	2026-05-13 06:45:45.318	1554adf5-55e4-4787-b90b-a80f1480cdc6
776477f8-f5f6-4c22-932a-434d9d2ed4a0	Analytics	2026-05-13 06:45:45.321	2026-05-13 06:45:45.321	1554adf5-55e4-4787-b90b-a80f1480cdc6
675e4937-3227-41e3-be3a-bf5270ecb454	HR	2026-05-13 06:45:45.324	2026-05-13 06:45:45.324	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211
48289ba7-7ce6-477b-bea8-1e503c133151	Finance	2026-05-13 06:45:45.327	2026-05-13 06:45:45.327	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employee" (id, name, email, phone, "businessUnitId", "departmentId", "createdAt", "updatedAt", "jobTitleId", "avatarUrl") FROM stdin;
5b82f6ce-4042-41b7-86d0-f47a697f6226	Regular User	user@example.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	dff0fd30-73b8-4232-8778-547938a222b2	2026-05-13 06:45:45.455	2026-05-13 06:45:45.455	99b4d79c-efab-43b0-a507-2abd510111da	\N
066b6860-c3c8-47c3-9965-ad23dd925ec8	Ei Mheeyai	mheeyai@a.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.466	2026-05-13 06:45:45.466	2b0e07ce-afbb-4684-9478-6e174e90f074	\N
4d1bf14d-6543-4077-98d0-378b6cbc0025	Stefan Flim	flim@a.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	dff0fd30-73b8-4232-8778-547938a222b2	2026-05-13 06:51:34.138	2026-05-13 06:51:34.138	4fcaf8ac-fedb-4178-b580-9ab1779cbba1	\N
0c310d4e-be7b-43a2-8db3-dc9992091e69	Vinny Rodzo	vinny@a.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	776477f8-f5f6-4c22-932a-434d9d2ed4a0	2026-05-13 06:53:57.503	2026-05-13 06:54:13.308	d903f940-25d6-4c1a-8807-e7d8ac1b74f6	/uploads/image-1778655253303-252161534.png
18af2430-be1c-4140-9801-4b9964ffa595	Arthur Pandora	arther@a.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.461	2026-05-13 07:10:57.6	c942fa49-7f71-4320-bb07-2498d951983e	/uploads/image-1778656245453-688300231.png
e29ee5ea-e48f-4134-b091-03f3680c0825	Sprite Pandora	sprite@a.com	\N	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211	675e4937-3227-41e3-be3a-bf5270ecb454	2026-05-13 06:45:45.464	2026-05-13 07:13:55.617	4d08ade7-28c1-47da-93b0-ea78a2d3cdb4	/uploads/image-1778656435606-515509659.png
221dd13c-9e36-4be8-92d8-8b9d8204a340	Admin User	admin@example.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.391	2026-05-13 07:14:22.616	bcc097bb-75b7-41c9-9f77-9eb92d0cfec6	/uploads/image-1778656462612-887161948.jpg
2c7c9bc1-d9cf-4546-8a8e-d0d62170877c	Lee Christmas	lee@a.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 07:14:57.6	2026-05-13 07:14:57.6	c942fa49-7f71-4320-bb07-2498d951983e	\N
499505ab-802f-4f30-ab15-56045b97803a	Lupin Chogun	lupin@a.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	dff0fd30-73b8-4232-8778-547938a222b2	2026-05-13 07:15:12.298	2026-05-13 07:15:12.298	4fcaf8ac-fedb-4178-b580-9ab1779cbba1	\N
906d9808-a9ab-4c6c-b3fd-be9e9a45d569	Silver TurTle	turtle@a.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	776477f8-f5f6-4c22-932a-434d9d2ed4a0	2026-05-13 07:15:35.284	2026-05-13 07:15:35.284	1aa1a159-47dd-4387-bbce-f24314b2fb54	\N
716c1cff-aeda-4d72-be20-900b68f43db3	Tuy Silver	tuy@a.com	\N	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211	48289ba7-7ce6-477b-bea8-1e503c133151	2026-05-13 07:16:05.518	2026-05-13 07:16:05.518	b35d626a-9fae-4b3c-bae8-6aed8173545a	\N
10fcbad4-d5f8-456c-9a69-7561aceef8f7	Spy Silver	spy@a.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 07:16:26.262	2026-05-13 07:16:26.262	c942fa49-7f71-4320-bb07-2498d951983e	\N
851fd009-c225-41a8-8328-5c02eeb76ecf	Cam Kamacho	kla@a.com	\N	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211	675e4937-3227-41e3-be3a-bf5270ecb454	2026-05-13 07:16:49.423	2026-05-13 07:16:49.423	69530e41-35b9-45c1-b1a3-1bda5f2eb7db	\N
39511563-ba5e-4863-b669-4e241492f7b8	Bunny Skaletwitch	bunny@a.com	\N	1554adf5-55e4-4787-b90b-a80f1480cdc6	776477f8-f5f6-4c22-932a-434d9d2ed4a0	2026-05-13 07:17:11.087	2026-05-13 07:17:11.087	d903f940-25d6-4c1a-8807-e7d8ac1b74f6	\N
6740fa9f-78e8-44d5-8309-6a160b2849b0	Jasmine JR	jasmine@a.com	\N	804dbc7a-6033-4dd9-a293-b81621d9164e	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 07:17:39.262	2026-05-13 07:17:39.262	2b0e07ce-afbb-4684-9478-6e174e90f074	\N
4d5da493-c4aa-4e16-bbc1-683629d9b8c7	Yumiko Lucino	yumiko@a.com	\N	4d9e86a2-da2b-48bd-8d9c-a4e595ae7211	675e4937-3227-41e3-be3a-bf5270ecb454	2026-05-13 07:18:01.487	2026-05-13 07:18:01.487	4d08ade7-28c1-47da-93b0-ea78a2d3cdb4	\N
\.


--
-- Data for Name: Employee_Assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employee_Assets" (id, "employeeId", "assetId", "assignedDate", "returnDate", "createdAt", "updatedAt") FROM stdin;
c844553b-2d8d-443f-b658-87cf84faeae0	221dd13c-9e36-4be8-92d8-8b9d8204a340	2bbd7948-28af-4fcc-873c-0cc5b028fff8	2026-05-13 06:45:45.469	\N	2026-05-13 06:45:45.469	2026-05-13 06:45:45.469
\.


--
-- Data for Name: JobTitle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."JobTitle" (id, name, "departmentId", "createdAt", "updatedAt") FROM stdin;
bcc097bb-75b7-41c9-9f77-9eb92d0cfec6	Frontend Developer	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.308	2026-05-13 06:45:45.308
c942fa49-7f71-4320-bb07-2498d951983e	Backend Developer	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.31	2026-05-13 06:45:45.31
2b0e07ce-afbb-4684-9478-6e174e90f074	Full Stack Developer	d445e86c-9bc4-4903-b808-38b4c575d21b	2026-05-13 06:45:45.311	2026-05-13 06:45:45.311
41af3238-d664-4186-8106-3c95c3948d44	IT Support Engineer	f00e46cd-ca00-48e2-80fc-75c2a5d139dc	2026-05-13 06:45:45.314	2026-05-13 06:45:45.314
44987a3b-9dbd-4b4d-aba6-4e0ebbd09c01	System Administrator	f00e46cd-ca00-48e2-80fc-75c2a5d139dc	2026-05-13 06:45:45.315	2026-05-13 06:45:45.315
99b4d79c-efab-43b0-a507-2abd510111da	Marketing Analyst	dff0fd30-73b8-4232-8778-547938a222b2	2026-05-13 06:45:45.319	2026-05-13 06:45:45.319
4fcaf8ac-fedb-4178-b580-9ab1779cbba1	Content Creator	dff0fd30-73b8-4232-8778-547938a222b2	2026-05-13 06:45:45.32	2026-05-13 06:45:45.32
1aa1a159-47dd-4387-bbce-f24314b2fb54	Data Analyst	776477f8-f5f6-4c22-932a-434d9d2ed4a0	2026-05-13 06:45:45.321	2026-05-13 06:45:45.321
d903f940-25d6-4c1a-8807-e7d8ac1b74f6	Business Analyst	776477f8-f5f6-4c22-932a-434d9d2ed4a0	2026-05-13 06:45:45.322	2026-05-13 06:45:45.322
69530e41-35b9-45c1-b1a3-1bda5f2eb7db	HR Officer	675e4937-3227-41e3-be3a-bf5270ecb454	2026-05-13 06:45:45.325	2026-05-13 06:45:45.325
4d08ade7-28c1-47da-93b0-ea78a2d3cdb4	Recruiter	675e4937-3227-41e3-be3a-bf5270ecb454	2026-05-13 06:45:45.326	2026-05-13 06:45:45.326
d2118a62-6f62-454e-8e53-2a00ac188226	Accountant	48289ba7-7ce6-477b-bea8-1e503c133151	2026-05-13 06:45:45.328	2026-05-13 06:45:45.328
b35d626a-9fae-4b3c-bae8-6aed8173545a	Financial Analyst	48289ba7-7ce6-477b-bea8-1e503c133151	2026-05-13 06:45:45.329	2026-05-13 06:45:45.329
\.


--
-- Data for Name: License; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."License" (id, name, vendor, type, "totalSeats", status, "expiryDate", price, "billingCycle", "annualCost", color, "createdAt", "updatedAt") FROM stdin;
6531f90f-3ee9-4f5b-9a24-e48f5da17f80	Adobe Creative Cloud	Adobe	Subscription	50	ACTIVE	2026-12-15 00:00:00	$2,400	Monthly	$28,800	rose	2026-05-13 06:45:45.475	2026-05-13 06:45:45.475
20751ed1-3389-4587-979c-3349d7fa432d	Microsoft 365 Business	Microsoft	Subscription	250	ACTIVE	2027-01-20 00:00:00	$5,500	Annual	$5,500	blue	2026-05-13 06:45:45.477	2026-05-13 06:45:45.477
52aa58a7-c42e-4802-9851-76c0f0380f5e	Codex	OpenAI	Subscription	30	ACTIVE	2026-08-05 00:00:00	$1,200	Monthly	$14,400	indigo	2026-05-13 06:45:45.478	2026-05-13 06:45:45.478
779b4128-e586-485a-a5a8-2cced8b5ee21	Claude	Anthropic	Subscription	20	WARNING	2026-07-31 00:00:00	$700	Monthly	$8,400	emerald	2026-05-13 06:45:45.479	2026-05-13 06:45:45.479
655920c5-9b83-4dad-a205-066509d2b87e	AWS	Amazon Web Services	Cloud Subscription	15	CRITICAL	2026-06-30 00:00:00	$2,000	Monthly	$24,000	amber	2026-05-13 06:45:45.48	2026-05-13 06:45:45.48
\.


--
-- Data for Name: LicenseAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LicenseAssignment" (id, "licenseId", "employeeId", "assignedDate", "createdAt", "updatedAt") FROM stdin;
e15adbb5-edbf-4b88-b607-631e17c7a67e	6531f90f-3ee9-4f5b-9a24-e48f5da17f80	221dd13c-9e36-4be8-92d8-8b9d8204a340	2026-05-13 06:45:45.482	2026-05-13 06:45:45.482	2026-05-13 06:45:45.482
1761dac3-2d85-4124-baa9-78bf833d0848	6531f90f-3ee9-4f5b-9a24-e48f5da17f80	5b82f6ce-4042-41b7-86d0-f47a697f6226	2026-05-13 06:45:45.485	2026-05-13 06:45:45.485	2026-05-13 06:45:45.485
25f04d4f-074f-45e5-998c-60d08856d70d	6531f90f-3ee9-4f5b-9a24-e48f5da17f80	066b6860-c3c8-47c3-9965-ad23dd925ec8	2026-05-13 06:45:45.486	2026-05-13 06:45:45.486	2026-05-13 06:45:45.486
38fa7c7c-fe3f-4bda-96c4-80c39ec29edf	20751ed1-3389-4587-979c-3349d7fa432d	221dd13c-9e36-4be8-92d8-8b9d8204a340	2026-05-13 06:45:45.487	2026-05-13 06:45:45.487	2026-05-13 06:45:45.487
949a77a7-4821-469e-a349-9dca8ded09e7	20751ed1-3389-4587-979c-3349d7fa432d	5b82f6ce-4042-41b7-86d0-f47a697f6226	2026-05-13 06:45:45.488	2026-05-13 06:45:45.488	2026-05-13 06:45:45.488
913f79eb-1346-43f1-905a-295c324df029	20751ed1-3389-4587-979c-3349d7fa432d	18af2430-be1c-4140-9801-4b9964ffa595	2026-05-13 06:45:45.489	2026-05-13 06:45:45.489	2026-05-13 06:45:45.489
cd09dacb-9cc4-49c4-ba9d-18872ef49dfe	52aa58a7-c42e-4802-9851-76c0f0380f5e	18af2430-be1c-4140-9801-4b9964ffa595	2026-05-13 06:45:45.49	2026-05-13 06:45:45.49	2026-05-13 06:45:45.49
b70d12c4-e53b-4a31-861b-c1d42ccc0900	52aa58a7-c42e-4802-9851-76c0f0380f5e	066b6860-c3c8-47c3-9965-ad23dd925ec8	2026-05-13 06:45:45.491	2026-05-13 06:45:45.491	2026-05-13 06:45:45.491
bdeae5a8-0020-45f0-9ff7-bc36771a9470	779b4128-e586-485a-a5a8-2cced8b5ee21	e29ee5ea-e48f-4134-b091-03f3680c0825	2026-05-13 06:45:45.492	2026-05-13 06:45:45.492	2026-05-13 06:45:45.492
0818a466-f7da-4e0f-b4a3-cc1f4a71abdb	779b4128-e586-485a-a5a8-2cced8b5ee21	221dd13c-9e36-4be8-92d8-8b9d8204a340	2026-05-13 06:45:45.493	2026-05-13 06:45:45.493	2026-05-13 06:45:45.493
7f80e77c-d998-44b0-bf97-eb4e622d00b6	655920c5-9b83-4dad-a205-066509d2b87e	221dd13c-9e36-4be8-92d8-8b9d8204a340	2026-05-13 06:45:45.494	2026-05-13 06:45:45.494	2026-05-13 06:45:45.494
eef9b2d8-71f3-4d6d-b359-951741afb522	655920c5-9b83-4dad-a205-066509d2b87e	5b82f6ce-4042-41b7-86d0-f47a697f6226	2026-05-13 06:45:45.495	2026-05-13 06:45:45.495	2026-05-13 06:45:45.495
4a424d7d-9383-42c4-ab28-f09501ea86ed	655920c5-9b83-4dad-a205-066509d2b87e	e29ee5ea-e48f-4134-b091-03f3680c0825	2026-05-13 06:45:45.496	2026-05-13 06:45:45.496	2026-05-13 06:45:45.496
\.


--
-- Data for Name: UserLogin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLogin" (id, username, password, role, "employeeId", "createdAt", "updatedAt") FROM stdin;
7cb7ee67-1a4b-4df7-bf20-75260176276e	admin	$2b$10$4/d/1hDBOzworl8dfnWb/.Cq6B1LOej5K0SvQ3Op0ofLoM7f6mP3u	admin	221dd13c-9e36-4be8-92d8-8b9d8204a340	2026-05-13 06:45:45.391	2026-05-13 06:45:45.397
d01b61e7-8ab2-4cc4-83a3-83c4cdb1fc92	user	$2b$10$Jk9aWkxZLaq/RrO76HpdBOGct4b7EMduMtSRCgQkbR9L97ovqeS/G	user	5b82f6ce-4042-41b7-86d0-f47a697f6226	2026-05-13 06:45:45.455	2026-05-13 06:45:45.459
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a8deac51-ac28-4b6d-999d-f044b9ba23d5	d269efded1d3e0abb5041acfd698775e85687ec6613faac0ec392e5554bcc03c	2026-05-13 13:45:08.078968+07	20260505041323_sync_mock_data_schema	\N	\N	2026-05-13 13:45:08.057941+07	1
34d7f60e-1fb7-4574-9c0b-6862c1b6af8a	783a881900572fcbbe42e96df61a02e5741f92f0818e421ea43bb708a2e30941	2026-05-13 13:45:08.134359+07	20260505073626_init_new_schema	\N	\N	2026-05-13 13:45:08.079851+07	1
5ccd547c-47ad-43fa-9faa-629b74206e94	54f54a1954ae00384c094c8a7d8442868afe69127274ecd6cd2ab326c4f7bed0	2026-05-13 13:45:08.143191+07	20260505090424_finalize_schema_alignment	\N	\N	2026-05-13 13:45:08.135116+07	1
a2276073-d12e-46d1-b6ab-7883c6fa798d	df0466e44b882e1eafd63fcf083d94e9c7e12ca9208d2cee0145ae1066b9b598	2026-05-13 13:45:08.154565+07	20260505101209_add_org_hierarchy	\N	\N	2026-05-13 13:45:08.143812+07	1
7496fdec-97da-406b-9f77-b4c0c6cf6d1c	b7adfde92b350b40804230073e5c87c4e367d8b8027e062b4eb9a35f1aa9376c	2026-05-13 13:45:08.170546+07	20260513000000_add_license_management	\N	\N	2026-05-13 13:45:08.155364+07	1
a15f9801-f413-4e54-8dfe-50857edf1a94	f19b6abe63ed7e4e1696aaee90f35b2a7ab25dd799fd98d8394bde3d8af12c69	2026-05-13 13:45:42.192841+07	20260513064542_license	\N	\N	2026-05-13 13:45:42.190891+07	1
\.


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: BusinessUnit BusinessUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BusinessUnit"
    ADD CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Employee_Assets Employee_Assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee_Assets"
    ADD CONSTRAINT "Employee_Assets_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: JobTitle JobTitle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JobTitle"
    ADD CONSTRAINT "JobTitle_pkey" PRIMARY KEY (id);


--
-- Name: LicenseAssignment LicenseAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LicenseAssignment"
    ADD CONSTRAINT "LicenseAssignment_pkey" PRIMARY KEY (id);


--
-- Name: License License_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."License"
    ADD CONSTRAINT "License_pkey" PRIMARY KEY (id);


--
-- Name: UserLogin UserLogin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLogin"
    ADD CONSTRAINT "UserLogin_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Asset_serialNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Asset_serialNumber_key" ON public."Asset" USING btree ("serialNumber");


--
-- Name: BusinessUnit_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BusinessUnit_name_key" ON public."BusinessUnit" USING btree (name);


--
-- Name: Employee_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Employee_email_key" ON public."Employee" USING btree (email);


--
-- Name: LicenseAssignment_licenseId_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LicenseAssignment_licenseId_employeeId_key" ON public."LicenseAssignment" USING btree ("licenseId", "employeeId");


--
-- Name: License_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "License_name_key" ON public."License" USING btree (name);


--
-- Name: UserLogin_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserLogin_employeeId_key" ON public."UserLogin" USING btree ("employeeId");


--
-- Name: UserLogin_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserLogin_username_key" ON public."UserLogin" USING btree (username);


--
-- Name: Department Department_businessUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES public."BusinessUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Employee_Assets Employee_Assets_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee_Assets"
    ADD CONSTRAINT "Employee_Assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Employee_Assets Employee_Assets_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee_Assets"
    ADD CONSTRAINT "Employee_Assets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Employee Employee_businessUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES public."BusinessUnit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_jobTitleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES public."JobTitle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JobTitle JobTitle_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JobTitle"
    ADD CONSTRAINT "JobTitle_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LicenseAssignment LicenseAssignment_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LicenseAssignment"
    ADD CONSTRAINT "LicenseAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LicenseAssignment LicenseAssignment_licenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LicenseAssignment"
    ADD CONSTRAINT "LicenseAssignment_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES public."License"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserLogin UserLogin_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLogin"
    ADD CONSTRAINT "UserLogin_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Qtcf8nDJvKA7hL7EvsrhJUUcuo6KaF1fsx5MfVS8Ff8N2IBG0F7U6bxYFEtd5UH

