### **SOUP api**  
**S**imple, **O**pen, **U**seful, and **P**ractical API  
my name is SOUPTIK ( so soup from there too)

SOUPapi is your go-to toolkit for motivation, health tracking, and geolocation. Whether you need a daily dose of inspiration, want to calculate your BMI, or track your health logs, SOUPapi has you covered. It’s lightweight, easy to use, and perfect for developers building wellness apps or anyone looking to stay motivated and healthy.  

With SOUPapi, you can:  
- Get **unique motivational quotes** to brighten your day.  
- Calculate your **BMI** with support for metric and imperial units.  
- Retrieve **geolocation** details for any IP address.  (OSNIT :skull:)
- Log and retrieve **daily health data** securely.  

# SOUP API

Welcome to the **SOUP API**! This API provides motivational quotes, calculates BMI, retrieves geolocation information, and allows users to log and retrieve health data. It’s hosted at `http://37.27.51.34:42493/`.

---

## How to Use

### Base URL
All endpoints are available at:
```
http://37.27.51.34:42493/
```

---

## API Endpoints

### 1. **GET `/quote`**
- **Description**: Fetch a random motivational quote.
- **Example**:
  ```bash
  curl http://37.27.51.34:42493/quote
  ```
- **Response**:
  ```json
  {
    "quote": "The strongest people are not those who show strength in front of us but those who win battles we know nothing about. - Unknown",
    "note": "These are carefully selected, less common motivational quotes"
  }
  ```

---

### 2. **GET `/bmi`**
- **Description**: Calculate BMI based on weight, height, age, gender, and unit system.
- **Parameters**:
  - `w`: Weight (required)
  - `h`: Height (required)
  - `u`: Unit system (`m` for metric, `i` for imperial) (optional, default: `m`)
  - `g`: Gender (`m` for male, `f` for female) (optional)
  - `a`: Age (required)
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/bmi?w=75&h=180&u=m&g=m&a=30"
  ```
- **Response**:
  ```json
  {
    "parameters": {
      "weight": 75,
      "height": 180,
      "units": "metric (kg/cm)",
      "gender": "male",
      "age": 30
    },
    "bmi": "23.1",
    "note": "BMI is a general indicator. Consult healthcare professional for proper assessment."
  }
  ```

---

### 3. **GET `/geolocation`**
- **Description**: Retrieve geolocation information for a given IP address.
- **Parameters**:
  - `ip`: IP address (optional, defaults to the requester's IP)
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/geolocation?ip=8.8.8.8"
  ```
- **Response**:
  ```json
  {
    "ip": "8.8.8.8",
    "country": "United States",
    "region": "California",
    "city": "Mountain View",
    "isp": "Google LLC",
    "coordinates": {
      "latitude": 37.4056,
      "longitude": -122.0775
    }
  }
  ```

---

### 4. **POST `/loghealth`**
- **Description**: Log daily health data for a user.
- **Parameters**:
  - `n`: Username (required)
  - `p`: Password (required)
  - `log`: Health log entry (required)
- **Example**:
  ```bash
  curl -X POST "http://37.27.51.34:42493/loghealth?n=john&p=1234&log=Felt%20great%20today"
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Health log added successfully",
    "totalLogs": 1
  }
  ```

---

### 5. **GET `/getlog`**
- **Description**: Retrieve health logs for a user.
- **Parameters**:
  - `n`: Username (required)
  - `p`: Password (required)
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/getlog?n=john&p=1234"
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "logs": [
      {
        "timestamp": "2023-10-05T12:34:56.789Z",
        "log": "Felt great today"
      }
    ],
    "totalLogs": 1
  }
  ```

---

## Testing the API

You can test the API using `curl` or tools like [Postman](https://www.postman.com/). Examples are provided above for each endpoint.

---


## Notes

- **Health Logging**: Logs are stored in memory and will be cleared when the server restarts.
- **BMI Calculation**: Uses WHO standards for BMI categories.

---

Enjoy using the API!

---
