#!/bin/sh
# Dump whole database
mongodump -h ds061258.mongolab.com:61258 -d nbarrett -u ekwg -p ekwg -o data/dump
