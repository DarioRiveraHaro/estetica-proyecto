document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('qr-video');
  const resultado = document.getElementById('resultado');
  const iniciarEscaneoBtn = document.getElementById('iniciar-escaneo');

  iniciarEscaneoBtn.addEventListener('click', () => {
    // Mostrar el video y ocultar el botón
    video.style.display = 'block';
    iniciarEscaneoBtn.style.display = 'none';

    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(scanQR); // Iniciar el escaneo
      })
      .catch(err => {
        console.error('Error al acceder a la cámara:', err);
        resultado.textContent = 'Error al acceder a la cámara.';
      });

    function scanQR() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Crear un canvas para procesar el video
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');

        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obtener los datos de la imagen
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Escanear el código QR usando jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // Si se detecta un código QR, mostrar el resultado
          resultado.textContent = `Código QR escaneado: ${code.data}`;

          // Enviar el ID del cliente al backend
          fetch('http://localhost:3000/api/escaneo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clienteId: code.data }),
          })
            .then((response) => response.json())
            .then((data) => {
              resultado.textContent += ` - Visitas: ${data.visitas}`;
            })
            .catch((error) => {
              console.error('Error:', error);
              resultado.textContent = 'Error al registrar la visita.';
            });
        } else {
          // Si no se detecta un código QR, seguir escaneando
          resultado.textContent = 'Escaneando...';
        }
      }

      // Continuar escaneando en el siguiente frame
      requestAnimationFrame(scanQR);
    }
  });
});