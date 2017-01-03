USE ccio;
SELECT count(*) INTO @exist FROM information_schema.columns WHERE table_schema = database() AND COLUMN_NAME = 'username' AND table_name = 'Monitors';
set @query = IF(@exist <= 0, 'ALTER TABLE Monitors ADD username varchar(128) DEFAULT NULL AFTER host', 
'select \'Column Exists\' status');
prepare stmt from @query;
EXECUTE stmt;

SELECT count(*) INTO @exist FROM information_schema.columns WHERE table_schema = database() AND COLUMN_NAME = 'password' AND table_name = 'Monitors';
set @query = IF(@exist <= 0, 'ALTER TABLE Monitors ADD password varchar(128) DEFAULT NULL AFTER username', 
'select \'Column Exists\' status');
prepare stmt from @query;
EXECUTE stmt;
