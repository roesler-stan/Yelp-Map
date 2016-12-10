mysql --local-infile=1 -u root yelp2016

LOAD DATA LOCAL INFILE '../Data/app_data/all_reviews.csv'
INTO TABLE reviews
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA LOCAL INFILE '../Data/app_data/all_businesses.csv'
INTO TABLE businesses
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;


sftp katharina@ssh.pythonanywhere.com

scp static/data/all_* katharina@ssh.pythonanywhere.com:yelp/static/data/
