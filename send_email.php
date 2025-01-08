<?php

function sendEmail($to, $subject, $message, $from) {
    // Gmail SMTP server configuration
    $smtpHost = "smtp.gmail.com";
    $smtpPort = 587;
    $username = "your_email@gmail.com";  // Your Gmail address
    $password = "your_password";        // Your Gmail password or app-specific password

    // Open socket connection to Gmail's SMTP server
    $socket = fsockopen($smtpHost, $smtpPort, $errno, $errstr, 10);
    if (!$socket) {
        return "Error: Could not connect to the SMTP server - $errstr ($errno)";
    }

    // Read the server's response
    fgets($socket, 512);

    // Send EHLO command to the server
    fwrite($socket, "EHLO " . gethostname() . "\r\n");
    fgets($socket, 512);

    // Start TLS encryption
    fwrite($socket, "STARTTLS\r\n");
    fgets($socket, 512);

    // Enable TLS encryption
    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

    // Re-send EHLO command after TLS is established
    fwrite($socket, "EHLO " . gethostname() . "\r\n");
    fgets($socket, 512);

    // Authenticate using AUTH LOGIN
    fwrite($socket, "AUTH LOGIN\r\n");
    fgets($socket, 512);

    // Send base64 encoded username and password
    fwrite($socket, base64_encode($username) . "\r\n");
    fgets($socket, 512);
    fwrite($socket, base64_encode($password) . "\r\n");
    fgets($socket, 512);

    // Specify the sender email address
    fwrite($socket, "MAIL FROM:<$from>\r\n");
    fgets($socket, 512);

    // Specify the recipient email address
    fwrite($socket, "RCPT TO:<$to>\r\n");
    fgets($socket, 512);

    // Send the DATA command to begin the message body
    fwrite($socket, "DATA\r\n");
    fgets($socket, 512);

    // Send the email headers and body
    $headers = "From: $from\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "\r\n";
    fwrite($socket, $headers . $message . "\r\n.\r\n");
    fgets($socket, 512);

    // Close the connection
    fwrite($socket, "QUIT\r\n");
    fclose($socket);

    return "Email sent successfully!";
}

// Example usage
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $to = htmlspecialchars(trim($_POST['email']));
    $subject = "Contact Form Submission";
    $message = htmlspecialchars(trim($_POST['message']));
    $from = "liviucojcoaru@gmail.com"; // Use your Gmail address here

    $result = sendEmail($to, $subject, $message, $from);
    echo $result;
} else {
    echo "Invalid request.";
}
?>
