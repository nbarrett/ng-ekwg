#!/bin/sh
# Dump whole database
mongodump -h ds063168.mongolab.com:63168 -d ekwg -u ekwg -p ekwg -o data/dump
