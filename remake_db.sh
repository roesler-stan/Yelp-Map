#!/bin/bash
mysqladmin -u root drop yelp2016 -f
mysqladmin -u root create yelp2016
python db_create.py
