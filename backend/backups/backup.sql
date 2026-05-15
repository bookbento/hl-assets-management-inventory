--
-- PostgreSQL database dump
--

\restrict PvNhtGJrtdVWXChhOWCVL4nbqqRKfauMBAVlXFNzhVJ2LSqRZqE8HDi9sOHpTPi

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
    "warrantyExpiry" timestamp(3) without time zone
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
    "jobTitleId" text NOT NULL
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

COPY public."Asset" (id, name, "createdAt", "updatedAt", description, category, "purchaseDate", "serialNumber", status, "warrantyExpiry") FROM stdin;
e7780c21-795f-4819-9fe7-2cdf664dcbaf	MacBook Pro M3	2026-05-07 02:18:03.526	2026-05-08 03:46:43.574	14-inch, Space Black	LAPTOP	\N	SN-MBP-001	AVAILABLE	\N
d3259fe6-4778-4ac2-9026-67f44fe5748a	Studio Display	2026-05-07 02:18:03.53	2026-05-08 03:46:43.576	27-inch 5K Retina	MONITOR	\N	SN-MN-001	IN_USE	\N
ccb1181c-84aa-46b7-ac69-4809e81d7388	Mac M5 Pro	2026-05-07 09:36:11.582	2026-05-08 03:46:43.583	\N	LAPTOP	2026-05-28 00:00:00	SN-MN-002	MAINTENANCE	2026-05-18 00:00:00
1b1d5a29-ebba-469c-8aaf-d61405d46224	Mac Neon Yellow	2026-05-07 09:40:56.974	2026-05-08 03:46:43.585	\N	LAPTOP	2026-05-10 00:00:00	SN-MN-003	RETIRED	2026-05-31 00:00:00
\.


--
-- Data for Name: BusinessUnit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BusinessUnit" (id, name, "createdAt", "updatedAt") FROM stdin;
133c0b73-a03b-4aa8-96e1-31b29749d26f	Tech	2026-05-07 02:18:03.351	2026-05-07 02:18:03.351
2e9d3a8a-dd30-4ce9-9e53-1492c674c954	Business	2026-05-07 02:18:03.376	2026-05-07 02:18:03.376
2056c275-f412-4b11-8d06-b903a073069f	Operations	2026-05-07 02:18:03.383	2026-05-07 02:18:03.383
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Department" (id, name, "createdAt", "updatedAt", "businessUnitId") FROM stdin;
76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	Development	2026-05-07 02:18:03.367	2026-05-07 02:18:03.367	133c0b73-a03b-4aa8-96e1-31b29749d26f
02a2156f-f3c2-4313-996f-b971c39283b9	IT Support	2026-05-07 02:18:03.374	2026-05-07 02:18:03.374	133c0b73-a03b-4aa8-96e1-31b29749d26f
9d5c6914-457d-4767-83eb-b0dbb81ba583	Marketing	2026-05-07 02:18:03.378	2026-05-07 02:18:03.378	2e9d3a8a-dd30-4ce9-9e53-1492c674c954
5137cd1e-5635-4d47-8dd6-f9a53927cfa0	Analytics	2026-05-07 02:18:03.381	2026-05-07 02:18:03.381	2e9d3a8a-dd30-4ce9-9e53-1492c674c954
3fd76099-5fd9-48d7-ad3e-be3521e7d6d6	HR	2026-05-07 02:18:03.384	2026-05-07 02:18:03.384	2056c275-f412-4b11-8d06-b903a073069f
a6e52830-17dc-4867-8417-60cac42ab9b0	Finance	2026-05-07 02:18:03.386	2026-05-07 02:18:03.386	2056c275-f412-4b11-8d06-b903a073069f
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employee" (id, name, email, phone, "businessUnitId", "departmentId", "createdAt", "updatedAt", "jobTitleId") FROM stdin;
40165116-665c-4c6b-8568-3ffdce8ea4b5	Admin User	admin@example.com	\N	133c0b73-a03b-4aa8-96e1-31b29749d26f	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 02:18:03.451	2026-05-08 03:46:43.487	fc35fb2d-d55b-4e7c-81be-697c768f481d
e8035345-dce5-4606-8d76-4875cbb5b220	Regular User	user@example.com	\N	2e9d3a8a-dd30-4ce9-9e53-1492c674c954	9d5c6914-457d-4767-83eb-b0dbb81ba583	2026-05-07 02:18:03.522	2026-05-08 03:46:43.56	8de7c09a-a028-4fc5-a243-b7d034d9a050
1621d2f3-3c9a-4884-8646-1a15de5f0380	Zen Pandora	zen@a.com	\N	133c0b73-a03b-4aa8-96e1-31b29749d26f	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 03:48:52.413	2026-05-08 03:46:43.567	52caaf1f-2061-4856-ab46-f579f2dbb6ca
d0b8c003-cbc4-469d-be87-4f3039c529aa	Sprite Pandora	sprite@a.com	\N	2056c275-f412-4b11-8d06-b903a073069f	3fd76099-5fd9-48d7-ad3e-be3521e7d6d6	2026-05-07 02:32:02.602	2026-05-08 03:46:43.57	852ad2c8-fb10-4168-b5ae-35c15557293a
3ca5e0b2-30bb-4b53-b0c2-9246f18dd880	Ei Mheeyai	mheeyai@a.com	\N	133c0b73-a03b-4aa8-96e1-31b29749d26f	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 09:21:04.443	2026-05-08 03:46:43.573	0456281a-a770-4c21-af98-073fe9807386
\.


--
-- Data for Name: Employee_Assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employee_Assets" (id, "employeeId", "assetId", "assignedDate", "returnDate", "createdAt", "updatedAt") FROM stdin;
861d6bb6-19d2-45ec-83de-3a2d08c9773f	40165116-665c-4c6b-8568-3ffdce8ea4b5	d3259fe6-4778-4ac2-9026-67f44fe5748a	2026-05-07 02:18:03.53	\N	2026-05-07 02:18:03.53	2026-05-07 02:18:03.53
\.


--
-- Data for Name: JobTitle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."JobTitle" (id, name, "departmentId", "createdAt", "updatedAt") FROM stdin;
fc35fb2d-d55b-4e7c-81be-697c768f481d	Frontend Developer	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 02:18:03.371	2026-05-07 02:18:03.371
52caaf1f-2061-4856-ab46-f579f2dbb6ca	Backend Developer	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 02:18:03.372	2026-05-07 02:18:03.372
0456281a-a770-4c21-af98-073fe9807386	Full Stack Developer	76e7498e-c3ec-453a-a53f-e3cf6ea9b84e	2026-05-07 02:18:03.373	2026-05-07 02:18:03.373
07d3b103-acc9-4db5-83bd-df9c4aae9f3b	IT Support Engineer	02a2156f-f3c2-4313-996f-b971c39283b9	2026-05-07 02:18:03.375	2026-05-07 02:18:03.375
6959b754-537b-4e7f-b9db-136cd4c1c252	System Administrator	02a2156f-f3c2-4313-996f-b971c39283b9	2026-05-07 02:18:03.376	2026-05-07 02:18:03.376
8de7c09a-a028-4fc5-a243-b7d034d9a050	Marketing Analyst	9d5c6914-457d-4767-83eb-b0dbb81ba583	2026-05-07 02:18:03.379	2026-05-07 02:18:03.379
11def29f-4818-4265-b978-0578ee0a52a0	Content Creator	9d5c6914-457d-4767-83eb-b0dbb81ba583	2026-05-07 02:18:03.38	2026-05-07 02:18:03.38
041cb881-f69f-4695-8dfb-3116ca1d6579	Data Analyst	5137cd1e-5635-4d47-8dd6-f9a53927cfa0	2026-05-07 02:18:03.381	2026-05-07 02:18:03.381
bb5e15cc-8dbb-4eec-9e4f-760fb6444030	Business Analyst	5137cd1e-5635-4d47-8dd6-f9a53927cfa0	2026-05-07 02:18:03.382	2026-05-07 02:18:03.382
5b3e4412-3250-4503-8315-271a079af7b6	HR Officer	3fd76099-5fd9-48d7-ad3e-be3521e7d6d6	2026-05-07 02:18:03.384	2026-05-07 02:18:03.384
852ad2c8-fb10-4168-b5ae-35c15557293a	Recruiter	3fd76099-5fd9-48d7-ad3e-be3521e7d6d6	2026-05-07 02:18:03.385	2026-05-07 02:18:03.385
9af289f3-ba41-4444-80e7-ebe575fe41a7	Accountant	a6e52830-17dc-4867-8417-60cac42ab9b0	2026-05-07 02:18:03.386	2026-05-07 02:18:03.386
4be914bb-d7d5-49d2-a1bd-9efd54e6559c	Financial Analyst	a6e52830-17dc-4867-8417-60cac42ab9b0	2026-05-07 02:18:03.387	2026-05-07 02:18:03.387
\.


--
-- Data for Name: UserLogin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLogin" (id, username, password, role, "employeeId", "createdAt", "updatedAt") FROM stdin;
e4f3b358-2b73-4197-9618-4b6b796e0cac	admin	$2b$10$voFl.DfmiCcmveiY2x68yekahPNufqQrlrIrZ9HmZHejvoJbqgpHS	admin	40165116-665c-4c6b-8568-3ffdce8ea4b5	2026-05-07 02:18:03.451	2026-05-08 03:46:43.498
7d47b636-b6d2-4245-b7e1-cab5dba5dd7d	user	$2b$10$yEWM6o4QPqeYk6RjFFu.4OF7KGPGaPB3uPfd486F5Y2AqxyCwWpWS	user	e8035345-dce5-4606-8d76-4875cbb5b220	2026-05-07 02:18:03.522	2026-05-08 03:46:43.563
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3410c331-927c-4f07-a927-4c951e93a04b	d269efded1d3e0abb5041acfd698775e85687ec6613faac0ec392e5554bcc03c	2026-05-07 09:17:59.180917+07	20260505041323_sync_mock_data_schema	\N	\N	2026-05-07 09:17:59.170809+07	1
398b3d78-b702-452f-a8a7-6bc8dd20810b	783a881900572fcbbe42e96df61a02e5741f92f0818e421ea43bb708a2e30941	2026-05-07 09:17:59.218912+07	20260505073626_init_new_schema	\N	\N	2026-05-07 09:17:59.181624+07	1
f76455d5-c840-406d-9c4d-d4120ca91636	54f54a1954ae00384c094c8a7d8442868afe69127274ecd6cd2ab326c4f7bed0	2026-05-07 09:17:59.227263+07	20260505090424_finalize_schema_alignment	\N	\N	2026-05-07 09:17:59.219452+07	1
1dfb6ae0-2e58-497a-9b92-822ce6627e9e	df0466e44b882e1eafd63fcf083d94e9c7e12ca9208d2cee0145ae1066b9b598	2026-05-07 09:17:59.237901+07	20260505101209_add_org_hierarchy	\N	\N	2026-05-07 09:17:59.227912+07	1
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
-- Name: UserLogin UserLogin_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLogin"
    ADD CONSTRAINT "UserLogin_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PvNhtGJrtdVWXChhOWCVL4nbqqRKfauMBAVlXFNzhVJ2LSqRZqE8HDi9sOHpTPi

