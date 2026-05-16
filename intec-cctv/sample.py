import cv2

# Initialize the camera (0 is usually the default webcam)
cam = cv2.VideoCapture(0)

print("Press 's' to save the image or 'q' to quit.")

while True:
    # Capture frame-by-frame
    ret, frame = cam.read()
    
    if not ret:
        print("Error: Could not read from camera.")
        break

    # Display the resulting frame
    cv2.imshow('Camera Feed', frame)

    # Wait for key press
    key = cv2.waitKey(1) & 0xFF

    if key == ord('s'):
        # Save the captured image to disk
        cv2.imwrite('captured_image.png', frame)
        print("Image saved as 'captured_image.png'!")
    
    elif key == ord('q'):
        # Exit the loop
        break

# Release the camera and close windows
cam.release()
cv2.destroyAllWindows()
