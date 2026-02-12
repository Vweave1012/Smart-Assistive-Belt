#include <WiFi.h>
#include <Wire.h>

/* ================= WIFI CONFIG ================= */
const char* ssid     = "ESP32_TEST";      // 2.4 GHz WiFi
const char* password = "12345678";

/* ❗ IMPORTANT: ONLY IP, NO http:// */
const char* serverIP = "10.242.251.170";
const int   serverPort = 5000;

/* ================= MPU6050 ================= */
#define MPU_ADDR 0x68
#define SDA_PIN 21
#define SCL_PIN 22

/* ================= FSR PINS ================= */
#define FSR1_PIN 34
#define FSR2_PIN 32
#define FSR3_PIN 33

/* ================= THRESHOLDS ================= */
#define FSR_MIN        80
#define FSR_MAX        3000
#define PRESENCE_TH    10
#define MOTION_TH      2000
#define ROTATION_TH    4000

WiFiClient client;

/* ================= WIFI CONNECT ================= */
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected");
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Failed");
  }
}

/* ================= MPU READ ================= */
bool readMPU(long &motion, long &rotation) {
  Wire.beginTransmission(MPU_ADDR);
  if (Wire.endTransmission() != 0) return false;

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();

  motion = abs(ax) + abs(ay) + abs(az - 16384);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t gx = Wire.read() << 8 | Wire.read();
  int16_t gy = Wire.read() << 8 | Wire.read();
  int16_t gz = Wire.read() << 8 | Wire.read();

  rotation = abs(gx) + abs(gy) + abs(gz);

  return true;
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  delay(2000);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  connectWiFi();

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission();

  Serial.println("SYSTEM READY");
}

/* ================= LOOP ================= */
void loop() {
  connectWiFi();

  int fsr1 = analogRead(FSR1_PIN);
  int fsr2 = analogRead(FSR2_PIN);
  int fsr3 = analogRead(FSR3_PIN);

  int fsrAvg = (fsr1 + fsr2 + fsr3) / 3;
  int pressurePct = map(fsrAvg, FSR_MIN, FSR_MAX, 0, 100);
  pressurePct = constrain(pressurePct, 0, 100);

  bool present = pressurePct > PRESENCE_TH;

  long motion = 0, rotation = 0;
  bool mpuOK = readMPU(motion, rotation);

  bool systemOK = (WiFi.status() == WL_CONNECTED) && mpuOK;

  if (systemOK && client.connect(serverIP, serverPort)) {

    String json = "{";
    json += "\"fsr_pct\":" + String(pressurePct) + ",";
    json += "\"present\":" + String(present) + ",";
    json += "\"motion\":" + String(motion) + ",";
    json += "\"rotation\":" + String(rotation) + ",";
    json += "\"system_ok\":1";
    json += "}";

    client.println("POST /data HTTP/1.1");
    client.print("Host: "); client.println(serverIP);
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(json.length());
    client.println();
    client.println(json);

    Serial.println("✅ Data sent");

    while (client.available()) {
      Serial.println(client.readStringUntil('\n'));
    }

    client.stop();
  } else {
    Serial.println("❌ Server / System error");
  }

  delay(2000);
}