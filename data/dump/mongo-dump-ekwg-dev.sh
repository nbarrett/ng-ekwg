#!/bin/sh
# Dump whole database
echo performing backup of database from $PWD
mongodump --uri mongodb+srv://ekwg-dev.susjh.mongodb.net --db nbarrett --username ekwg --password 3UeZN@w8rvjQgt5 --out databases/ekwg-dev
