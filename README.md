# Driver Drowsiness Detection Simulation

This project demonstrates AI-based real-time driver drowsiness detection using a simulation. It consists of two main parts:
- **Frontend (React)**: A simulation that shows a pre-recorded road video to mimic a driving scenario. The driver's face is captured via the computer's webcam and sent to the backend for analysis.
- **Backend (Flask)**: Processes the webcam images using a pre-trained AI model to detect
 
## How to Run

1. **Run the server:**
    - Navigate to the `/server` folder and run `python app.py`.
    - Make sure the Flask server is running to process incoming API requests.

2. **Run the client:**
    - Navigate to the `/client` folder and run `npm start` (or `yarn start`).
    - This will start the React application, which simulates a driving environment and uses the webcam to capture the driver’s face.

## Usage
- The client displays a road simulation video and captures the driver's face using the computer's webcam.
- The captured frames are sent to the Flask backend, which processes them using an AI model to detect drowsiness or yawning in real-time.
