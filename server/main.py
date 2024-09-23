from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.spatial import distance as dist
from imutils import face_utils
import numpy as np
import dlib
import cv2
import tensorflow as tf

app = Flask(__name__)
CORS(app)


def eye_aspect_ratio(eye):
	A = dist.euclidean(eye[1], eye[5])
	B = dist.euclidean(eye[2], eye[4])
	C = dist.euclidean(eye[0], eye[3])
	ear = (A + B) / (2.0 * C)
	return ear


def mouth_aspect_ratio(mou):
	X = dist.euclidean(mou[0], mou[6])
	Y1 = dist.euclidean(mou[2], mou[10])
	Y2 = dist.euclidean(mou[4], mou[8])
	Y = (Y1 + Y2) / 2.0
	mar = Y / X
	return mar


EYE_AR_THRESH = 0.15
MOU_AR_THRESH = 0.85

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
(mStart, mEnd) = face_utils.FACIAL_LANDMARKS_IDXS["mouth"]

model = tf.keras.models.load_model('drowsiness_detection_model.h5')

def predict_drowsiness(face_image):
    face_image = cv2.resize(face_image, (150, 150))  # Resize to 150x150 as done during training
    face_image = face_image.astype('float32') / 255.0  # Normalization
    face_image = np.expand_dims(face_image, axis=0)  # Add dimension for the batch
    prediction = model.predict(face_image)
    return prediction[0][0] > 0.5  # If the predicted value is greater than 0.5, consider the face drowsy

@app.route('/detect', methods=['POST'])
def detect():
	file = request.files['image'].read()
	npimg = np.frombuffer(file, np.uint8)
	frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

	rects = detector(gray, 0)
	drowsy = False
	yawn = False

	for rect in rects:
		shape = predictor(gray, rect)
		shape = face_utils.shape_to_np(shape)

		leftEye = shape[lStart:lEnd]
		rightEye = shape[rStart:rEnd]
		mouth = shape[mStart:mEnd]
		leftEAR = eye_aspect_ratio(leftEye)
		rightEAR = eye_aspect_ratio(rightEye)
		mouEAR = mouth_aspect_ratio(mouth)

		ear = (leftEAR + rightEAR) / 2.0

		if ear < EYE_AR_THRESH:
			drowsy = True

		if mouEAR > MOU_AR_THRESH:
			yawn = True

		# Cutting the facial area
		(x, y, w, h) = (rect.left(), rect.top(), rect.width(), rect.height())
		face_image = frame[y:y + h, x:x + w]

		# Prediction if the driver is drowsy by the model
		if predict_drowsiness(face_image):
			drowsy = True

	return jsonify({'drowsy': drowsy, 'yawn': yawn})


if __name__ == '__main__':
	app.run(debug=True)
