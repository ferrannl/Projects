/* Elegant Barbers – basisinteractie */

// Mobiele navigatie togglen
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Dynamisch jaartal in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll voor interne links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length > 1 && document.querySelector(id)) {
    e.preventDefault();
    document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  }
});

// Eenvoudige client-side validatie en “fake” submit voor het boekingsformulier
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  const statusEl = document.getElementById('form-status');

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // HTML5 check
    if (!bookingForm.checkValidity()) {
      statusEl.textContent = 'Controleer de verplichte velden.';
      statusEl.className = 'form-status error';
      bookingForm.reportValidity();
      return;
    }

    // “Versturen” simuleren (hier kun je later je echte endpoint koppelen)
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      // Demo: wacht even zodat het “echt” voelt
      await new Promise((r) => setTimeout(r, 600));

      // Toon bevestiging
      statusEl.textContent =
        'Bedankt! We hebben je aanvraag ontvangen. We nemen snel contact op om te bevestigen.';
      statusEl.className = 'form-status success';

      // WhatsApp deeplink klaarzetten (optioneel)
      const message = encodeURIComponent(
        `Hallo Elegant Barbers, ik wil graag boeken:\n` +
        `Naam: ${payload.name}\n` +
        `Telefoon: ${payload.phone}\n` +
        `Datum/Tijd: ${payload.date} ${payload.time}\n` +
        `Dienst: ${payload.service}\n` +
        `Opmerking: ${payload.message || "-"}`
      );
      const waLink = `https://wa.me/31731234567?text=${message}`;
      statusEl.insertAdjacentHTML(
        'beforeend',
        ` <a class="btn btn-outline" style="margin-left:8px" href="${waLink}" target="_blank" rel="noopener">Bevestig via WhatsApp</a>`
      );

      bookingForm.reset();
    } catch (err) {
      statusEl.textContent =
        'Er ging iets mis. Probeer het opnieuw of neem telefonisch contact op.';
      statusEl.className = 'form-status error';
    }
  });
}
