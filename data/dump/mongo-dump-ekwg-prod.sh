#!/bin/sh
# Dump whole database
echo performing backup of database from $PWD
mongodump --uri mongodb+srv://ekwg:iczvKj2hXsDAph0s@ekwg-prod.wunxy.mongodb.net --db ekwg --username ekwg --password iczvKj2hXsDAph0s --out databases/ekwg-prod
