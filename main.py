# app.py - runs on your laptop
from flask import Flask, render_template, jsonify, request
import sqlite3
from datetime import datetime

app = Flask(__name__)
DB = 'campuspulse.db'

def init_db():
    conn = sqlite3.connect(DB)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS readings (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   TEXT,
            temperature REAL,
            humidity    REAL,
            pressure    REAL,
            rain        TEXT,
            rain_level  INTEGER,
            light       INTEGER,
            discomfort  REAL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def dashboard():
    return render_template('index.html')

@app.route('/api/receive', methods=['POST'])
def receive():
    data = request.json
    conn = sqlite3.connect(DB)
    conn.execute('''
        INSERT INTO readings
        (timestamp, temperature, humidity, pressure, rain, rain_level, light, discomfort)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        data['temperature'], data['humidity'],
        data['pressure'],    data['rain'],
        data['rain_level'],  data['light'],
        data['discomfort']
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

@app.route('/api/live')
def live():
    conn = sqlite3.connect(DB)
    row = conn.execute('''
        SELECT * FROM readings ORDER BY id DESC LIMIT 1
    ''').fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'no data yet'})
    return jsonify({
        'timestamp'  : row[1],
        'temperature': row[2],
        'humidity'   : row[3],
        'pressure'   : row[4],
        'rain'       : row[5],
        'light'      : row[7],
        'discomfort' : row[8]
    })

@app.route('/api/history')
def history():
    conn = sqlite3.connect(DB)
    rows = conn.execute('''
        SELECT timestamp, temperature, humidity, pressure, discomfort
        FROM readings ORDER BY id DESC LIMIT 48
    ''').fetchall()
    conn.close()
    return jsonify([{
        'timestamp'  : r[0],
        'temperature': r[1],
        'humidity'   : r[2],
        'pressure'   : r[3],
        'discomfort' : r[4]
    } for r in reversed(rows)])

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)