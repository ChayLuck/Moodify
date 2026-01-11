# Moodify

Moodify: Discover Entertainment That Matches Your Vibe 🎵🎬

![WhatsApp Image 2026-01-11 at 03 05 4722](https://github.com/user-attachments/assets/65578b38-1404-4687-af7e-36511614d917)

🚀 Introduction

Moodify is a personalized, mood-based recommendation platform designed to bridge the gap between human emotions and digital entertainment. Unlike traditional streaming algorithms that rely solely on viewing history or genre matching, Moodify asks the user a simple yet powerful question: "How are you feeling right now?"

By integrating the vast libraries of Spotify and The Movie Database (TMDB), Moodify creates a unique cross-domain experience. Whether you are feeling Happy, Sad, Energetic, Chill, or Romantic, the application curates a synchronized pair of music and movie recommendations tailored specifically to your current emotional state.

To support this interaction, Moodify optionally uses an AI-based mood interpretation feature that helps translate free-text user input into one of the predefined mood categories. This AI component does not replace the recommendation logic; instead, it assists users who prefer expressing their emotions naturally rather than selecting a mood manually.

✨ Key Features

🎭 Mood-Based Engine: Select your mood and get instant, tailored recommendations for both a movie and a song.

🧠 AI-Assisted Mood Interpretation (Supportive Layer): When users describe their feelings in natural language, an AI service analyzes the text and maps it to the closest mood category or requests clarification if the input is ambiguous. This feature exists solely to improve input accuracy and user convenience, while the recommendation algorithm remains rule-based and deterministic.

🎧 Integrated Spotify Player: Listen to recommended tracks directly within the app using the embedded player.

🎥 Movie Trailers: Watch movie trailers instantly via the integrated YouTube player without leaving the site.

🧠 Smart Search & Discovery: Search for any song or movie. The system learns from your favorites to refine future recommendations.

📂 User Profiles: Create an account to save your favorite tracks and movies. Build your personal "Vibe Collection."

📱 Responsive Design: A modern, dark-themed UI built with Tailwind CSS that works seamlessly on desktop and mobile.

📸 Screenshots


![WhatsApp Image 2026-01-11 at 03 05 47](https://github.com/user-attachments/assets/5dd5946f-2d2a-469b-9bb8-d1b7cda84865)

![WhatsApp Image 2026-01-11 at 03 08 11](https://github.com/user-attachments/assets/999e30a3-b4cb-4996-82df-f301a59e8246)

![WhatsApp Image 2026-01-11 at 03 09 16](https://github.com/user-attachments/assets/74b49f1a-9161-469f-8c42-3364727a0e95)

![WhatsApp Image 2026-01-11 at 03 10 02](https://github.com/user-attachments/assets/0e178342-cccf-4506-bc30-987c257f70ba)

![WhatsApp Image 2026-01-11 at 03 10 50](https://github.com/user-attachments/assets/7a918d0f-5a8c-455a-a658-4331ddff86a3)

![WhatsApp Image 2026-01-11 at 03 11 27](https://github.com/user-attachments/assets/8d809f80-bc36-4ad9-a5be-1c48c8317301)



🛠️ Tech Stack

Moodify is built using the MERN Stack:

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js 

Database: MongoDB

APIs: Spotify Web API, TMDB API.

Authentication: JWT (JSON Web Tokens).

/////////////////////////////////////////////////////////////////////////////////////////

⚙️ Installation & Setup

Follow these steps to run Moodify locally on your machine.

Prerequisites

Node.js (v14 or higher)

MongoDB Atlas Account (or local MongoDB)

Spotify Developer Account (Client ID & Secret)

TMDB API Key

1. Clone the Repository

git clone [https://github.com/YourUsername/Moodify.git](https://github.com/YourUsername/Moodify.git)
cd Moodify


2. Backend Setup

Navigate to the server folder and install dependencies:

cd server
npm install


Create a .env file in the server directory and add your API keys:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

//Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback

//TMDB API
TMDB_API_KEY=your_tmdb_api_key


Start the backend server:

npx nodemon index.js


(You should see "Server running on port 5000" and "MongoDB Connected")

/////////////////////////////////////////////////////////////////////////////////////////

3. Frontend Setup

Open a new terminal, navigate to the client folder, and install dependencies:

cd client
npm install


Start the React application:

npm start


(The app should open at http://localhost:3000)

/////////////////////////////////////////////////////////////////////////////////////////

🧠 How the Algorithm Works

User Input: The user selects a mood (e.g., "Sad").

Contextual Search:

The system checks the user's Favorite Tracks.

If a favorite song matches the "Sad" mood, the algorithm uses that artist as a seed to find similar sad songs.

If no favorites exist, it performs a smart search using keywords like "Sad songs", "Melancholy", "Acoustic".

Filtering: Results are sorted by popularity to ensure high-quality recommendations.

Pairing: A movie with a matching genre (e.g., Drama for "Sad") is fetched from TMDB to complete the experience.

/////////////////////////////////////////////////////////////////////////////////////////

🤝 Contributing

Contributions are welcome! If you have suggestions or bug fixes:

Fork the repository.

Create a new branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

/////////////////////////////////////////////////////////////////////////////////////////

📄 License

This project is open-source and available under the MIT License.

Contact

Project Link: https://github.com/ChayLuck/Moodify
