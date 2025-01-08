document.getElementById('my-form').addEventListener('submit', async function (event) {
  event.preventDefault(); 
  
  const botToken = "7872176509:AAGK3yDh2Ss5NkdYDPwK3aSKxEn7u-2sqE4"; 
  const chatId = "987588843";    

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const text = `New message from CV: \n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

  try {

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });

    if (response.ok) {
      document.getElementById('status-message').innerText = "Message sent successfully!";
      document.getElementById('status-message').classList.add('text-success');
      document.getElementById('my-form').reset();
    } else {
      document.getElementById('status-message').innerText = "Failed to send the message.";
      document.getElementById('status-message').classList.add('text-danger');
    }
  } catch (error) {
    document.getElementById('status-message').innerText = "An error occurred.";
    document.getElementById('status-message').classList.add('text-danger');
    console.error(error);
  }
});
