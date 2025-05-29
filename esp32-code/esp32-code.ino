#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define oneWirePin 16
// #define ssid "";

// Wi-Fi Credentials
const char* ssid = "Galax_A41";
const char* password = "123456789g";

// Server Details
const char* serverIP = "192.168.228.196"; // e.g., "192.168.1.100"
const int serverPort = 5000; // Match server port
const String endpoint = "/api/temperature";

// DS18B20 Setup
OneWire oneWire(oneWirePin); // GPIO 16
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();
  connectToWiFi();
}

void loop() {
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0); // First sensor on bus
  Serial.print("Current Temp: ");
  Serial.println(temp);

  sendTemperatureToServer(temp);
  delay(1000); // Send every 10 seconds
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");
}

void sendTemperatureToServer(float temp) {
  WiFiClient client;
  if (client.connect(serverIP, serverPort)) {
    String payload = "{\"patient_id\":\"" + String(WiFi.macAddress()) + "\",\"temperature\":" + String(temp) + "}";
    client.println("POST " + endpoint + " HTTP/1.1");
    client.println("Host: " + String(serverIP));
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(payload.length());
    client.println();
    client.println(payload);

    Serial.println("Data sent!");
  } else {
    Serial.println("Failed to connect to server.");
  }
  client.stop();
}