#!/bin/sh
# Dump whole database
echo performing backup of database from $PWD
mongodump -h ds063168.mongolab.com:63168 -d ekwg -u ekwg -p ekwg -o databases
