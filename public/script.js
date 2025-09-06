// script.js
document.addEventListener('DOMContentLoaded', async () => {
  const flavorMenu = document.getElementById('flavorMenu');
  const display = document.getElementById('display-area');

  // helper: try relative fetch, fallback to localhost:5000
  async function safeFetch(path, options) {
    try {
      const r1 = await fetch(path, options);
      if (r1.ok) return r1;
      throw new Error('relative fetch failed');
    } catch (_) {
      const abs = `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
      return await fetch(abs, options);
    }
  }

  // load flavors
  let flavors = [];
  try {
    const res = await safeFetch('/flavors');
    flavors = await res.json();
  } catch (err) {
    console.error('Failed to load flavors:', err);
    flavors = [];
  }

  // populate flavors menu
  flavors.forEach(flavor => {
    const div = document.createElement('div');
    div.className = 'flavor';
    div.textContent = flavor.name;
    div.dataset.name = flavor.name;
    div.dataset.img = flavor.img;
    div.dataset.price = flavor.price;
    flavorMenu.appendChild(div);

    div.addEventListener('click', () => {
      display.innerHTML = `
        <div class="icecream-card fly-in">
          <div class="img-wrapper">
            <img src="${flavor.img}" alt="${flavor.name}">
            <div class="overlay">
              <p class="price">${flavor.price}</p>
              <button class="order-btn">Order Now</button>
            </div>
          </div>
          <h2>${flavor.name}</h2>
          <p>You're craving for: <strong>${flavor.name}</strong> 🍨</p>
        </div>
      `;

      const orderBtn = document.querySelector('.order-btn');
      orderBtn.addEventListener('click', async () => {
        orderBtn.disabled = true;
        const order = {
          flavor: flavor.name,
          price: flavor.price,
          time: new Date().toISOString(),
          status: "Pending"
        };
        try {
          const res = await safeFetch('/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          });
          const data = await res.json();
          showOrderPopup(data.message || 'Order placed!');
        } catch (err) {
          console.error('Order failed:', err);
          showOrderPopup('Failed to place order. Try again.');
        } finally {
          orderBtn.disabled = false;
        }
      });
    });
  });

  // floating emojis
  const floatingContainer = document.getElementById('floatingIcecreams');
  const floatImgs = ["🍫", "🍦", "🍪", "🍧", "🍨", "🥜", "🍓", "🍒", "🥥", "🍯"];
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.className = 'float-item';
    span.textContent = floatImgs[Math.floor(Math.random() * floatImgs.length)];
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDuration = `${5 + Math.random() * 10}s`;
    floatingContainer.appendChild(span);
  }

  // draggable menu
  const menuWrapper = document.getElementById('menuWrapper');
  let isDragging = false, offsetX = 0, offsetY = 0;
  if (menuWrapper) {
    menuWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - menuWrapper.offsetLeft;
      offsetY = e.clientY - menuWrapper.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        menuWrapper.style.left = `${e.clientX - offsetX}px`;
        menuWrapper.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (!menuWrapper) return;
      menuWrapper.style.display = (menuWrapper.style.display === "none" || !menuWrapper.style.display) ? "block" : "none";
    });
  }
});

// popup
function showOrderPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'popup-box';
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close-popup">&times;</span>
      <h3>${message}</h3>
      <p>Just crave until it's on your doorstep! 🍨</p>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector('.close-popup').addEventListener('click', () => popup.remove());
  setTimeout(() => popup.remove(), 3000);
}
