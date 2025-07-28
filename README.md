# RPI API

**R**apid, **P**ractical, and **I**nnovative API
Your lightweight toolkit for motivation, health tracking, geolocation, email messaging, and URL shortening.

RPI API is designed for developers and wellness enthusiasts alike. Whether you need a daily dose of inspiration, want to calculate your BMI, track your health logs, send emails on the fly, or create short URLs, RPI API has you covered.

---

## Base URL

All endpoints are available at:

```
https://rpi-api-production.up.railway.app/
```

---

## API Endpoints

### 1. **GET `/quote`**

* **Description**: Fetch a random motivational quote.
* **Example**:

  ```bash
  curl https://rpi-api-production.up.railway.app/quote
  ```
* **Response**:

  ```json
  {
    "quote": "The strongest people are not those who show strength in front of us but those who win battles we know nothing about. - Unknown",
    "note": "These are carefully selected, less common motivational quotes"
  }
  ```

---

### 2. **POST `/quote`**

* **Description**: Add a new motivational quote.
* **Request Body** (JSON):

  ```json
  {
    "quote": "Your new inspirational quote here."
  }
  ```
* **Example**:

  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"quote": "Your new inspirational quote here."}' https://rpi-api-production.up.railway.app/quote
  ```
* **Response**:

  ```json
  {
    "status": "success",
    "quoteId": 11
  }
  ```

---

### 3. **GET `/bmi`**

* **Description**: Calculate BMI based on weight, height, age, gender, and unit system.
* **Parameters**:

  * `w`: Weight (required)
  * `h`: Height (required)
  * `u`: Unit system (`m` for metric, `i` for imperial) (optional, default: `m`)
  * `g`: Gender (`m` for male, `f` for female) (optional)
  * `a`: Age (required)
* **Example**:

  ```bash
  curl "https://rpi-api-production.up.railway.app/bmi?w=75&h=180&u=m&g=m&a=30"
  ```
* **Response**:

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
    "note": "BMI is a general indicator. Consult a healthcare professional for proper assessment."
  }
  ```

---

### 4. **GET `/geolocation`**

* **Description**: Retrieve geolocation information for a given IP address.
* **Parameters**:

  * `ip`: IP address (optional, defaults to the requester’s IP)
* **Example**:

  ```bash
  curl "https://rpi-api-production.up.railway.app/geolocation?ip=8.8.8.8"
  ```
* **Response**:

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

---

### 5. **POST `/loghealth`**

* **Description**: Log daily health data for a user.
* **Parameters** (as query parameters):

  * `n`: Username (required)
  * `p`: Password (required)
  * `log`: Health log entry (required)
* **Example**:

  ```bash
  curl -X POST "https://rpi-api-production.up.railway.app/loghealth?n=john&p=1234&log=Felt%20great%20today"
  ```
* **Response**:

  ```json
  {
    "status": "success",
    "message": "Health log added successfully",
    "totalLogs": 1
  }
  ```

---

### 6. **GET `/getlog`**

* **Description**: Retrieve health logs for a user.
* **Parameters** (as query parameters):

  * `n`: Username (required)
  * `p`: Password (required)
* **Example**:

  ```bash
  curl "https://rpi-api-production.up.railway.app/getlog?n=john&p=1234"
  ```
* **Response**:

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

### 7. **POST `/email/:senderEmail/:appPass/:recipientEmail/:message`**

* **Description**: Send an email using user-supplied credentials.
  This endpoint sends an email without requiring any environment variables.
* **Route Parameters**:

  * `senderEmail`: The sender’s email address.
  * `appPass`: The sender’s app-specific password.
  * `recipientEmail`: The recipient’s email address.
  * `message`: The text message to be sent.
* **Example**:

  ```bash
  curl -X POST "https://rpi-api-production.up.railway.app/email/sender@example.com/appSpecificPass/recipient@example.com/Hello%20from%20RPI%20API"
  ```
* **Response**:

  ```json
  {
    "status": "success",
    "info": { /* nodemailer info response */ }
  }
  ```

---

### 8. **POST `/shorten`**

* **Description**: Create a shortened URL for a given original URL.
* **Request Body** (JSON):

  ```json
  {
    "url": "https://example.com"
  }
  ```
* **Example**:

  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"url": "https://example.com"}' https://rpi-api-production.up.railway.app/shorten
  ```
* **Response**:

  ```json
  {
    "original_url": "https://example.com",
    "short_url": "https://rpi-api-production.up.railway.app/u/abcd1234",
    "short_code": "abcd1234"
  }
  ```

---

### 9. **GET `/u/:shortCode`**

* **Description**: Redirect to the original URL based on the provided short code.
* **Route Parameter**:

  * `shortCode`: The unique code corresponding to the shortened URL.
* **Example**:

  ```bash
  curl "https://rpi-api-production.up.railway.app/u/abcd1234"
  ```
* **Behavior**: This endpoint will redirect your browser to the original URL and increment its click count.

---

### 10. **GET `/stats/:shortCode`**

* **Description**: Retrieve statistics for a shortened URL.
* **Route Parameter**:

  * `shortCode`: The unique code corresponding to the shortened URL.
* **Example**:

  ```bash
  curl "https://rpi-api-production.up.railway.app/stats/abcd1234"
  ```
* **Response**:

  ```json
  {
    "original_url": "https://example.com",
    "short_code": "abcd1234",
    "created_at": "2023-10-05T12:34:56.789Z",
    "clicks": 5
  }
  ```

---

## Notes

* **Health Logging**: Health logs are stored in an SQLite database. User credentials should be handled securely.
* **BMI Calculation**: The BMI value provided is a general indicator; for a comprehensive health assessment, please consult a professional.
* **Geolocation**: The accuracy of the geolocation information is dependent on the underlying geoip service.
* **Email Sending**: Ensure you provide valid email credentials. This endpoint uses nodemailer to send emails.
* **URL Shortener**: Each shortened URL is unique, and the API tracks the number of clicks for each.
  

