#!/bin/sh
# Dump whole database
echo performing restore of database from $PWD
mongorestore --uri mongodb+srv://ekwg-dev.susjh.mongodb.net --db ekwg-dev --username ekwg --password 3UeZN@w8rvjQgt5 databases/ekwg-dev
