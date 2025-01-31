document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('qr-video');
  const resultado = document.getElementById('resultado');
  const iniciarEscaneoBtn = document.getElementById('iniciar-escaneo');
  const formGenerarQR = document.getElementById('form-generar-qr');
  const qrCodeContainer = document.getElementById('qr-code');
  const descargarQRBtn = document.getElementById('descargar-qr');
  const reiniciarEscaneoBtn = document.getElementById('reiniciar-escaneo');
  let scanning = false;

  // Escanear códigos QR
  iniciarEscaneoBtn.addEventListener('click', () => {
    video.style.display = 'block';
    iniciarEscaneoBtn.style.display = 'none';
    reiniciarEscaneoBtn.style.display = 'none';

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        scanning = true;
        requestAnimationFrame(scanQR);
      })
      .catch(err => {
        console.error('Error al acceder a la cámara:', err);
        resultado.textContent = 'Error al acceder a la cámara.';
      });

    function scanQR() {
      if (!scanning) return; // Detener el bucle si scanning es false

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resultado.textContent = `Código QR escaneado: ${code.data}`;

          // Mostrar el contenido del QR en un nuevo elemento
          const qrContentElement = document.getElementById('qr-content');
          qrContentElement.textContent = `Contenido del QR: ${code.data}`;

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

          // Detener el escaneo
          scanning = false;
          video.srcObject.getTracks().forEach(track => track.stop()); // Detener la cámara
          video.style.display = 'none'; // Ocultar el video
          reiniciarEscaneoBtn.style.display = 'block'; // Mostrar el botón de reinicio
          return; // Salir de la función para evitar que continúe el bucle
        } else {
          resultado.textContent = 'Escaneando...';
        }
      }

      // Continuar el bucle de escaneo
      requestAnimationFrame(scanQR);
    }
  });

  // Reiniciar el escaneo
  reiniciarEscaneoBtn.addEventListener('click', () => {
    scanning = true;
    video.style.display = 'block';
    reiniciarEscaneoBtn.style.display = 'none';
    iniciarEscaneoBtn.style.display = 'none';
    resultado.textContent = 'Escaneando...';

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(scanQR);
      })
      .catch(err => {
        console.error('Error al acceder a la cámara:', err);
        resultado.textContent = 'Error al acceder a la cámara.';
      });
  });

  // Generar códigos QR
  formGenerarQR.addEventListener('submit', (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe

    const textoQR = document.getElementById('texto-qr').value;

    // Limpiar el contenedor del código QR
    qrCodeContainer.innerHTML = '';

    // Generar el código QR
    new QRCode(qrCodeContainer, {
      text: textoQR,
      width: 200,
      height: 200,
    });

    // Mostrar el botón de descarga
    descargarQRBtn.style.display = 'block';

    // Configurar el botón de descarga
    descargarQRBtn.onclick = () => {
      const qrImage = qrCodeContainer.querySelector('img');
      if (qrImage) {
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = `codigo-qr-${textoQR}.png`;
        link.click();
      }
    };
  });
});