-- Docket Entries INSERT Statements
-- Generated from: /home/user/lexiflow-premium/04_24-2160_Docket.xml
-- Total entries: 151
-- Date: 2025-12-27 02:50:37

-- First, get the case_id for case 24-2160
DO $$
DECLARE
    v_case_id UUID;
BEGIN
    -- Get case_id
    SELECT id INTO v_case_id FROM cases WHERE case_number = '24-2160';

    IF v_case_id IS NULL THEN
        RAISE EXCEPTION 'Case 24-2160 not found';
    END IF;

    -- Insert docket entries
    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'e210e5f3-8b41-4a2e-8d6a-d925324a3f28',
        v_case_id,
        1,
        '2024-11-20',
        'Filing',
        'Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. AW',
        'Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. [1001674931] [24-2160] AW',
        NULL,
        FALSE,
        '1001674931',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '39fcdeb3-ec94-4673-a381-fe06873a1625',
        v_case_id,
        2,
        '2024-11-20',
        'Order',
        'INFORMAL BRIEFING ORDER filed. Mailed to: Saadein-Morales. Informal Opening Brief due 12/16/2024 Informal response brief, if any: 14 days after informal opening brief served. AW',
        'INFORMAL BRIEFING ORDER filed. Mailed to: Saadein-Morales. [1001674934] Informal Opening Brief due 12/16/2024 Informal response brief, if any: 14 days after informal opening brief served. [24-2160] AW',
        NULL,
        FALSE,
        '1001674934',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '19deac89-d984-401e-a53f-ef5efdeafbfb',
        v_case_id,
        3,
        '2024-11-20',
        'Filing',
        'RECORD requested from Clerk of Court . Due: 12/04/2024. AW',
        'RECORD requested from Clerk of Court  [1001674943]. Due: 12/04/2024. [24-2160] AW',
        NULL,
        FALSE,
        '1001674943',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '2bea80d0-d347-45a9-938f-530a88ebcdef',
        v_case_id,
        4,
        '2024-11-22',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay; GRANT emergency motion; GRANT an administrative stay and STAY enforcement of State Court Order and all related proceedings; 3. ENJOIN collection or enforcement actions pending appeal; 4. WAIVE bond; GRANT any additional relief , for stay pending appeal. Date of action to be stayed, if applicable:November 15, 2024. , for injunctive relief pending appeal Date of action to be enjoined: November 15, 2024. Date and method of service: 11/22/2024 ecf. Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay; GRANT emergency motion; GRANT an administrative stay and STAY enforcement of State Court Order and all related proceedings; 3. ENJOIN collection or enforcement actions pending appeal; 4. WAIVE bond; GRANT any additional relief , for stay pending appeal. Date of action to be stayed, if applicable:November 15, 2024. , for injunctive relief pending appeal Date of action to be enjoined: November 15, 2024. Date and method of service: 11/22/2024 ecf.      [1001676053] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales to enforce automatic stay; GRANT emergency motion; GRANT an administrative stay and STAY enforcement of State Court Order and all related proceedings; 3',
        FALSE,
        '1001676053',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'ebea790f-b76d-45ef-bfd1-d1e9f7f7ac99',
        v_case_id,
        5,
        '2024-11-22',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal  [1001676088] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001676088',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4e8b08a5-bcc9-4a60-9e3d-afb089d96039',
        v_case_id,
        6,
        '2024-11-22',
        'Filing',
        'APPEARANCE OF COUNSEL by Richard A. Lash for Westridge Swim & Racquet Club, Inc.. Richard Lash',
        'APPEARANCE OF COUNSEL by Richard A. Lash for Westridge Swim & Racquet Club, Inc.. [1001676523] [24-2160] Richard Lash',
        'Richard A',
        FALSE,
        '1001676523',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'd8cd0f95-04d3-4373-a0d7-66b714593d17',
        v_case_id,
        7,
        '2024-11-22',
        'Filing',
        'DISCLOSURE STATEMENT by Westridge Swim & Racquet Club, Inc.. Was any question on Disclosure Form answered yes? Yes Richard Lash',
        'DISCLOSURE STATEMENT by Westridge Swim & Racquet Club, Inc..  Was any question on Disclosure Form answered yes? Yes [1001676525] [24-2160] Richard Lash',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001676525',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '19cd0d44-56c8-40f7-b0b7-e20f6698d137',
        v_case_id,
        8,
        '2024-11-22',
        'Motion',
        'SUPPLEMENT to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal by Justin Jeffrey Saadein-Morales. Justin Saadein-Morales',
        'SUPPLEMENT   to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal by Justin Jeffrey Saadein-Morales. [1001676592] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001676592',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1aaea8f0-e302-462c-92d5-c5defc126987',
        v_case_id,
        9,
        '2024-11-22',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010039020'' target=''new'' ONCLICK="return doDocPostURL(''004010039020'',''177028'');" >8</A>] supplement Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010039020'' target=''new'' ONCLICK="return doDocPostURL(''004010039020'',''177028'');" >8</A>] supplement  [1001676595] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001676595',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '735e4144-fdca-4950-9a47-2d2068ac41b9',
        v_case_id,
        10,
        '2024-11-25',
        'Motion',
        'NOTICE ISSUED to Westridge Swim & Racquet Club, Inc. requesting response to Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]. Response due: 12/02/2024 by Noon.. Mailed to: Saadein-Morales. AW',
        'NOTICE ISSUED to Westridge Swim & Racquet Club, Inc.  requesting response to Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]. Response due: 12/02/2024 by Noon.[1001677163]. Mailed to: Saadein-Morales. [24-2160] AW',
        'Noon',
        FALSE,
        '1001677163',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'ba49b990-c22a-48ea-b4d4-de67b4474ec9',
        v_case_id,
        11,
        '2024-11-26',
        'Filing',
        'APPEARANCE OF COUNSEL by Thomas C. Junker (VSB #29928) for Westridge Swim & Racquet Club, Inc.. Thomas Junker',
        'APPEARANCE OF COUNSEL by Thomas C. Junker (VSB #29928) for Westridge Swim & Racquet Club, Inc.. [1001678163] [24-2160] Thomas Junker',
        'Thomas C',
        FALSE,
        '1001678163',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'b5035c9f-0fbc-40e7-817c-8cac3b76738c',
        v_case_id,
        12,
        '2024-11-26',
        'Filing',
        'DISCLOSURE STATEMENT by Westridge Swim & Racquet Club, Inc.. Was any question on Disclosure Form answered yes? Yes Thomas Junker',
        'DISCLOSURE STATEMENT by Westridge Swim & Racquet Club, Inc..  Was any question on Disclosure Form answered yes? Yes [1001678166] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001678166',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '92783113-724f-4492-ad7b-ff13f8ce3a7a',
        v_case_id,
        13,
        '2024-12-02',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. to notice requesting response [<A HREF=''_SERVLETURL_/docs1/004010040263'' target=''new'' ONCLICK="return doDocPostURL(''004010040263'',''177028'');" >10</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]. Nature of response: in opposition. Richard Lash',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc.   to notice requesting response [<A HREF=''_SERVLETURL_/docs1/004010040263'' target=''new'' ONCLICK="return doDocPostURL(''004010040263'',''177028'');" >10</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]. Nature of response: in opposition. [1001679421] [24-2160] Richard Lash',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001679421',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '16d38266-15d1-4434-a53c-5cd838c4df66',
        v_case_id,
        14,
        '2024-12-04',
        'Reply',
        'NOTICE by Justin Jeffrey Saadein-Morales that a reply will not be filed.. Justin Saadein-Morales',
        'NOTICE by Justin Jeffrey Saadein-Morales that a reply will not be filed.. [1001681103] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales that a reply will not be filed',
        FALSE,
        '1001681103',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '83fc3e03-2cba-494c-b28a-70801351b695',
        v_case_id,
        15,
        '2024-12-04',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010048989'' target=''new'' ONCLICK="return doDocPostURL(''004010048989'',''177028'');" >14</A>] Notice Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010048989'' target=''new'' ONCLICK="return doDocPostURL(''004010048989'',''177028'');" >14</A>] Notice  [1001681108] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001681108',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '0a4f511a-0455-43cd-911a-f410ea9b1bc7',
        v_case_id,
        16,
        '2024-12-06',
        'Motion',
        'SUPPLEMENT to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010039020'' target=''new'' ONCLICK="return doDocPostURL(''004010039020'',''177028'');" >8</A>] supplement by Justin Jeffrey Saadein-Morales. Justin Saadein-Morales',
        'SUPPLEMENT   to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010039020'' target=''new'' ONCLICK="return doDocPostURL(''004010039020'',''177028'');" >8</A>] supplement by Justin Jeffrey Saadein-Morales. [1001682637] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001682637',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '53963c2e-4dd2-40ed-8eeb-6d63648f6514',
        v_case_id,
        17,
        '2024-12-06',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement  [1001682644] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001682644',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'cb094fec-4eb7-4881-8883-572b64057269',
        v_case_id,
        18,
        '2024-12-06',
        'Certificate',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement, [<A HREF=''_SERVLETURL_/docs1/004010052411'' target=''new'' ONCLICK="return doDocPostURL(''004010052411'',''177028'');" >17</A>] certificate by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement, [<A HREF=''_SERVLETURL_/docs1/004010052411'' target=''new'' ONCLICK="return doDocPostURL(''004010052411'',''177028'');" >17</A>] certificate by Justin Jeffrey Saadein-Morales..   [1001682656] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001682656',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1ee8099f-f582-4b7a-b4dd-d6b009970a5f',
        v_case_id,
        19,
        '2024-12-06',
        'Motion',
        'AFFIDAVIT by Appellant Justin Jeffrey Saadein-Morales re: [16] SUPPLEMENT and [8] SUPPLEMENT to [4] Motion to enforce, [4] Motion for stay pending appeal, [4] Motion for injunctive relief pending appeal; [4] Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay. Justin Saadein-Morales',
        'AFFIDAVIT by Appellant Justin Jeffrey Saadein-Morales re: [16] SUPPLEMENT and [8] SUPPLEMENT to [4] Motion to enforce, [4] Motion for stay pending appeal, [4] Motion for injunctive relief pending appeal; [4] Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay. [1001682732] [24-2160] Justin Saadein-Morales',
        'Appellant Justin Jeffrey Saadein-Morales re: [16] SUPPLEMENT and [8] SUPPLEMENT to [4] Motion to enforce, [4] Motion for stay pending appeal, [4] Motion for injunctive relief pending appeal; [4] Emergency MOTION by Justin Jeffrey Saadein-Morales to enforc',
        FALSE,
        '1001682732',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '85bd4d0f-b455-4e4b-bf79-ed7b1827768d',
        v_case_id,
        20,
        '2024-12-06',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010052618'' target=''new'' ONCLICK="return doDocPostURL(''004010052618'',''177028'');" >19</A>] affidavit Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010052618'' target=''new'' ONCLICK="return doDocPostURL(''004010052618'',''177028'');" >19</A>] affidavit  [1001682737] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001682737',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'f270e476-6574-469f-96f9-c274fa631875',
        v_case_id,
        21,
        '2024-12-17',
        'Motion',
        'SUPPLEMENT to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement by Justin Jeffrey Saadein-Morales. Justin Saadein-Morales',
        'SUPPLEMENT   to [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010052396'' target=''new'' ONCLICK="return doDocPostURL(''004010052396'',''177028'');" >16</A>] supplement by Justin Jeffrey Saadein-Morales. [1001688264] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001688264',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8ee3910b-ba5c-461b-95b6-baec30fe784d',
        v_case_id,
        22,
        '2024-12-17',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010064645'' target=''new'' ONCLICK="return doDocPostURL(''004010064645'',''177028'');" >21</A>] supplement Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010064645'' target=''new'' ONCLICK="return doDocPostURL(''004010064645'',''177028'');" >21</A>] supplement  [1001688269] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001688269',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'e72580db-aa0a-4f90-b38a-20ec8d0b9aaf',
        v_case_id,
        23,
        '2024-12-17',
        'Exhibit',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010064645'' target=''new'' ONCLICK="return doDocPostURL(''004010064645'',''177028'');" >21</A>] supplement by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010064645'' target=''new'' ONCLICK="return doDocPostURL(''004010064645'',''177028'');" >21</A>] supplement by Justin Jeffrey Saadein-Morales..   [1001688276] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001688276',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'b7485ed7-d7b7-4c08-8fc2-0a82b8673179',
        v_case_id,
        24,
        '2024-12-18',
        'Brief',
        'INFORMAL OPENING BRIEF by Justin Jeffrey Saadein-Morales. Justin Saadein-Morales',
        'INFORMAL OPENING BRIEF by Justin Jeffrey Saadein-Morales. [1001688932] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001688932',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8b1e1e65-04cb-4f83-8f42-8604f4771706',
        v_case_id,
        25,
        '2024-12-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010066176'' target=''new'' ONCLICK="return doDocPostURL(''004010066176'',''177028'');" >24</A>] informal opening brief Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010066176'' target=''new'' ONCLICK="return doDocPostURL(''004010066176'',''177028'');" >24</A>] informal opening brief  [1001688939] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001688939',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3839b2e4-f29d-463f-8f48-95ee3deec36b',
        v_case_id,
        26,
        '2024-12-18',
        'Motion',
        'COURT ORDER filed denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]; denying Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]; denying Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Copies to all parties. Donna Lett',
        'COURT ORDER filed denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]; denying Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>]; denying Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010037735'' target=''new'' ONCLICK="return doDocPostURL(''004010037735'',''177028'');" >4</A>] Copies to all parties. [1001689280] [24-2160] Donna Lett',
        NULL,
        FALSE,
        '1001689280',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '37327c00-6b27-4a4d-94b3-c56dc9342ab6',
        v_case_id,
        27,
        '2024-12-23',
        'Motion',
        'MOTION by Westridge Swim & Racquet Club, Inc. to dismiss appeal [27]. Date and method of service: 12/23/2024 US mail. Richard Lash',
        'MOTION by Westridge Swim & Racquet Club, Inc. to dismiss appeal [27]. Date and method of service: 12/23/2024 US mail.      [1001691929] [24-2160] Richard Lash',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001691929',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '73c48359-6fe4-40c1-b69d-23c69573209b',
        v_case_id,
        28,
        '2024-12-23',
        'Motion',
        'NOTICE ISSUED to Justin Jeffrey Saadein-Morales requesting response to Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>]. Response due 01/02/2025.. AW',
        'NOTICE ISSUED to Justin Jeffrey Saadein-Morales  requesting response to Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>]. Response due 01/02/2025.[1001692157]. [24-2160] AW',
        NULL,
        FALSE,
        '1001692157',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '61a52aca-c425-46b7-ba5f-6096a6346e09',
        v_case_id,
        29,
        '2024-12-30',
        'Response',
        'INFORMAL RESPONSE BRIEF by Westridge Swim & Racquet Club, Inc.. Thomas Junker',
        'INFORMAL RESPONSE BRIEF by Westridge Swim & Racquet Club, Inc.. [1001693334] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001693334',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a365d347-b0aa-4c6f-ae2d-e9740003d4ec',
        v_case_id,
        30,
        '2025-01-02',
        'Motion',
        'RESPONSE by Justin Jeffrey Saadein-Morales to notice requesting response [<A HREF=''_SERVLETURL_/docs1/004010073236'' target=''new'' ONCLICK="return doDocPostURL(''004010073236'',''177028'');" >28</A>], Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>].. --[Edited 01/02/2025 by AW--edited to reflect correct filing] Justin Saadein-Morales',
        'RESPONSE by Justin Jeffrey Saadein-Morales to notice requesting response [<A HREF=''_SERVLETURL_/docs1/004010073236'' target=''new'' ONCLICK="return doDocPostURL(''004010073236'',''177028'');" >28</A>], Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>].. [1001696501] [24-2160]--[Edited 01/02/2025 by AW--edited to reflect correct filing] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales to notice requesting response [<A HREF=''_SERVLETURL_/docs1/004010073236'' target=''new'' ONCLICK="return doDocPostURL ;" >28</A>], Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return',
        FALSE,
        '1001696501',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '500129cf-2f93-4a77-9929-5e2cd9b27801',
        v_case_id,
        31,
        '2025-01-02',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010082829'' target=''new'' ONCLICK="return doDocPostURL(''004010082829'',''177028'');" >30</A>] reply, [<A HREF=''_SERVLETURL_/docs1/004010073236'' target=''new'' ONCLICK="return doDocPostURL(''004010073236'',''177028'');" >28</A>] notice requesting response, [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>] Motion Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010082829'' target=''new'' ONCLICK="return doDocPostURL(''004010082829'',''177028'');" >30</A>] reply, [<A HREF=''_SERVLETURL_/docs1/004010073236'' target=''new'' ONCLICK="return doDocPostURL(''004010073236'',''177028'');" >28</A>] notice requesting response, [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>] Motion  [1001696503] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001696503',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'd482f9d3-c8e7-4654-aefd-cd4e9c785be1',
        v_case_id,
        32,
        '2025-03-28',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales for judicial notice of related appeal, case No. 25-1229, and the district court''s factual error regarding the status of this appeal (24-2160) , to consolidate case No. 25-1229 with case No. 24-2160 , to reverse decision on appeal , to GRANT such other and further relief as this Court deems just and proper.. Date and method of service: 03/28/2025 ecf. Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales for judicial notice of related appeal, case No. 25-1229, and the district court''s factual error regarding the status of this appeal (24-2160) , to consolidate case No. 25-1229 with case No. 24-2160 , to reverse decision on appeal , to GRANT such other and further relief as this Court deems just and proper.. Date and method of service: 03/28/2025 ecf.      [1001744708] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales for judicial notice of related appeal, case No',
        FALSE,
        '1001744708',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '14c4a519-8f02-45eb-8276-b1f337df569c',
        v_case_id,
        33,
        '2025-03-28',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion to consolidate case, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion reverse decision on appeal, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion for other relief Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion to consolidate case, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion reverse decision on appeal, [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] Motion for other relief  [1001744712] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001744712',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '80fbe07d-4d73-44f2-8087-ff9c0df8352a',
        v_case_id,
        34,
        '2025-03-31',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales for judicial notice of Clerk''s unauthorized transmission of the December 18, 2024, Order without issuance of a mandate , to issue mandate forthwith. Date and method of service: 03/31/2025 ecf. Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales for judicial notice of Clerk''s unauthorized transmission of the December 18, 2024, Order without issuance of a mandate , to issue mandate forthwith. Date and method of service: 03/31/2025 ecf.      [1001745273] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales for judicial notice of Clerk''s unauthorized transmission of the December 18, 2024, Order without issuance of a mandate , to issue mandate forthwith',
        FALSE,
        '1001745273',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'ac60e6b2-76d6-4336-8f0f-74f1925aeb43',
        v_case_id,
        35,
        '2025-03-31',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion to issue mandate forthwith by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion to issue mandate forthwith by Justin Jeffrey Saadein-Morales..   [1001745274] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001745274',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4d7ca6c0-472d-4be7-a714-28d7b36c755d',
        v_case_id,
        36,
        '2025-03-31',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion to issue mandate forthwith, [<A HREF=''_SERVLETURL_/docs1/004010189828'' target=''new'' ONCLICK="return doDocPostURL(''004010189828'',''177028'');" >35</A>] exhibit(s) Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] Motion to issue mandate forthwith, [<A HREF=''_SERVLETURL_/docs1/004010189828'' target=''new'' ONCLICK="return doDocPostURL(''004010189828'',''177028'');" >35</A>] exhibit(s)  [1001745275] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001745275',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'd09d1d28-acea-49ee-a7a4-17debd7130fa',
        v_case_id,
        37,
        '2025-04-07',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. to Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>], Motion to issue mandate forthwith [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>]. Nature of response: in opposition. Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc.   to Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>], Motion to issue mandate forthwith [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>]. Nature of response: in opposition. [1001749029] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001749029',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'aaf1ee19-11d4-411c-a2e9-66f92c0435c8',
        v_case_id,
        38,
        '2025-04-07',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. to Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>]. Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc.   to Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>]. [1001749039] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001749039',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '2e4b1539-e405-4d41-a51f-05de939cf7c4',
        v_case_id,
        39,
        '2025-04-18',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales to expedite decision , for injunctive relief pending appeal Date of action to be enjoined: April 10, 2025 , for judicial notice of PARALLEL PROCEEDINGS IN D.D.C. CASE NO. 1:25-CV-01087-RC, INCLUDING 4/18/25 HEARING ON SEIZURE OF VETERAN''S VA-BACKED PROPERTY, LEGAL FILES, & RESULTING HOMELESSNESS , for stay pending appeal. Date of action to be stayed, if applicable:April 10, 2025. , to EMERGENCY RELIEF UNDER 28 U.S.C. 1651(a): ACCESS LEGAL FILES, STAY DEADLINES, NOTICE D.C. CASE, ENABLE COURT COMMS, HALT ENFORCEMENT. RELIEF NEEDED TO PROTECT JURISDICTION & ACCESS TO COURTS.. Date and method of service: 04/18/2025 ecf. Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales to expedite decision , for injunctive relief pending appeal Date of action to be enjoined: April 10, 2025 , for judicial notice of PARALLEL PROCEEDINGS IN D.D.C. CASE NO. 1:25-CV-01087-RC, INCLUDING 4/18/25 HEARING ON SEIZURE OF VETERAN''S VA-BACKED PROPERTY, LEGAL FILES, & RESULTING HOMELESSNESS , for stay pending appeal. Date of action to be stayed, if applicable:April 10, 2025. , to EMERGENCY RELIEF UNDER 28 U.S.C. 1651(a): ACCESS LEGAL FILES, STAY DEADLINES, NOTICE D.C. CASE, ENABLE COURT COMMS, HALT ENFORCEMENT. RELIEF NEEDED TO PROTECT JURISDICTION & ACCESS TO COURTS.. Date and method of service: 04/18/2025 ecf.      [1001756211] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales to expedite decision , for injunctive relief pending appeal Date of action to be enjoined: April 10, 2025 , for judicial notice of PARALLEL PROCEEDINGS IN D',
        FALSE,
        '1001756211',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'e6c9e7ec-b1ac-41c1-a3eb-7c51955f86ea',
        v_case_id,
        40,
        '2025-04-19',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief by Justin Jeffrey Saadein-Morales..   [1001756213] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001756213',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'c7a7635d-3604-47d2-8df7-15f6e9e2afb5',
        v_case_id,
        41,
        '2025-04-19',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief, [<A HREF=''_SERVLETURL_/docs1/004010214696'' target=''new'' ONCLICK="return doDocPostURL(''004010214696'',''177028'');" >40</A>] exhibit(s) Justin Saad...',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief, [<A HREF=''_SERVLETURL_/docs1/004010214696'' target=''new'' ONCLICK="return doDocPostURL(''004010214696'',''177028'');" >40</A>] exhibit(s)  [1001756214] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001756214',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5fafbc12-8f51-43b7-b396-ebda82fe32bb',
        v_case_id,
        42,
        '2025-04-19',
        'Certificate',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief Justin Saadein-Morales',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for stay pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] Motion for other relief  [1001756215] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001756215',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'db0b26c1-fea3-419f-9598-3c1ad564e369',
        v_case_id,
        43,
        '2025-04-23',
        'Filing',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. . Justin Saadein-Morales',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. [1001758137] . [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758137',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '6f9f4405-c4b0-4a0e-8d21-eb6029364eae',
        v_case_id,
        44,
        '2025-04-23',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010218997'' target=''new'' ONCLICK="return doDocPostURL(''004010218997'',''177028'');" >43</A>] supplemental authorities Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010218997'' target=''new'' ONCLICK="return doDocPostURL(''004010218997'',''177028'');" >43</A>] supplemental authorities  [1001758139] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758139',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '6fca15b0-7bc2-4cd9-b6eb-c66c2d0b2f9a',
        v_case_id,
        45,
        '2025-04-23',
        'Exhibit',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010218997'' target=''new'' ONCLICK="return doDocPostURL(''004010218997'',''177028'');" >43</A>] supplemental authorities by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010218997'' target=''new'' ONCLICK="return doDocPostURL(''004010218997'',''177028'');" >43</A>] supplemental authorities by Justin Jeffrey Saadein-Morales..   [1001758142] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758142',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '38941d19-51db-44f9-95b8-7b7ca32dc30c',
        v_case_id,
        46,
        '2025-04-23',
        'Filing',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. . Justin Saadein-Morales',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. [1001758161] . [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758161',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '747dcdfe-cc07-49eb-b7b4-ab24d31cf19e',
        v_case_id,
        47,
        '2025-04-23',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010219053'' target=''new'' ONCLICK="return doDocPostURL(''004010219053'',''177028'');" >46</A>] supplemental authorities Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010219053'' target=''new'' ONCLICK="return doDocPostURL(''004010219053'',''177028'');" >46</A>] supplemental authorities  [1001758164] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758164',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '48f303a4-e5a4-4f47-b3dc-9f33497b637d',
        v_case_id,
        48,
        '2025-04-23',
        'Exhibit',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010219053'' target=''new'' ONCLICK="return doDocPostURL(''004010219053'',''177028'');" >46</A>] supplemental authorities by Justin Jeffrey Saadein-Morales.. Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010219053'' target=''new'' ONCLICK="return doDocPostURL(''004010219053'',''177028'');" >46</A>] supplemental authorities by Justin Jeffrey Saadein-Morales..   [1001758177] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001758177',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3dd88148-e5f8-4292-bab0-a6fb61302753',
        v_case_id,
        49,
        '2025-04-24',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. to Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>]. Nature of response: in opposition. Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc.   to Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>], Motion [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>]. Nature of response: in opposition. [1001759353] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001759353',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5d8baf6f-7927-4977-b3c8-c24bd8174b39',
        v_case_id,
        50,
        '2025-04-24',
        'Response',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010221613'' target=''new'' ONCLICK="return doDocPostURL(''004010221613'',''177028'');" >49</A>] response by Westridge Swim & Racquet Club, Inc... Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010221613'' target=''new'' ONCLICK="return doDocPostURL(''004010221613'',''177028'');" >49</A>] response by Westridge Swim & Racquet Club, Inc...   [1001759360] [24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001759360',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'eeccb3c8-de35-48e0-9dd0-2bf76e0291aa',
        v_case_id,
        51,
        '2025-04-24',
        'Filing',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. . Justin Saadein-Morales',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales. [1001759389] . [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001759389',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '16b83a73-c858-46f9-a574-c57679cc6161',
        v_case_id,
        52,
        '2025-04-24',
        'Reply',
        'NOTICE by Justin Jeffrey Saadein-Morales that a reply will not be filed.. Justin Saadein-Morales',
        'NOTICE by Justin Jeffrey Saadein-Morales that a reply will not be filed.. [1001759415] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales that a reply will not be filed',
        FALSE,
        '1001759415',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1c343465-448d-4445-b461-a84d563634b7',
        v_case_id,
        53,
        '2025-04-24',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010221767'' target=''new'' ONCLICK="return doDocPostURL(''004010221767'',''177028'');" >52</A>] Notice Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010221767'' target=''new'' ONCLICK="return doDocPostURL(''004010221767'',''177028'');" >52</A>] Notice  [1001759420] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001759420',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1c55c3e3-5dd0-4b89-8a85-4fea420bea89',
        v_case_id,
        54,
        '2025-04-24',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010221703'' target=''new'' ONCLICK="return doDocPostURL(''004010221703'',''177028'');" >51</A>] supplemental authorities Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010221703'' target=''new'' ONCLICK="return doDocPostURL(''004010221703'',''177028'');" >51</A>] supplemental authorities  [1001759438] [24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales',
        FALSE,
        '1001759438',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'db510797-ba54-47a5-b7b6-cee3ce014796',
        v_case_id,
        55,
        '2025-04-25',
        'Motion',
        'ORDER filed granting Motion to consolidate case [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] in 24-2160.. Copies to all parties.. [24-2160, 25-1229] HMF',
        'ORDER filed granting Motion to consolidate case [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] in 24-2160.. Copies to all parties.. [1001760090] [24-2160, 25-1229] HMF',
        NULL,
        FALSE,
        '1001760090',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '04b9b459-2573-4d0c-ac1b-ba327798f47c',
        v_case_id,
        56,
        '2025-04-30',
        'Response',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to Notice [<A HREF=''_SERVLETURL_/docs1/004010221767'' target=''new'' ONCLICK="return doDocPostURL(''004010221767'',''177028'');" >52</A>]. Nature of response: in opposition. [24-2160, 25-1229] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to Notice [<A HREF=''_SERVLETURL_/docs1/004010221767'' target=''new'' ONCLICK="return doDocPostURL(''004010221767'',''177028'');" >52</A>]. Nature of response: in opposition. [1001762891] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001762891',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '24223a44-ffcd-4b58-bede-babe1694c1de',
        v_case_id,
        57,
        '2025-04-30',
        'Response',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010229814'' target=''new'' ONCLICK="return doDocPostURL(''004010229814'',''177028'');" >56</A>] response by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229.. [24-2160, 25-1229] Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010229814'' target=''new'' ONCLICK="return doDocPostURL(''004010229814'',''177028'');" >56</A>] response by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229..   [1001762894] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001762894',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '13b6650d-6ec4-4ec2-b82e-99b382fc7951',
        v_case_id,
        58,
        '2025-04-30',
        'Reply',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [1001762932] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed',
        FALSE,
        '1001762932',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '58ea0138-1790-4e4e-ac8e-cabaed4bbee6',
        v_case_id,
        59,
        '2025-04-30',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010229914'' target=''new'' ONCLICK="return doDocPostURL(''004010229914'',''177028'');" >58</A>] Notice [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010229914'' target=''new'' ONCLICK="return doDocPostURL(''004010229914'',''177028'');" >58</A>] Notice  [1001762940] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001762940',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'cda74c58-743a-4722-a288-5bafc9e3f714',
        v_case_id,
        60,
        '2025-05-07',
        'Filing',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. . [24-2160, 25-1229] Justin Saadein-Morales',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. [1001766189] . [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001766189',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '07acc56e-8fc2-4a12-a0a2-54ec0d55868b',
        v_case_id,
        61,
        '2025-05-07',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>] supplemental authorities [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>] supplemental authorities  [1001766194] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001766194',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'ee191bd8-05f9-4307-9646-111aad822cf1',
        v_case_id,
        62,
        '2025-05-07',
        'Certificate',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>] supplemental authorities, [<A HREF=''_SERVLETURL_/docs1/004010237190'' target=''new'' ONCLICK="return doDocPostURL(''004010237190'',''177028'');" >61</A>] certificate by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>] supplemental authorities, [<A HREF=''_SERVLETURL_/docs1/004010237190'' target=''new'' ONCLICK="return doDocPostURL(''004010237190'',''177028'');" >61</A>] certificate by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001766197] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001766197',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1b76bfb7-8c4d-4c1a-a68a-65a0872b8b05',
        v_case_id,
        63,
        '2025-05-09',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for injunctive relief pending appeal. Date and method of service: 05/09/2025 ecf. [24-2160, 25-1229]--[Edited 05/09/2025 by AB to modify relief and docket text] Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for injunctive relief pending appeal. Date and method of service: 05/09/2025 ecf. [1001767718] [24-2160, 25-1229]--[Edited 05/09/2025 by AB to modify relief and docket text] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for injunctive relief pending appeal',
        FALSE,
        '1001767718',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'c18a6bfc-c357-4be7-a1cf-bfc939b0568e',
        v_case_id,
        64,
        '2025-05-09',
        'Motion',
        'AFFIDAVIT by Appellant Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 re: Doc. Entry #63. Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to approve/authorize Injunctive Relief and Protective Order. [24-2160, 25-1229] Justin Saadein-Morales',
        'AFFIDAVIT by Appellant Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 re: Doc. Entry #63. Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to approve/authorize Injunctive Relief and Protective Order. [1001767722] [24-2160, 25-1229] Justin Saadein-Morales',
        'Appellant Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 re: Doc',
        FALSE,
        '1001767722',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5b917e74-bc13-435b-889d-8a5136ea5f77',
        v_case_id,
        65,
        '2025-05-09',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010240594'' target=''new'' ONCLICK="return doDocPostURL(''004010240594'',''177028'');" >64</A>] affidavit by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010240594'' target=''new'' ONCLICK="return doDocPostURL(''004010240594'',''177028'');" >64</A>] affidavit by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001767724] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001767724',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a909b084-d61a-4ef8-af58-35729d12f9c2',
        v_case_id,
        66,
        '2025-05-09',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010240594'' target=''new'' ONCLICK="return doDocPostURL(''004010240594'',''177028'');" >64</A>] affidavit, [<A HREF=''_SERVLETURL_/docs1/004010240600'' target=''new'' ONCLICK="return doDocPostURL(''004010240600'',''177028'');" >65</A>] exhibit(s) [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010240594'' target=''new'' ONCLICK="return doDocPostURL(''004010240594'',''177028'');" >64</A>] affidavit, [<A HREF=''_SERVLETURL_/docs1/004010240600'' target=''new'' ONCLICK="return doDocPostURL(''004010240600'',''177028'');" >65</A>] exhibit(s)  [1001767726] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001767726',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '9789200b-7a46-4a6f-9f6b-b1da9e400d76',
        v_case_id,
        67,
        '2025-05-09',
        'Response',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to supplemental authorities [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>]. Nature of response: in opposition. [24-2160, 25-1229] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to supplemental authorities [<A HREF=''_SERVLETURL_/docs1/004010237173'' target=''new'' ONCLICK="return doDocPostURL(''004010237173'',''177028'');" >60</A>]. Nature of response: in opposition. [1001767783] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001767783',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1ce7fb82-f98f-435a-aa1a-f056e51246b0',
        v_case_id,
        68,
        '2025-05-09',
        'Response',
        'REPLY by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to response [<A HREF=''_SERVLETURL_/docs1/004010240727'' target=''new'' ONCLICK="return doDocPostURL(''004010240727'',''177028'');" >67</A>].. [24-2160, 25-1229] Justin Saadein-Morales',
        'REPLY by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to response [<A HREF=''_SERVLETURL_/docs1/004010240727'' target=''new'' ONCLICK="return doDocPostURL(''004010240727'',''177028'');" >67</A>]..  [1001767843] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to response [<A HREF=''_SERVLETURL_/docs1/004010240727'' target=''new'' ONCLICK="return doDocPostURL ;" >67</A>]',
        FALSE,
        '1001767843',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8302f75e-83d7-49be-ac25-ee43087399f8',
        v_case_id,
        69,
        '2025-05-09',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010240889'' target=''new'' ONCLICK="return doDocPostURL(''004010240889'',''177028'');" >68</A>] reply [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010240889'' target=''new'' ONCLICK="return doDocPostURL(''004010240889'',''177028'');" >68</A>] reply  [1001767848] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001767848',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '91faacdd-5186-4fc3-ab5f-30529c977162',
        v_case_id,
        70,
        '2025-05-12',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to Motion [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>]. Nature of response: in opposition. [24-2160, 25-1229] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to Motion [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>]. Nature of response: in opposition. [1001768330] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001768330',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '6c14f7ec-c457-46ad-a095-04c3d2d754aa',
        v_case_id,
        71,
        '2025-05-13',
        'Filing',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. . [24-2160, 25-1229] Justin Saadein-Morales',
        'SUPPLEMENTAL AUTHORITIES by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. [1001769590] . [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001769590',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8c7681c6-4c13-412d-a73a-6507aec5bad8',
        v_case_id,
        72,
        '2025-05-13',
        'Exhibit',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>] supplemental authorities by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>] supplemental authorities by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001769591] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001769591',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3de19963-ea75-463f-bdc3-9906301136ba',
        v_case_id,
        73,
        '2025-05-13',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>] supplemental authorities, [<A HREF=''_SERVLETURL_/docs1/004010244705'' target=''new'' ONCLICK="return doDocPostURL(''004010244705'',''177028'');" >72</A>] exhibit(s) [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>] supplemental authorities, [<A HREF=''_SERVLETURL_/docs1/004010244705'' target=''new'' ONCLICK="return doDocPostURL(''004010244705'',''177028'');" >72</A>] exhibit(s)  [1001769594] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001769594',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4f9bb2f1-71d5-47dc-9fb9-e638d0a00615',
        v_case_id,
        74,
        '2025-05-13',
        'Notice',
        'NOTICE re: ERRATUM by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE re: ERRATUM by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.  [1001769764] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001769764',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '44cdc71b-4153-450d-99ea-52c02304c430',
        v_case_id,
        75,
        '2025-05-14',
        'Motion',
        'COURT ORDER filed denying Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-6</A>] in 25-1229; denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-5</A>] in 25-1229; denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010220766'' targe...',
        'COURT ORDER filed denying Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-6</A>] in 25-1229; denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-5</A>] in 25-1229; denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-4</A>] in 25-1229; denying Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for stay pending appeal [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-3</A>] in 25-1229; denying Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010214688'' target=''new'' ONCLICK="return doDocPostURL(''004010214688'',''177028'');" >39</A>] in 24-2160, denying Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010220766'' target=''new'' ONCLICK="return doDocPostURL(''004010220766'',''177982'');" >1001758998-2</A>] in 25-1229 Copies to all parties. [1001770579] [24-2160, 25-1229] Donna Lett',
        NULL,
        FALSE,
        '1001770579',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3259aa8b-5867-41c1-9ff7-503f485188e2',
        v_case_id,
        76,
        '2025-05-15',
        'Response',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to supplemental authorities [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>]. Nature of response: in opposition. [24-2160, 25-1229] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to supplemental authorities [<A HREF=''_SERVLETURL_/docs1/004010244702'' target=''new'' ONCLICK="return doDocPostURL(''004010244702'',''177028'');" >71</A>]. Nature of response: in opposition. [1001771016] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001771016',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '23ba2aea-6604-4e15-8ed7-77b3b2f5bec9',
        v_case_id,
        77,
        '2025-05-15',
        'Response',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010247776'' target=''new'' ONCLICK="return doDocPostURL(''004010247776'',''177028'');" >76</A>] response by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229.. [24-2160, 25-1229] Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010247776'' target=''new'' ONCLICK="return doDocPostURL(''004010247776'',''177028'');" >76</A>] response by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229..   [1001771025] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001771025',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '36124bc2-45d2-478e-8c46-18420869ff1c',
        v_case_id,
        78,
        '2025-05-29',
        'Motion',
        'COURT ORDER filed denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Copies to all parties. [24-2160, 25-1229] AW',
        'COURT ORDER filed denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010240582'' target=''new'' ONCLICK="return doDocPostURL(''004010240582'',''177028'');" >63</A>] Copies to all parties. [1001778660] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001778660',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3cf67a65-a8f1-4db5-9b3a-e723bed983bd',
        v_case_id,
        79,
        '2025-05-30',
        'Motion',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to affirm decision on appeal. Date and method of service: 05/30/2025 US mail, ecf. [24-2160, 25-1229] Thomas Junker',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to affirm decision on appeal. Date and method of service: 05/30/2025 US mail, ecf.      [1001779538] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001779538',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3d7b1755-dc9b-43f3-9ad4-c4e41791a338',
        v_case_id,
        80,
        '2025-05-30',
        'Motion',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to affirm decision on appeal. Date and method of service: 05/30/2025 US mail, ecf. [24-2160, 25-1229] Thomas Junker',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to affirm decision on appeal. Date and method of service: 05/30/2025 US mail, ecf.      [1001779544] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001779544',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'd2aea5ff-8801-4141-b1b5-c37104b9f798',
        v_case_id,
        81,
        '2025-07-02',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to enforce , to withdraw/relieve/substitute counsel.Attorney or client motion? Attorney. Was a copy of the motion served on the defendant? Y. If under L.R. 46(d), was client advised of right to file response within 7 days? N/A , to show cause , to vacate June 6, 2025, order only as it pertains to the appellate record in Case No. 24-2160. , to impose sanctions.. Date and method of service: 07/02/2025 ecf. [24-2160, 25-1229] Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to enforce , to withdraw/relieve/substitute counsel.Attorney or client motion? Attorney. Was a copy of the motion served on the defendant? Y. If under L.R. 46(d), was client advised of right to file response within 7 days? N/A , to show cause , to vacate June 6, 2025, order only as it pertains to the appellate record in Case No. 24-2160. , to impose sanctions.. Date and method of service: 07/02/2025 ecf.      [1001798503] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to enforce , to withdraw/relieve/substitute counsel',
        FALSE,
        '1001798503',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8f2e42af-be9e-4ced-9f92-ac475d69816b',
        v_case_id,
        82,
        '2025-07-02',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001798508] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001798508',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3be5ad9a-3ce5-4240-8eb1-ba4172f76ea0',
        v_case_id,
        83,
        '2025-07-02',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to withdraw/relieve/substitute counsel, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to show cause, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to impose sanctions, [<A HREF=''_SERVLETURL_/docs1/004010308806'' target=''new'' ONCLICK="return doDocPostURL(''004010308806'',''177028'');" >82</A>] exhibit(s) [24-2160, 25-122...',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to enforce, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to withdraw/relieve/substitute counsel, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to show cause, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>] Motion to impose sanctions, [<A HREF=''_SERVLETURL_/docs1/004010308806'' target=''new'' ONCLICK="return doDocPostURL(''004010308806'',''177028'');" >82</A>] exhibit(s)  [1001798510] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001798510',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '668f15b9-138b-4252-aa8c-2ec54ca54efd',
        v_case_id,
        84,
        '2025-07-08',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to clarify whether the July 8, 2025, Rule 45 notice in No. 25-1229 constitutes a final judgment or mandate for the consolidated appeal. Date and method of service: 07/08/2025 ecf. [24-2160, 25-1229] Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to clarify whether the July 8, 2025, Rule 45 notice in No. 25-1229 constitutes a final judgment or mandate for the consolidated appeal. Date and method of service: 07/08/2025 ecf.      [1001800363] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to clarify whether the July 8, 2025, Rule 45 notice in No',
        FALSE,
        '1001800363',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '74c03980-9cdf-48bf-8c74-ea7c1403381a',
        v_case_id,
        85,
        '2025-07-08',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010312953'' target=''new'' ONCLICK="return doDocPostURL(''004010312953'',''177028'');" >84</A>] Motion to clarify [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010312953'' target=''new'' ONCLICK="return doDocPostURL(''004010312953'',''177028'');" >84</A>] Motion to clarify  [1001800366] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001800366',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4d73658c-b3a8-4d36-be90-b88dc0354d9c',
        v_case_id,
        86,
        '2025-07-08',
        'Notice',
        'NOTICE re: Filing of Rule 20 Petition and Rule 23 Application in the United States Supreme Court by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE re: Filing of Rule 20 Petition and Rule 23 Application in the United States Supreme Court by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.  [1001800408] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001800408',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'bdf7665b-6f99-4e09-85f5-37171daee628',
        v_case_id,
        87,
        '2025-07-08',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010313030'' target=''new'' ONCLICK="return doDocPostURL(''004010313030'',''177028'');" >86</A>] Notice [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010313030'' target=''new'' ONCLICK="return doDocPostURL(''004010313030'',''177028'');" >86</A>] Notice  [1001800412] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001800412',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5320817f-c9be-421d-b7d5-6b564e4ff9b6',
        v_case_id,
        88,
        '2025-07-09',
        'Motion',
        'Notice issued re: response to emergency motion to clarify [<A HREF=''_SERVLETURL_/docs1/004010312953'' target=''new'' ONCLICK="return doDocPostURL(''004010312953'',''177028'');" >84</A>] Motion to clarify.. . [24-2160, 25-1229] HMF',
        'Notice issued re: response to emergency motion to clarify [<A HREF=''_SERVLETURL_/docs1/004010312953'' target=''new'' ONCLICK="return doDocPostURL(''004010312953'',''177028'');" >84</A>] Motion to clarify..  .  [1001801209] [24-2160, 25-1229] HMF',
        NULL,
        FALSE,
        '1001801209',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '20989a4b-65de-4d55-9199-87af35be096a',
        v_case_id,
        89,
        '2025-07-11',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to withdraw/relieve/substitute counsel [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to show cause [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to impose sanctions [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]. Nature of response: in opposition. [24-2160, 25-1229] Richard Lash',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to withdraw/relieve/substitute counsel [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to show cause [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>], Motion to impose sanctions [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]. Nature of response: in opposition. [1001802573] [24-2160, 25-1229] Richard Lash',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001802573',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '6abeb126-01c5-4a2f-a151-9cbd1785d4d4',
        v_case_id,
        90,
        '2025-07-11',
        'Motion',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to strike document.. Date and method of service: 07/11/2025 US mail, ecf. [24-2160, 25-1229] Richard Lash',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to strike document.. Date and method of service: 07/11/2025 US mail, ecf.      [1001802576] [24-2160, 25-1229] Richard Lash',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001802576',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '490c31b3-a84b-43a5-9942-3ff9cb02ffa2',
        v_case_id,
        91,
        '2025-07-14',
        'Brief',
        'INFORMAL OPENING BRIEF by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [25-1229, 24-2160] Justin Saadein-Morales',
        'INFORMAL OPENING BRIEF by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [1001803673] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001803673',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '9edc77af-c6df-449b-b2d9-8e86a7541781',
        v_case_id,
        92,
        '2025-07-14',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010320052?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320052'',''177028'');" >92</A>] pro se supplemental brief [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010320052?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320052'',''177028'');" >92</A>] pro se supplemental brief  [1001803675] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001803675',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8c80313b-661b-4b43-ac75-c421b22c9039',
        v_case_id,
        93,
        '2025-07-14',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to withdraw Emergency. motion [ECF 61].. Date and method of service: 07/14/2025 ecf. [25-1229, 24-2160] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to withdraw Emergency. motion [ECF 61].. Date and method of service: 07/14/2025 ecf.      [1001803727] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to withdraw Emergency',
        FALSE,
        '1001803727',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '75e078cc-3ee5-4eb9-83c5-1691c515341d',
        v_case_id,
        94,
        '2025-07-14',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010320153?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320153'',''177028'');" >94</A>] Motion to withdraw [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010320153?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320153'',''177028'');" >94</A>] Motion to withdraw  [1001803728] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001803728',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3acf27d6-911f-439d-b85a-690bc7bcce5b',
        v_case_id,
        95,
        '2025-07-17',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to withdraw APPELLANT''S MOTION FOR SUMMARY REVERSAL. motion.. Date and method of service: 07/17/2025 ecf. [24-2160, 25-1229] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to withdraw APPELLANT''S MOTION FOR SUMMARY REVERSAL. motion.. Date and method of service: 07/17/2025 ecf.      [1001805710] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to withdraw APPELLANT''S MOTION FOR SUMMARY REVERSAL',
        FALSE,
        '1001805710',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '552b0ba0-8a4f-4f40-b7ff-3b60f39a2a17',
        v_case_id,
        96,
        '2025-07-17',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010324631'' target=''new'' ONCLICK="return doDocPostURL(''004010324631'',''177028'');" >96</A>] Motion to withdraw [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010324631'' target=''new'' ONCLICK="return doDocPostURL(''004010324631'',''177028'');" >96</A>] Motion to withdraw  [1001805712] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001805712',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3e04a6ab-c807-48ca-ae9d-e41fcbbfd6c0',
        v_case_id,
        97,
        '2025-07-17',
        'Notice',
        'NOTICE re: SUPPLEMENTAL CLARIFICATION UNDER RULE 28(j) REGARDING CORPORATE AUTHORIZATION TIMING AND SUPPORT FOR INFORMAL BRIEF by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE re: SUPPLEMENTAL CLARIFICATION UNDER RULE 28(j) REGARDING CORPORATE AUTHORIZATION TIMING AND SUPPORT FOR INFORMAL BRIEF by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.  [1001806321] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001806321',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '74bfd3a4-f111-4de1-9636-33a7aa8ca25b',
        v_case_id,
        98,
        '2025-07-17',
        'Notice',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010325966'' target=''new'' ONCLICK="return doDocPostURL(''004010325966'',''177028'');" >98</A>] Notice by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010325966'' target=''new'' ONCLICK="return doDocPostURL(''004010325966'',''177028'');" >98</A>] Notice by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001806323] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001806323',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '46592afc-7795-4a6c-b391-1a215a28037b',
        v_case_id,
        99,
        '2025-07-17',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010325966'' target=''new'' ONCLICK="return doDocPostURL(''004010325966'',''177028'');" >98</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010325971'' target=''new'' ONCLICK="return doDocPostURL(''004010325971'',''177028'');" >99</A>] exhibit(s) [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010325966'' target=''new'' ONCLICK="return doDocPostURL(''004010325966'',''177028'');" >98</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010325971'' target=''new'' ONCLICK="return doDocPostURL(''004010325971'',''177028'');" >99</A>] exhibit(s)  [1001806324] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001806324',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'f7d04fd7-9601-4e6e-9fc2-c37024fbc7c7',
        v_case_id,
        100,
        '2025-07-18',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for judicial notice of APPELLEE''S RECORD OF ACTION WITHOUT A MEETING. Date and method of service: 07/18/2025 ecf. [24-2160, 25-1229] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for judicial notice of APPELLEE''S RECORD OF ACTION WITHOUT A MEETING. Date and method of service: 07/18/2025 ecf.      [1001807047] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 for judicial notice of APPELLEE''S RECORD OF ACTION WITHOUT A MEETING',
        FALSE,
        '1001807047',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '707e463c-85c1-4378-b120-eecad4792ade',
        v_case_id,
        101,
        '2025-07-18',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010327690'' target=''new'' ONCLICK="return doDocPostURL(''004010327690'',''177028'');" >101</A>] Motion by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010327690'' target=''new'' ONCLICK="return doDocPostURL(''004010327690'',''177028'');" >101</A>] Motion by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001807050] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001807050',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '126d3f6c-93ee-4d88-ab3e-2adf96745e8f',
        v_case_id,
        102,
        '2025-07-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010327690'' target=''new'' ONCLICK="return doDocPostURL(''004010327690'',''177028'');" >101</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010327698'' target=''new'' ONCLICK="return doDocPostURL(''004010327698'',''177028'');" >102</A>] exhibit(s) [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010327690'' target=''new'' ONCLICK="return doDocPostURL(''004010327690'',''177028'');" >101</A>] Motion for judicial notice, [<A HREF=''_SERVLETURL_/docs1/004010327698'' target=''new'' ONCLICK="return doDocPostURL(''004010327698'',''177028'');" >102</A>] exhibit(s)  [1001807053] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001807053',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '9925b079-fc20-4b5e-98a5-581ff8781eee',
        v_case_id,
        103,
        '2025-07-22',
        'Reply',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [1001808741] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed',
        FALSE,
        '1001808741',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'bb9396d5-b92f-47e9-8db9-31554a8e04dc',
        v_case_id,
        104,
        '2025-07-22',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010331643'' target=''new'' ONCLICK="return doDocPostURL(''004010331643'',''177028'');" >104</A>] Notice [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010331643'' target=''new'' ONCLICK="return doDocPostURL(''004010331643'',''177028'');" >104</A>] Notice  [1001808744] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001808744',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '56dd77a3-1f01-4770-865c-db8353e1677f',
        v_case_id,
        105,
        '2025-07-22',
        'Reply',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [24-2160, 25-1229] Justin Saadein-Morales',
        'NOTICE by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed.. [1001808752] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 that a reply will not be filed',
        FALSE,
        '1001808752',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'bbe7bc83-a350-4daa-86f8-60606d335f21',
        v_case_id,
        106,
        '2025-07-22',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010331672'' target=''new'' ONCLICK="return doDocPostURL(''004010331672'',''177028'');" >106</A>] Notice [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010331672'' target=''new'' ONCLICK="return doDocPostURL(''004010331672'',''177028'');" >106</A>] Notice  [1001808754] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001808754',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5ea76eb0-6084-4004-8832-731cd21e95fd',
        v_case_id,
        107,
        '2025-07-23',
        'Response',
        '(ENTRY RESTRICTED) RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160 to pro se supplemental brief [<A HREF=''_SERVLETURL_/docs1/004010320052?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320052'',''177028'');" >92</A>]. [25-1229, 24-2160]--[Edited 07/23/2025 by RP - corrected at ECF #86] Thomas Junker',
        '(ENTRY RESTRICTED) RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160  to pro se supplemental brief [<A HREF=''_SERVLETURL_/docs1/004010320052?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010320052'',''177028'');" >92</A>]. [1001809163] [25-1229, 24-2160]--[Edited 07/23/2025 by RP - corrected at ECF #86] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001809163',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '0c29818a-8544-4488-a655-224a467920f6',
        v_case_id,
        108,
        '2025-07-23',
        'Response',
        'INFORMAL RESPONSE BRIEF by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229. [24-2160, 25-1229] RP',
        'INFORMAL RESPONSE BRIEF by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229. [1001809415] [24-2160, 25-1229] RP',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001809415',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a01767a9-d95d-4565-99ce-1e1e8a6e875a',
        v_case_id,
        109,
        '2025-08-07',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for leave to file SUPPLEMENTAL NOTICE OF RECENT DEVELOPMENT. Date and method of service: 08/07/2025 ecf. [25-1229, 24-2160] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for leave to file SUPPLEMENTAL NOTICE OF RECENT DEVELOPMENT. Date and method of service: 08/07/2025 ecf.      [1001818960] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for leave to file SUPPLEMENTAL NOTICE OF RECENT DEVELOPMENT',
        FALSE,
        '1001818960',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '19d1b5df-1bad-49d7-a1e3-f481a2652ca6',
        v_case_id,
        110,
        '2025-08-07',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010354195?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354195'',''177028'');" >110</A>] Motion for leave to file by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.. [25-1229, 24-2160] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010354195?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354195'',''177028'');" >110</A>] Motion for leave to file by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160..   [1001818961] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001818961',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '86819c47-f5d6-4900-81b2-cf812f3c0fed',
        v_case_id,
        111,
        '2025-08-07',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010354195?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354195'',''177028'');" >110</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010354198?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354198'',''177028'');" >111</A>] exhibit(s) [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010354195?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354195'',''177028'');" >110</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010354198?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354198'',''177028'');" >111</A>] exhibit(s)  [1001818965] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001818965',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '86bffeff-3514-46f7-a64c-a7e316d9f15c',
        v_case_id,
        112,
        '2025-09-18',
        'Notice',
        'NOTICE re: Address Change by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [25-1229, 24-2160] Justin Saadein-Morales',
        'NOTICE re: Address Change by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.  [1001844562] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844562',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '2175d20f-5fd7-4ae5-b31d-1fff9ce8bb4f',
        v_case_id,
        113,
        '2025-09-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409431?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409431'',''177028'');" >113</A>] Notice [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409431?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409431'',''177028'');" >113</A>] Notice  [1001844564] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844564',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '772a6b2f-e5de-47c5-957e-191603920934',
        v_case_id,
        114,
        '2025-09-18',
        'Motion',
        'NOTICE re: Withdrawal of Motion (ECF 87) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [25-1229, 24-2160] Justin Saadein-Morales',
        'NOTICE re: Withdrawal of Motion (ECF 87) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.  [1001844568] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844568',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '16aafa4f-1773-4da9-82cd-e900fe2b5149',
        v_case_id,
        115,
        '2025-09-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409446?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409446'',''177028'');" >115</A>] Notice [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409446?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409446'',''177028'');" >115</A>] Notice  [1001844569] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844569',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '2d4220da-4ea3-46fe-a5a1-340dd196087b',
        v_case_id,
        116,
        '2025-09-18',
        'Notice',
        'NOTICE re: Supplemental Authority Under FRAP 28(j) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [25-1229, 24-2160] Justin Saadein-Morales',
        'NOTICE re: Supplemental Authority Under FRAP 28(j) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.  [1001844630] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844630',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a450d3a1-da47-4407-82de-71764850b9d8',
        v_case_id,
        117,
        '2025-09-18',
        'Notice',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409555?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409555'',''177028'');" >117</A>] Notice by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.. [25-1229, 24-2160] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409555?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409555'',''177028'');" >117</A>] Notice by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160..   [1001844632] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844632',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'c31cb49a-e489-498c-8d62-803ad9fa64da',
        v_case_id,
        118,
        '2025-09-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409555?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409555'',''177028'');" >117</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010409564?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409564'',''177028'');" >118</A>] exhibit(s) [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409555?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409555'',''177028'');" >117</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010409564?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409564'',''177028'');" >118</A>] exhibit(s)  [1001844634] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844634',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '39464fc6-fa04-45ce-935a-90c9a5b5b83b',
        v_case_id,
        119,
        '2025-09-18',
        'Notice',
        'NOTICE re: Supplemental Authority Under FRAP 28(j) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. [25-1229, 24-2160] Justin Saadein-Morales',
        'NOTICE re: Supplemental Authority Under FRAP 28(j) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.  [1001844675] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844675',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a766eacd-8ea6-4341-baeb-9e3f8be19b3f',
        v_case_id,
        120,
        '2025-09-18',
        'Notice',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409658?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409658'',''177028'');" >120</A>] Notice by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.. [25-1229, 24-2160] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409658?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409658'',''177028'');" >120</A>] Notice by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160..   [1001844679] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844679',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '658c2bef-76dd-48ca-9413-d65db39853d2',
        v_case_id,
        121,
        '2025-09-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409658?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409658'',''177028'');" >120</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010409666?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409666'',''177028'');" >121</A>] exhibit(s) [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409658?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409658'',''177028'');" >120</A>] Notice, [<A HREF=''_SERVLETURL_/docs1/004010409666?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409666'',''177028'');" >121</A>] exhibit(s)  [1001844680] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844680',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'fd8913ca-38fa-4a39-bf7e-df43b9144e72',
        v_case_id,
        122,
        '2025-09-18',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to impose sanctions.. Date and method of service: 09/18/2025 ecf. [25-1229, 24-2160] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to impose sanctions.. Date and method of service: 09/18/2025 ecf.      [1001844753] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to impose sanctions',
        FALSE,
        '1001844753',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'b3271f12-8080-4efa-8c50-0d56bd26be83',
        v_case_id,
        123,
        '2025-09-18',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>] Motion to impose sanctions by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.. [25-1229, 24-2160] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>] Motion to impose sanctions by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160..   [1001844754] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844754',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'ab59ed40-02ce-448a-917b-64a2c8e126a8',
        v_case_id,
        124,
        '2025-09-18',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>] Motion to impose sanctions, [<A HREF=''_SERVLETURL_/docs1/004010409860?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409860'',''177028'');" >124</A>] exhibit(s) [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>] Motion to impose sanctions, [<A HREF=''_SERVLETURL_/docs1/004010409860?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409860'',''177028'');" >124</A>] exhibit(s)  [1001844766] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001844766',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'dfd76872-f5c0-4dd4-bf6a-01c42393854e',
        v_case_id,
        125,
        '2025-09-19',
        'Motion',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for injunctive relief pending appeal Date of action to be enjoined: September 26, 2025 , for temporary administrative stay, Date of action to be stayed, if applicable:in alternative, September 26, 2025. , to approve/authorize Appellant to file an affidavit identifying the proceeds at issue and any attempted disbursements , to expedite decision , to ORDER that no proceeds from the September 26, 2025, sale be disbursed, transferred, or distributed either before or after deposit with the Prince William County Circuit Court clerk''s registry, pending resolution of these appeals or further order.. Date and method of service: 09/19/2025 ecf. [25-1229, 24-2160] Justin Saadein-Morales',
        'Emergency MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for injunctive relief pending appeal Date of action to be enjoined: September 26, 2025 , for temporary administrative stay, Date of action to be stayed, if applicable:in alternative, September 26, 2025. , to approve/authorize Appellant to file an affidavit identifying the proceeds at issue and any attempted disbursements , to expedite decision , to ORDER that no proceeds from the September 26, 2025, sale be disbursed, transferred, or distributed either before or after deposit with the Prince William County Circuit Court clerk''s registry, pending resolution of these appeals or further order.. Date and method of service: 09/19/2025 ecf.      [1001845571] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 for injunctive relief pending appeal Date of action to be enjoined: September 26, 2025 , for temporary administrative stay, Date of action to be stayed, if applicable:in alternative, September 26, 2025',
        FALSE,
        '1001845571',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '70c59d5a-756e-4620-83bb-94aa3fba6627',
        v_case_id,
        126,
        '2025-09-19',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for temporary administrative stay, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for other relief by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160.. [25-1229, 24-2160] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for temporary administrative stay, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for other relief by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160..   [1001845575] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001845575',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4cba6d56-435f-4533-b3f5-37b8aea17f0e',
        v_case_id,
        127,
        '2025-09-19',
        'Motion',
        'Addendum/attachment to [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for temporary administrative stay, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for other relief, [<A HREF=''_SERVLETURL_/docs1/004010411717?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411717'',''177028'');...',
        'Addendum/attachment to [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for injunctive relief pending appeal, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for temporary administrative stay, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to approve/authorize, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion to expedite decision, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion for other relief, [<A HREF=''_SERVLETURL_/docs1/004010411717?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411717'',''177028'');" >127</A>] exhibit(s) by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Method of filing paper copies:. Date copies mailed, dispatched, or delivered:   [1001845579] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001845579',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5f1ee519-26d6-4d53-a983-2771bf9eda02',
        v_case_id,
        128,
        '2025-09-19',
        'Certificate',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion  [1001845585] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001845585',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'a2d5c84b-498e-411b-a02e-35c38eac3ca7',
        v_case_id,
        129,
        '2025-09-19',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411717?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411717'',''177028'');" >127</A>] exhibit(s), [<A HREF=''_SERVLETU...',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>] Motion, [<A HREF=''_SERVLETURL_/docs1/004010411717?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411717'',''177028'');" >127</A>] exhibit(s), [<A HREF=''_SERVLETURL_/docs1/004010411722?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411722'',''177028'');" >128</A>] attachment addendum  [1001845587] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001845587',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '324b584c-973b-40e9-bf28-7f543cf71677',
        v_case_id,
        130,
        '2025-09-19',
        'Motion',
        'NOTICE ISSUED to Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 requesting response to Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]. Response due: 09/23/2025.. [24-2160, 25-1229] AW',
        'NOTICE ISSUED to Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229  requesting response to Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]. Response due: 09/23/2025.[1001845635]. [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001845635',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'b31e0825-4c8d-4510-97ea-1d6e9b9c8724',
        v_case_id,
        131,
        '2025-09-23',
        'Motion',
        'ORDER filed granting Motion to withdraw [<A HREF=''_SERVLETURL_/docs1/004010324631'' target=''new'' ONCLICK="return doDocPostURL(''004010324631'',''177028'');" >96</A>] Motion for summary disposition [<A HREF=''_SERVLETURL_/docs1/004010187964'' target=''new'' ONCLICK="return doDocPostURL(''004010187964'',''177982'');" >1001744472-2</A>]. Copies to all parties. [24-2160, 25-1229] AW',
        'ORDER filed granting Motion to withdraw [<A HREF=''_SERVLETURL_/docs1/004010324631'' target=''new'' ONCLICK="return doDocPostURL(''004010324631'',''177028'');" >96</A>] Motion for summary disposition [<A HREF=''_SERVLETURL_/docs1/004010187964'' target=''new'' ONCLICK="return doDocPostURL(''004010187964'',''177982'');" >1001744472-2</A>]. Copies to all parties. [1001846951] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001846951',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '42341105-f9e7-4bfe-899e-02948e4767b1',
        v_case_id,
        132,
        '2025-09-23',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160 to Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion to approve/authorize [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]. Nature of response: in opposition. [25-1229, 24-2160] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160   to Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion to approve/authorize [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]. Nature of response: in opposition. [1001847515] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001847515',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '1270a732-6f13-434d-8fab-d3e589d2f165',
        v_case_id,
        133,
        '2025-09-23',
        'Response',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010415912?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415912'',''177028'');" >133</A>] response by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160.. [25-1229, 24-2160] Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010415912?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415912'',''177028'');" >133</A>] response by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160..   [1001847517] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001847517',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '30c35640-4799-4961-84c6-984785c243e8',
        v_case_id,
        134,
        '2025-09-23',
        'Response',
        'REPLY by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to response [<A HREF=''_SERVLETURL_/docs1/004010415912?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415912'',''177028'');" >133</A>], exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010415922?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415922'',''177028'');" >134</A>].. [25-1229, 24-2160] Justin Saadein-Morales',
        'REPLY by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to response [<A HREF=''_SERVLETURL_/docs1/004010415912?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415912'',''177028'');" >133</A>], exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010415922?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010415922'',''177028'');" >134</A>]..  [1001847622] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to response [<A HREF=''_SERVLETURL_/docs1/004010415912?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL ;" >133</A>], exhibit [<A HREF=''_SERVLETURL_/docs1/004010415922?caseId=177028'' target=''new'' O',
        FALSE,
        '1001847622',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '88330834-df3b-4a8f-80bf-fc94cfe32e14',
        v_case_id,
        135,
        '2025-09-23',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010416168?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010416168'',''177028'');" >135</A>] reply [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010416168?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010416168'',''177028'');" >135</A>] reply  [1001847628] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001847628',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '3accdc42-cfe4-4863-9380-f041445989de',
        v_case_id,
        136,
        '2025-09-25',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160 to Motion [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>]. Nature of response: in opposition. [25-1229, 24-2160] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160   to Motion [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>]. Nature of response: in opposition. [1001848695] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001848695',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '9e10a19f-dc26-4b42-92f5-8cf7f5f7bd2b',
        v_case_id,
        137,
        '2025-09-25',
        'Response',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010418481?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010418481'',''177028'');" >137</A>] response by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160.. [25-1229, 24-2160] Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010418481?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010418481'',''177028'');" >137</A>] response by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160..   [1001848700] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001848700',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '077b6c89-68cb-440e-94b5-e68663839bd1',
        v_case_id,
        138,
        '2025-09-26',
        'Motion',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160 to strike Appellant''s Reply to Appellee''s Opposition to Appellant''s Emergency Motion.. Date and method of service: 09/26/2025 US mail, ecf. [25-1229, 24-2160] Thomas Junker',
        'MOTION by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160 to strike Appellant''s Reply to Appellee''s Opposition to Appellant''s Emergency Motion.. Date and method of service: 09/26/2025 US mail, ecf.      [1001849741] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001849741',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '32198f3a-3ac9-40a0-ae71-afee0be5cef5',
        v_case_id,
        139,
        '2025-09-26',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010420814?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010420814'',''177028'');" >139</A>] Motion to strike by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160.. [25-1229, 24-2160] Thomas Junker',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010420814?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010420814'',''177028'');" >139</A>] Motion to strike by Westridge Swim & Racquet Club, Inc. in 25-1229, 24-2160..   [1001849745] [25-1229, 24-2160] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001849745',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '643734b5-da71-4d13-a9f7-5db62f17bcbc',
        v_case_id,
        140,
        '2025-09-29',
        'Motion',
        'UNPUBLISHED PER CURIAM OPINION filed. Motion disposition in opinion--granting Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>] in 24-2160; denying Motion to strike [<A HREF=''_SERVLETURL_/docs1/004010420814?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010420814'',''177028'');" >139</A>], denying Motion to strike [<A HREF=''_SERVLETURL_/docs1/004010317695'' target=''new'' ONCLICK="return doDocPostURL(''004010317695'',''177028'');" >91</A>]; denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion to approve/authorize [<A HREF=''_SERVLETURL_/docs1/004010411708...',
        'UNPUBLISHED PER CURIAM OPINION filed. Motion disposition in opinion--granting Motion to dismiss appeal [<A HREF=''_SERVLETURL_/docs1/004010072704'' target=''new'' ONCLICK="return doDocPostURL(''004010072704'',''177028'');" >27</A>] in 24-2160; denying Motion to strike [<A HREF=''_SERVLETURL_/docs1/004010420814?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010420814'',''177028'');" >139</A>], denying Motion to strike [<A HREF=''_SERVLETURL_/docs1/004010317695'' target=''new'' ONCLICK="return doDocPostURL(''004010317695'',''177028'');" >91</A>]; denying Motion for injunctive relief pending appeal [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion for temporary administrative stay [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion to approve/authorize [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion to expedite decision [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>]; denying Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010411708?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010411708'',''177028'');" >126</A>], denying Motion for other relief [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] in 24-2160; denying Motion to impose sanctions [<A HREF=''_SERVLETURL_/docs1/004010409857?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010409857'',''177028'');" >123</A>], denying Motion to impose sanctions [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]; denying Motion for leave to file [<A HREF=''_SERVLETURL_/docs1/004010354195?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010354195'',''177028'');" >110</A>]; denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010327690'' target=''new'' ONCLICK="return doDocPostURL(''004010327690'',''177028'');" >101</A>], denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] in 24-2160, denying Motion for judicial notice [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] in 24-2160; denying Motion to enforce [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]; denying Motion to withdraw/relieve/substitute counsel [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]; denying Motion to show cause [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]; denying Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010308797'' target=''new'' ONCLICK="return doDocPostURL(''004010308797'',''177028'');" >81</A>]; denying Motion to affirm decision on appeal [<A HREF=''_SERVLETURL_/docs1/004010266494'' target=''new'' ONCLICK="return doDocPostURL(''004010266494'',''177028'');" >80</A>], denying Motion to affirm decision on appeal [<A HREF=''_SERVLETURL_/docs1/004010266473'' target=''new'' ONCLICK="return doDocPostURL(''004010266473'',''177028'');" >79</A>]; denying Motion to issue mandate forthwith [<A HREF=''_SERVLETURL_/docs1/004010189822'' target=''new'' ONCLICK="return doDocPostURL(''004010189822'',''177028'');" >34</A>] in 24-2160; denying Motion reverse decision on appeal [<A HREF=''_SERVLETURL_/docs1/004010188555'' target=''new'' ONCLICK="return doDocPostURL(''004010188555'',''177028'');" >32</A>] in 24-2160 Originating case number: 1:24-cv-01442-LMB-IDD. Copies to all parties and the district court/agency.   [1001850040] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001850040',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'c900d1ec-5620-4c3a-a49d-4a4ab1f0ba65',
        v_case_id,
        141,
        '2025-09-29',
        'Order',
        'JUDGMENT ORDER filed. Decision: Dismissed. Originating case number: 1:24-cv-01442-LMB-IDD. Entered on Docket Date: 09/29/2025. Copies to all parties and the district court/agency. [24-2160, 25-1229] AW',
        'JUDGMENT ORDER filed. Decision: Dismissed. Originating case number: 1:24-cv-01442-LMB-IDD. Entered on Docket Date: 09/29/2025. Copies to all parties and the district court/agency. [1001850048] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001850048',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '4cab13c4-a8c9-4f74-9c58-0da347f7aa5e',
        v_case_id,
        142,
        '2025-10-13',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to extend filing time for petition for rehearing.. Date and method of service: 10/13/2025 ecf. [25-1229, 24-2160] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to extend filing time for petition for rehearing.. Date and method of service: 10/13/2025 ecf.      [1001858990] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160 to extend filing time for petition for rehearing',
        FALSE,
        '1001858990',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '5b8c7fd1-9f6d-4c02-90c4-f7f8952fb406',
        v_case_id,
        143,
        '2025-10-13',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010441529?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010441529'',''177028'');" >143</A>] Motion to extend filing time [25-1229, 24-2160] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 25-1229, 24-2160. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010441529?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010441529'',''177028'');" >143</A>] Motion to extend filing time  [1001858991] [25-1229, 24-2160] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 25-1229, 24-2160',
        FALSE,
        '1001858991',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '8967f38f-302a-46a6-96ce-12864b504e3d',
        v_case_id,
        144,
        '2025-10-14',
        'Motion',
        'ORDER filed denying Motion to extend filing time [<A HREF=''_SERVLETURL_/docs1/004010441529?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010441529'',''177028'');" >143</A>]. Copies to all parties. [24-2160, 25-1229] AW',
        'ORDER filed denying Motion to extend filing time [<A HREF=''_SERVLETURL_/docs1/004010441529?caseId=177028'' target=''new'' ONCLICK="return doDocPostURL(''004010441529'',''177028'');" >143</A>]. Copies to all parties. [1001859099] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001859099',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '80281f37-6b19-4777-8abe-dbca185c7729',
        v_case_id,
        145,
        '2025-10-21',
        'Order',
        'Mandate issued. Referencing: [<A HREF=''_SERVLETURL_/docs1/004010421564'' target=''new'' ONCLICK="return doDocPostURL(''004010421564'',''177028'');" >142</A>] Judgment Order , [<A HREF=''_SERVLETURL_/docs1/004010421540'' target=''new'' ONCLICK="return doDocPostURL(''004010421540'',''177028'');" >141</A>] unpublished per curiam Opinion. Originating case number: 1:24-cv-01442-LMB-IDD.. [24-2160, 25-1229] AW',
        'Mandate issued. Referencing: [<A HREF=''_SERVLETURL_/docs1/004010421564'' target=''new'' ONCLICK="return doDocPostURL(''004010421564'',''177028'');" >142</A>] Judgment Order , [<A HREF=''_SERVLETURL_/docs1/004010421540'' target=''new'' ONCLICK="return doDocPostURL(''004010421540'',''177028'');" >141</A>] unpublished per curiam Opinion. Originating case number: 1:24-cv-01442-LMB-IDD.. [1001863664] [24-2160, 25-1229] AW',
        NULL,
        FALSE,
        '1001863664',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'acc7cc4e-eadc-4999-bf2b-68451ef38eaf',
        v_case_id,
        146,
        '2025-11-11',
        'Motion',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to recall mandate. , to vacate JUDGMENT (ECF 119) , to reopen case. Date and method of service: 11/11/2025 ecf. [24-2160, 25-1229] Justin Saadein-Morales',
        'MOTION by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to recall mandate. , to vacate JUDGMENT (ECF 119) , to reopen case. Date and method of service: 11/11/2025 ecf.      [1001875546] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229 to recall mandate',
        FALSE,
        '1001875546',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'd5377c6f-c646-4a3b-b918-246e5383d913',
        v_case_id,
        147,
        '2025-11-11',
        'Motion',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229.. [24-2160, 25-1229] Justin Saadein-Morales',
        'Exhibit(s) [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229..   [1001875547] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001875547',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '6746b454-b178-4b35-a9e2-208d82f3af95',
        v_case_id,
        148,
        '2025-11-11',
        'Certificate',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF COMPLIANCE WITH TYPE-VOLUME LIMITATIONS by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case  [1001875548] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001875548',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '025960dc-521f-40d7-8d4d-eb73e562e87e',
        v_case_id,
        149,
        '2025-11-11',
        'Certificate',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case, [<A HREF=''_SERVLETURL_/docs1/004010478398'' target=''new'' ONCLICK="return doDocPostURL(''004010478398'',''177028'');" >148</A>] exhibit(s) [24-2160, 25-1229] Justin Saadein-Morales',
        'CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales in 24-2160, 25-1229. Related documents: [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to recall mandate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to vacate, [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Motion to reopen case, [<A HREF=''_SERVLETURL_/docs1/004010478398'' target=''new'' ONCLICK="return doDocPostURL(''004010478398'',''177028'');" >148</A>] exhibit(s)  [1001875549] [24-2160, 25-1229] Justin Saadein-Morales',
        'Justin Jeffrey Saadein-Morales in 24-2160, 25-1229',
        FALSE,
        '1001875549',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        '261f9b5d-b4ab-4eaf-ac85-61b67770cafb',
        v_case_id,
        150,
        '2025-11-12',
        'Motion',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229 to Motion to recall mandate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>], Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>], Motion to reopen case [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]. Nature of response: in opposition. [24-2160, 25-1229] Thomas Junker',
        'RESPONSE/ANSWER by Westridge Swim & Racquet Club, Inc. in 24-2160, 25-1229   to Motion to recall mandate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>], Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>], Motion to reopen case [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]. Nature of response: in opposition. [1001876188] [24-2160, 25-1229] Thomas Junker',
        'Westridge Swim & Racquet Club, Inc',
        FALSE,
        '1001876188',
        CURRENT_TIMESTAMP
    );

    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)
    VALUES (
        'f83e3172-fac4-4289-b1d5-36934ed55453',
        v_case_id,
        151,
        '2025-11-12',
        'Motion',
        'ORDER filed denying Motion to recall mandate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]; denying Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]; denying Motion to reopen case [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Copies to all parties. [24-2160, 25-1229] RP',
        'ORDER filed denying Motion to recall mandate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]; denying Motion to vacate [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>]; denying Motion to reopen case [<A HREF=''_SERVLETURL_/docs1/004010478395'' target=''new'' ONCLICK="return doDocPostURL(''004010478395'',''177028'');" >147</A>] Copies to all parties. [1001876291] [24-2160, 25-1229] RP',
        NULL,
        FALSE,
        '1001876291',
        CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Successfully inserted % docket entries', 151;
END $$;

-- Verify insertion
SELECT COUNT(*) as total_entries, MIN(date_filed) as earliest_date, MAX(date_filed) as latest_date
FROM docket_entries
WHERE case_id = (SELECT id FROM cases WHERE case_number = '24-2160');
