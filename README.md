# 🌦️ UNO Q IoT Weather Station

An IoT-based weather monitoring system built using the **Arduino UNO Q**, environmental sensors, and **Supabase**.

The system collects temperature, humidity, atmospheric pressure, altitude, rainfall sensor readings, and gas/air-quality readings. The Arduino UNO Q's STM32 microcontroller handles the sensors, while its Linux system processes the data and uploads it to a Supabase database.

---

## ✨ Features

* 🌡️ Temperature monitoring
* 💧 Humidity monitoring
* 🌤️ Atmospheric pressure monitoring
* ⛰️ Altitude estimation
* 🌧️ Rain/wetness detection
* 🫁 Gas sensor monitoring
* 📡 Wi-Fi connectivity through the UNO Q
* ☁️ Cloud database storage using Supabase
* ⏱️ Automatic data upload every 5 minutes
* 🔄 Background uploader using Linux `systemd`
* 🔌 No ESP8266 or ESP32 required

---

## 🧩 Hardware

### Main Board

**Arduino UNO Q**

The project takes advantage of the UNO Q's dual-computing architecture:

* Qualcomm Dragonwing QRB2210 Linux processor
* STM32U585 microcontroller
* Built-in Wi-Fi
* Debian Linux

### Sensors

| Sensor           | Purpose                         |
| ---------------- | ------------------------------- |
| DHT11            | Temperature & Humidity          |
| BMP280           | Atmospheric Pressure & Altitude |
| HS-S09-L         | Rain/Wetness Detection          |
| MQ-series sensor | Gas/Air Quality Reading         |

---

## 🔌 Sensor Connections

The current configuration uses:

| Sensor         | Connection |
| -------------- | ---------- |
| DHT11 Data     | D2         |
| BMP280 SDA     | I²C SDA    |
| BMP280 SCL     | I²C SCL    |
| Rain Sensor AO | A0         |
| MQ Sensor AO   | A1         |

Check the voltage requirements of your individual sensor modules before connecting them.

---

# 🏗️ System Architecture

The project uses both processors inside the UNO Q.

```text
Sensors
   │
   ▼
STM32U585
Arduino Sketch
   │
   │ JSON
   ▼
Arduino Router
Monitor :7500
   │
   ▼
Debian Linux
Python Uploader
   │
   │ HTTPS
   ▼
Supabase
weather_data
```

The STM32 reads the sensors and produces JSON-formatted readings.

The Arduino Router exposes the serial data to the Linux side through its monitor interface.

A Python application running on the Linux side reads the data and uploads it to Supabase.

The Python application runs as a `systemd` service, allowing it to start automatically when the UNO Q boots.

---

# 📡 Data Format

Sensor readings are transferred as JSON.

Example:

```text
{"temperature":29.90,"humidity":69.00,"pressure":995.01,"altitude":153.02,"rain":320,"gas":502}
```

The Linux uploader reads these JSON messages from:

```text
127.0.0.1:7500
```

---

# 🗄️ Supabase

The project uses Supabase as the cloud database.

Create a table named:

**`weather_data`**

Recommended columns:

| Column      | Type        |
| ----------- | ----------- |
| temperature | float8      |
| humidity    | float8      |
| pressure    | float8      |
| altitude    | float8      |
| rain        | integer     |
| gas         | integer     |
| created_at  | timestamptz |

A default timestamp can be added to `created_at` so each measurement receives its insertion time automatically.

### REST API

The Python uploader communicates with the Supabase REST API and inserts sensor readings into the `weather_data` table.

**Do not commit your Supabase secret/API keys to GitHub.**

Use environment variables or a local configuration file instead.

---

# ⚙️ Software

The project consists of two main software components.

### Arduino Side

The Arduino sketch:

1. Initializes the sensors.
2. Reads the sensor values.
3. Converts the readings into JSON.
4. Sends the JSON through the UNO Q's serial/router interface.

The Arduino source code is available in the repository.

### Linux Side

The Python uploader:

1. Connects to the Arduino Router monitor.
2. Receives the JSON readings.
3. Parses the sensor data.
4. Uploads a reading to Supabase every 5 minutes.
5. Continues running in the background.

The Python source code is available in the repository.

---

# 🚀 Installation

## 1. Upload the Arduino Sketch

Open the Arduino project using **Arduino App Lab** and upload the weather station sketch to the UNO Q.

Verify that sensor readings are being produced correctly.

---

## 2. Configure the Linux Environment

Create a Python virtual environment on the UNO Q:

```text
python3 -m venv ~/weather/venv
```

Install the required Python dependencies from the repository.

---

## 3. Configure Supabase

Create the `weather_data` table and configure the Supabase project URL and authentication credentials in the Python uploader.

**Never upload your secret key to GitHub.**

---

## 4. Configure the Background Service

The repository includes the `systemd` service configuration used to run the Python uploader automatically.

After installing the service, enable it so that it starts automatically after boot.

---

# 🧪 Testing

The Arduino Router monitor can be tested from the UNO Q Linux terminal.

The weather data should appear as JSON readings.

The uploader should return an HTTP status of:

```text
201
```

when a new row is successfully inserted into Supabase.

The Supabase `weather_data` table can then be used to verify that measurements are being stored.

---

# ⏱️ Data Collection

The sensors can be sampled more frequently on the microcontroller, while the cloud database is updated every **5 minutes**.

This prevents unnecessary database requests while still providing a useful historical dataset.

The collected data can later be used for:

* Weather trend analysis
* Graphs and visualization
* Environmental monitoring
* Machine-learning experiments
* Weather prediction
* IoT dashboards

---

# ⚠️ Sensor Limitations

### Rain Sensor

The HS-S09-L analog output represents the relative wetness detected by the sensor.

It should **not** be considered a calibrated measurement of rainfall in millimeters.

For accurate rainfall measurements, a tipping-bucket rain gauge would be more suitable.

### MQ Sensor

MQ-series sensors provide analog readings that depend on the sensor, environment, calibration, and warm-up time.

The gas value in this project should therefore be treated as a **relative sensor reading**, rather than a calibrated air-quality measurement.

### DHT11

The DHT11 is inexpensive and suitable for basic environmental monitoring, but it has relatively limited accuracy and resolution compared with modern temperature/humidity sensors.

---

# 📁 Repository Structure

A suggested repository structure:

```text
uno-q-weather-station/
│
├── arduino/
│   └── weather_station.ino
│
├── linux/
│   ├── upload.py
│   └── weather-upload.service
│
├── dashboard/
│
├── .gitignore
└── README.md
```

---

# 🔮 Future Improvements

* [ ] Web-based weather dashboard
* [ ] Real-time sensor graphs
* [ ] Historical data visualization
* [ ] Mobile-friendly interface
* [ ] Weather alerts
* [ ] Rainfall statistics
* [ ] Better air-quality calibration
* [ ] Local data buffering when Wi-Fi is unavailable
* [ ] Automatic retry for failed uploads
* [ ] GPS/location support
* [ ] Machine-learning-based weather prediction
* [ ] Grafana integration

---

# 🛠️ Technologies Used

* **Arduino UNO Q**
* **STM32U585**
* **Debian Linux**
* **Arduino App Lab**
* **Arduino Router**
* **C++ / Arduino**
* **Python 3**
* **Supabase**
* **REST API**
* **systemd**
* **DHT11**
* **BMP280**
* **HS-S09-L**
* **MQ-series sensor**

---

# 🎯 Project Goal

The goal of this project is to demonstrate how the **Arduino UNO Q's microcontroller and Linux processor can work together as a complete IoT platform**.

Instead of requiring a separate ESP8266/ESP32 for networking, the UNO Q handles sensor acquisition on the STM32 while using its onboard Linux system for networking, data processing, and cloud communication.

---

## 📜 License

This project is intended for educational and personal use.

Feel free to modify and extend it for your own IoT experiments.
