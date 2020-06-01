#!/bin/sh
# Dump whole database
echo performing backup of database from $PWD
mongodump -h ds061258.mongolab.com:61258 -d nbarrett -u ekwg -p ekwg -o databases
