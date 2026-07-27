# AI Fake News Detector

A production-ready full-stack web application designed to simulate an AI-based (BERT model) fake news detection system. The application features user authentication with OTP verification, session management, and a clean, responsive modern UI.

## Technologies Used
- **Backend:** Java, Spring Boot, Spring Data JPA, Spring Security (bcrypt), JavaMailSender
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Architecture:** REST APIs

## Features
- **OTP Verification:** Secure user registration with a 6-digit OTP code emailed to the user for account activation.
- **Session Management:** LocalStorage-based frontend session handling with password hashing (BCrypt) on the backend.
- **REST APIs:** Fully customized `/api/auth` and `/api/news` endpoints.
- **News Detection Mocking:** Analyzes inputted text and responds with a Fake/Real status and a Confidence Score.
- **Modern UI:** Clean, responsive, card-based web design.

## Project Structure
```text
AI-Fake-News-Detector/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── fakenews/
│       │           ├── Application.java
│       │           ├── config/
│       │           ├── controller/
│       │           ├── model/
│       │           ├── repository/
│       │           └── service/
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── css/
│               ├── js/
│               └── *.html
└── pom.xml
```

## Setup Instructions

### 1. Database Configuration
1. Install MySQL and start the server at `localhost:3306`.
2. Ensure you have the user `root` with the password `root` (or update `application.properties` to match your local setup).
3. Create the database via your MySQL console:
   ```sql
   CREATE DATABASE IF NOT EXISTS fakenews_db;
   ```

### 2. Email Server Configuration
To allow the JavaMailSender to send OTP emails, configure `application.properties`:
1. Open `src/main/resources/application.properties`.
2. Locate `spring.mail.username` and `spring.mail.password`.
3. Provide your Gmail ID and and an **App Password** generated from your Google Account settings.

### 3. Build and Run
Make sure you have JDK 17+ and Maven installed.

1. Navigate to the project root folder.
2. Build the app using Maven:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   Or run the `Application.java` main class from your IDE.

### 4. Application Access
- The application runs by default on `http://localhost:8080`
- Open your browser and navigate to: [http://localhost:8080/](http://localhost:8080/)
- Use the Register page to create an account, verify the OTP in your email inbox, and log in to use the AI news detection tool.

## AI Model Setup (Python)
The system uses a highly trained Scikit-Learn TF-IDF classification model exposed via a Flask REST API to accurately detect fake news. To run the AI inference engine:

1. Ensure **Python 3.8+** is installed on your system.
2. Open a new terminal and navigate to the `python-ai-model` directory:
   ```bash
   cd python-ai-model
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```bash
   python app.py
   ```
5. The model will automatically train itself on startup using `dataset.csv` and listen on `http://localhost:5000/predict`.

*Note: The Spring Boot application depends on this Python API being active to return real predictions and confidence scores.*
