    document.addEventListener('DOMContentLoaded', function() {
      // ตั้งค่าเริ่มต้น: ปิดทุกส่วนยกเว้นส่วนแรก
      const sections = document.querySelectorAll('.section-content');
      const sectionToggles = document.querySelectorAll('.section-toggle');
      
      // เปิดส่วนแรกให้แสดงผล
      if (sections.length > 1) {
        sections[1].classList.add('active');
        sectionToggles[1].classList.add('active');
      }

      // เพิ่มการทำงานเมื่อคลิกที่หัวข้อ
      sectionToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
          const content = this.nextElementSibling;
          const isActive = content.classList.contains('active');
          
          // ปิดทุกส่วนก่อน
          sections.forEach(section => {
            section.classList.remove('active');
          });
          sectionToggles.forEach(t => {
            t.classList.remove('active');
          });
          
          // เปิดเฉพาะส่วนที่คลิก ถ้าปิดอยู่
          if (!isActive) {
            content.classList.add('active');
            this.classList.add('active');
          }
        });
      });
    });

  // PWA Installation Prompt
  let deferredPrompt;
  const installBtn = document.createElement('button');
  installBtn.textContent = 'ติดตั้งแอป';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    display: none;
  `;
  
  document.body.appendChild(installBtn);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    }
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
  });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}