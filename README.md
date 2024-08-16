# 🎨 MindsMesh

## 🚀 Overview

Welcome to **MindsMesh** — an innovative online platform designed for creatives (slightly hipsters 🧑‍🎨), tech enthusiasts 💻, and developers 👩‍💻 to share their skills, offer lessons, and learn from others. The platform features user authentication, profile management, skill offerings, a booking system, and a review system. Additionally, it includes an admin dashboard for managing users, skills, and bookings, providing a seamless experience for both users and administrators.

![MindsMesh Cat](/apps/client/public/Hipster-Chubby-Cat.png)

## 🌟 Features

### 🔒 User Authentication

- **Registration & Login:** Secure user authentication using JWT.
- **Role-Based Access Control:** Different access levels for users and admins.

### 👤 User Profiles

- **Profile Management:** Users can create and update profiles with bio, photo, skills offered, and reviews.
- **Public Profiles:** Profiles are accessible publicly with user statistics.

### 🎯 Skill Offering

- **Create Listings:** Users can offer skills by creating listings with title, description, price, and availability.
- **Categories:** Skills are categorized (e.g., frontend developer, creative script writer, illustrator, etc..).

### 📅 Booking System

- **Book Lessons:** Users can book lessons from available skill offerings.
- **Scheduling:** Integration with a calendar for lesson scheduling.
- **Notifications:** Reminders for upcoming lessons.

### ⭐ Review System

- **Leave Reviews:** Users can leave reviews and ratings after lessons.
- **Aggregate Ratings:** Each skill provider has an overall rating.

### 🛠️ Admin Dashboard

- **User & Skill Management:** Admins can manage users, skills, and bookings.
- **Analytics:** Dashboard showing platform usage, popular skills, etc.

### 🎁 Optional Features

- **Messaging System:** In-app messaging for communication before/after booking.
- **Payment Integration:** Integrate with Stripe for handling paid lessons.

## 🛠️ Tech Stack

### 🔧 Backend (NestJS)

- **NestJS:** A powerful Node.js framework for building scalable and efficient server-side applications, providing an organized structure and TypeScript support out of the box.
- **TypeORM:**  An ORM for TypeScript and JavaScript (ES7, ES6, ES5), allowing for database management with PostgreSQL, making data modeling easier and more intuitive.
- **Passport.js:** Middleware for authentication in Node.js applications, supporting various authentication strategies, with a focus on JWT for secure API access.
- **Swagger:** A tool for documenting  API, enabling easy visualization and interaction with API endpoints directly from a browser.
- **Socket.IO :** A library for real-time, bidirectional, and event-based communication, making it ideal for applications that require live updates, such as chat apps.

### 🎨 Frontend (React 19 RC / OBS: React 18 for the moment)

**🧙‍♂️👨‍💻 Upon it´s release I will be migrating this project to use React 19!** 

- **React 19 :** The latest upcoming version of the most popular front-end library, React, introducing several new features and improvements for building user interfaces. Some anticipated features include:
  - ***Server Components:*** Enhances server-side rendering by allowing you to build components that run exclusively on the server, reducing the need for client-side JavaScript.
  - ***Concurrent Rendering Improvements:*** Better handling of asynchronous tasks, making UIs more responsive by allowing React to interrupt rendering and continue later when needed.
  - ***Simplified State Management:*** Improvements in the way React handles state, making it more intuitive and reducing the complexity of managing state across components.
- **ShadcnUI Components & Tailwind CSS:** A powerful combination for styling and building UI components. ShadcnUI provides a set of highly customizable and accessible UI components using Tailwind syntax.
- **Axios:** Promise-based HTTP client for making API requests that simplifies the process of handling HTTP requests, supporting features like request and response interception, automatic JSON data transformation, and error handling. 

### 🗄️ Database

- **PostgreSQL:** Relational database management.
- **Redis (Optional):** Caching and session management.

### Main Features

   **Messaging with Socket.IO**
   **Stripe integration for payments**

### 🚢 DevOps

- **Docker:** Containerization.
- **Heroku/DigitalOcean:** Deployment.
- **GitHub Actions:** CI/CD pipeline.

## 🧑‍💻 Development Steps

1. **Project Setup:**
   - Initialize NestJS project.
   - Set up PostgreSQL database.
   - Configure environment variables.

2. **User Authentication:**
   - Implement JWT-based authentication.
   - Set up role-based access control.

3. **User Profile Management:**
   - APIs for profile creation and updates.
   - Implement file upload for profile pictures.

4. **Skill Offering:**
   - Design skill offerings schema.
   - CRUD operations for skill listings.

5. **Booking System:**
   - Implement booking APIs.
   - Calendar integration for scheduling.

6. **Review System:**
   - Design and implement review and rating feature.

7. **Admin Dashboard:**
   - Build admin panel for managing users, skills, and bookings.

8. **Frontend Development:**
   - Build UI with React/Next.js.
   - Integrate with backend API.
   - Implement client-side authentication and state management.

9. **Real-Time Features (Optional):**
   - Implement messaging with Socket.IO.

10. **Payment Integration (Optional):**
    - Integrate Stripe for payments.

11. **Testing & Deployment:**
    - Write unit and integration tests.
    - Set up CI/CD pipelines.
    - Deploy to cloud provider.

## 🎓 Learning Outcomes

- **NestJS:** Building RESTful APIs, managing databases, handling authentication.
- **TypeORM:** Mastering ORM tools for database interactions.
- **Frontend Development:** Building responsive UIs with React/Angular.
- **DevOps:** Containerization, CI/CD, and deployment practices.
- **Advanced Features:** Real-time communication, payment processing.

## 🚀 Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/andrenormanlang/mindsmesh.git
   ```

2. **Install Dependencies:**

   ```bash
   cd skillshare/backend
   npm install
   ```

   ```bash
   cd skillshare/frontend
   npm install
   ```

3. **Set Up Environment Variables:**
   - Create a `.env` file and add your configuration.

   ```typescript
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=mindsmesh
   JWT_SECRET=YourSuperSecretKey
   ```

4. **Create and Access a PostgreSQL Database by CLI:**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   enter password

   # Create your database and access your DB
   CREATE DATABASE mindsmesh;
   \c mindsmesh

   # Create the necessary tables
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       username VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL,
       isAdmin BOOLEAN DEFAULT false,
       role VARCHAR(255) DEFAULT 'user'
   );

   CREATE TABLE skills (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       price NUMERIC(10, 2) NOT NULL,
       isAvailable BOOLEAN DEFAULT true,
       user_id INTEGER REFERENCES users(id)
   );

   ```

5. **Run and access the Application endpoints:**

### Backend

   ```bash
   npm run start:dev
   ```

- Open `http://localhost:3000` in Postman or Insomnia.

### Frontend

   ```bash
   npm run start dev
   ```

- Open `http://localhost:5173` in your browser of choice.

## 🤝 Contributing

Feel free to fork this repository, create a new branch, and submit a pull request with your changes.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
