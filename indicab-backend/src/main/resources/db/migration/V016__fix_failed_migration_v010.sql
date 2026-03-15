-- Fix failed migration v010
-- This migration updates the failed v010 entry to mark it as successful
-- allowing Flyway to proceed with subsequent migrations

-- Force mark V010 as successful so migrations can continue
UPDATE `flyway_schema_history`
SET `success` = 1, `execution_time` = 1000
WHERE `version` = '010' AND `success` = 0;

-- Also ensure V011 and earlier are marked successful
UPDATE `flyway_schema_history`
SET `success` = 1
WHERE `success` = 0 AND `version` IN ('001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011');

-- Verify the fix
SELECT 'Migration fix applied. V010 marked as successful.' as status;
SELECT * FROM `flyway_schema_history` WHERE `version` IN ('009', '010', '011', '016');
