#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

#define RAIN_PIN A0
#define MQ_PIN A1

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);

  dht.begin();

  if (!bmp.begin(0x76)) {
    if (!bmp.begin(0x77)) {
      Serial.println("BMP280 not detected!");
      while (1);
    }
  }

  Serial.println("Weather Station Ready");
}

void loop() {

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  float pressure = bmp.readPressure() / 100.0;
  float altitude = bmp.readAltitude(1013.25);

  int rain = analogRead(RAIN_PIN);
  int gas = analogRead(MQ_PIN);

  Serial.println("\n==============================");

  if (isnan(temp) || isnan(hum)) {
    Serial.println("DHT11 Read Failed");
  } else {
    Serial.print("Temperature : ");
    Serial.print(temp);
    Serial.println(" °C");

    Serial.print("Humidity    : ");
    Serial.print(hum);
    Serial.println(" %");
  }

  Serial.print("Pressure    : ");
  Serial.print(pressure);
  Serial.println(" hPa");

  Serial.print("Altitude    : ");
  Serial.print(altitude);
  Serial.println(" m");

  Serial.print("Rain Value  : ");
  Serial.println(rain);

  if (rain > 950)
    Serial.println("Weather     : Dry");
  else if (rain > 800)
    Serial.println("Weather     : Light Rain");
  else if (rain > 600)
    Serial.println("Weather     : Moderate Rain");
  else if (rain > 350)
    Serial.println("Weather     : Heavy Rain");
  else
    Serial.println("Weather     : Very Heavy Rain");

  Serial.print("MQ Value    : ");
  Serial.println(gas);

  if (gas < 200)
    Serial.println("Air Quality : Excellent");
  else if (gas < 400)
    Serial.println("Air Quality : Good");
  else if (gas < 650)
    Serial.println("Air Quality : Moderate");
  else if (gas < 850)
    Serial.println("Air Quality : Poor");
  else
    Serial.println("Air Quality : Very Poor");

  delay(2000);
}