#!/bin/bash
#
# Import provided Mongodump files in to MongoDB.
#
# The files in the {vvv-dir}/database/backups/mongodb/ directory should be created by
# mysqldump or some other export process that generates a full set of SQL commands
# to create the necessary tables and data required by a database.
#
# Existing data will be overwritten
#
# Let's begin...

# Move into the newly mapped backups directory, where mysqldump(ed) SQL files are stored
printf "\nStart MongoDB Database Import\n"
cd /srv/database/backups/mongodb/

# Parse through each file in the directory and use the file name to
# import the SQL file into the database of the same name
mongo_count=`ls -1 *.tar.gz 2>/dev/null | wc -l`
if [ $mongo_count != 0 ]
then
	for file in $( ls *.tar.gz )
	do
		pre_dot=${file%%.tar.gz}
		printf "tar -xzf $file && mongorestore --drop -d $pre_dot $pre_dot/ && rm -rf $pre_dot/\n"
		tar -xzf $file && mongorestore --drop -d $pre_dot $pre_dot/ && rm -rf $pre_dot/
	done
	printf "Databases imported\n"
else
	printf "No custom databases to import\n"
fi