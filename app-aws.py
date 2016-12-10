#!/usr/bin/env python

from flask import Flask, render_template, request, redirect, Response, flash, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.sql.expression import func, select
import os
import json
import datetime

application = Flask(__name__)
app = application

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://' \
+ os.environ['RDS_USERNAME'] + ':' + os.environ['RDS_PASSWORD'] +'@' + os.environ['RDS_HOSTNAME'] + \
':' + os.environ['RDS_PORT'] + '/' + os.environ['RDS_DB_NAME']

# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://' + RDS_USERNAME + ':' + RDS_PASSWORD +'@' + RDS_HOSTNAME + ':' + RDS_PORT + '/' + RDS_DB_NAME

# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "postgres://localhost")

db = SQLAlchemy(app)

@app.route('/')
def frontpage():
    return redirect('/index')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/data', methods = ['POST', 'GET'])
def data():
    # dtype is business, review, or map
    dtype = request.args.get('dtype', type = str)
    business_id = request.args.get('business_id', type = str)
    business_type = request.args.get('business_type', type = str)

    # return US state map data
    if dtype == 'map':
        states_file = 'static/data/us-states.json'
        with open(states_file) as data_file:    
            states_map = json.load(data_file)
        return jsonify(states_map)

    elif dtype == 'business':
        query_results = Businesses.query.all()
        data_json = json.dumps([{'business_id': row.business_id, 'type': row.type, 'lat': row.lat, 'lon': row.lon, 'cat': row.cat,
            'city': row.city, 'state': row.state, 'name': row.name} for row in query_results])
        return data_json

    # Return reviews for that business
    elif dtype == 'reviews':
        query_results = Reviews.query.filter(db.and_(Reviews.business_id == business_id, Reviews.type == business_type)).all()
        data_json = json.dumps([{'review_id': row.review_id, 'type': row.type, 'business_id': row.business_id, 'text': row.text, 'uname': row.uname} for row in query_results])
        return data_json

class Businesses(db.Model):
    __tablename__ = 'businesses'

    business_id = db.Column(db.String(100), primary_key = True)
    type = db.Column(db.String(10), primary_key = True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    cat = db.Column(db.String(30))
    city = db.Column(db.String(80))
    state = db.Column(db.String(5))
    name = db.Column(db.String(200))

    def __init__(self, business_id, type, lat, lon, cat, city, state, name):
        self.business_id = business_id
        self.type = type
        self.lat = lat
        self.lon = lon
        self.cat = cat
        self.city = city
        self.state = state
        self.name = name

    # def __repr__(self):
    #     return "'business_id': {}, type: {}, lat: {} lon: {}, cat: {}, city: {}, state: {}, name: {}".format(self.business_id, self.type, self.lat, self.lon, self.cat, self.city, self.state, self.name)

class Reviews(db.Model):
    __tablename__ = 'reviews'

    review_id = db.Column(db.String(80), primary_key = True)
    type = db.Column(db.String(10), primary_key = True)
    business_id = db.Column(db.String(100))
    text = db.Column(db.String(5500))
    uname = db.Column(db.String(100))

    def __init__(self, review_id, type, business_id, text, uname):
        self.review_id = review_id
        self.type = type
        self.business_id = business_id
        self.text = text
        self.uname = uname

    # def __repr__(self):
    #     return "'review_id': {}, 'type': {}, 'business_id': {}, 'text': {}, 'uname': {}".format(self.review_id, self.type, self.business_id, self.text, self.uname)

if __name__ == "__main__":
    app.run(debug = False)