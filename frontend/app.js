document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('qr-video');
    const resultado = document.getElementById('resultado');
    const iniciarEscaneoBtn = document.getElementById('iniciar-escaneo');
    
    let scanner;
  
    iniciarEscaneoBtn.addEventListener('click', () => {
      video.style.display = 'block';
      iniciarEscaneoBtn.style.display = 'none';
  
      scanner = new Instascan.Scanner({ video });
      scanner.addListener('scan', (clienteId) => {
        resultado.textContent = `Cliente escaneado: ${clienteId}`;
  
        fetch('http://localhost:3000/api/escaneo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clienteId }),
        })
          .then((response) => response.json())
          .then((data) => {
            resultado.textContent += ` - Visitas: ${data.visitas}`;
          })
          .catch((error) => {
            console.error('Error:', error);
            resultado.textContent = 'Error al registrar la visita.';
          });
      });
  
      Instascan.Camera.getCameras()
        .then((cameras) => {
          if (cameras.length > 0) {
            scanner.start(cameras[0]);
          } else {
            resultado.textContent = 'No se encontró ninguna cámara.';
          }
        })
        .catch((error) => {
          console.error(error);
          resultado.textContent = 'Error al acceder a la cámara.';
        });
    });
  });
  