
# SOUP API

**S**imple, **O**pen, **U**seful, and **P**ractical API  
My name is SOUPTIK (so "soup" comes from there too!)

SOUP API is your go-to toolkit for motivation, health tracking, geolocation, email messaging, and URL shortening. Whether you need a daily dose of inspiration, want to calculate your BMI, track your health logs, send emails on the fly, or create short URLs, SOUP API has you covered. It’s lightweight, easy to use, and perfect for developers building wellness apps or anyone looking to stay motivated and healthy.

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
  - `ip`: IP address (optional, defaults to the requester’s IP)
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/geolocation?ip=8.8.8.8"
  ```
- **Response**:
  ```json
  {
    "ip": "8.8.8.8",
    "country": "US",
    "region": "CA",
    "city": "Mountain View",
    "coordinates": {
      "latitude": 37.386,
      "longitude": -122.0838
    }
  }
  ```
  > *Note*: The accuracy of geolocation details depends on the geoip service.

---

### 4. **POST `/loghealth`**
- **Description**: Log daily health data for a user.
- **Parameters** (as query parameters):
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
- **Parameters** (as query parameters):
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

### 6. **POST `/email/:senderEmail/:appPass/:recipientEmail/:message`**
- **Description**: Send an email using user-supplied credentials. No environment variables needed!
- **Route Parameters**:
  - `senderEmail`: The sender’s email address.
  - `appPass`: The sender’s app-specific password.
  - `recipientEmail`: The recipient’s email address.
  - `message`: The text message to send.
- **Example**:
  ```bash
  curl -X POST "http://37.27.51.34:42493/email/sender@example.com/appSpecificPass/recipient@example.com/Hello%20from%20SOUPapi"
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "info": { /* nodemailer info response */ }
  }
  ```

---

### 7. **POST `/shorten`**
- **Description**: Create a shortened URL for any given URL.
- **Request Body** (JSON):
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Example**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"url": "https://example.com"}' "http://37.27.51.34:42493/shorten"
  ```
- **Response**:
  ```json
  {
    "original_url": "https://example.com",
    "short_url": "http://37.27.51.34:42493/u/abcd1234",
    "short_code": "abcd1234"
  }
  ```

---

### 8. **GET `/u/:shortCode`**
- **Description**: Redirect to the original URL based on the provided short code.
- **Route Parameter**:
  - `shortCode`: The unique code corresponding to the shortened URL.
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/u/abcd1234"
  ```
- **Behavior**: This endpoint will redirect your browser to the original URL and increment the click count.

---

### 9. **GET `/stats/:shortCode`**
- **Description**: Retrieve statistics for a shortened URL.
- **Route Parameter**:
  - `shortCode`: The unique code corresponding to the shortened URL.
- **Example**:
  ```bash
  curl "http://37.27.51.34:42493/stats/abcd1234"
  ```
- **Response**:
  ```json
  {
    "original_url": "https://example.com",
    "short_code": "abcd1234",
    "created_at": "2023-10-05T12:34:56.789Z",
    "clicks": 5
  }
  ```

---

## Testing the API

You can test the API using `curl` or tools like [Postman](https://www.postman.com/). The examples provided above demonstrate how to interact with each endpoint.

---

## Notes

- **Health Logging**: Health logs are stored in an SQLite database. Please safeguard user credentials.
- **BMI Calculation**: The BMI provided is a general indicator. For a comprehensive health assessment, consult a professional.
- **Geolocation**: Results depend on the geoip service. Some details might vary.
- **Email Sending**: Ensure valid credentials are provided. Use caution when handling sensitive information.
- **URL Shortener**: Every shortened URL is unique and the API tracks access counts for each.

---

Enjoy using SOUP API – your simple, open, useful, and practical toolkit for a motivated and healthy life!

---
