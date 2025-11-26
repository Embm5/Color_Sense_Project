
// Color Sense - frontend demo
const adaptBtn = document.getElementById('adaptBtn');
const output = document.getElementById('output');
const bars = Array.from(document.querySelectorAll('.bar'));
const daltonSelect = document.getElementById('daltonType');

function collectElements() {
  return bars.map(b => ({
    '@type': 'VisualElement',
    id: b.dataset.label.toLowerCase(),
    label: b.dataset.label,
    originalColor: b.dataset.color
  }));
}

function applyAdaptations(adaptedElements) {
  adaptedElements.forEach(a => {
    const el = bars.find(b => (b.dataset.label.toLowerCase() === (a.id || '').toLowerCase()));
    if (!el) return;
    // apply adapted color (if different)
    if (a.adaptedColor && a.adaptedColor !== a.originalColor) {
      el.style.backgroundColor = a.adaptedColor;
      // add textual hint for accessibility
      el.setAttribute('aria-label', (el.dataset.label + ' - adaptado'));
      el.title = a.description || 'Adaptado';
    }
  });
}

adaptBtn.addEventListener('click', async () => {
  const profile = {
    userId: 'demo',
    daltonismType: daltonSelect.value,
    preferences: { contrastLevel: 'high' }
  };
  const elements = collectElements();
  const payload = {
    '@context': 'http://schema.org',
    url: window.location.href,
    userProfile: profile,
    elements: elements
  };

  output.textContent = 'Cargando...';
  try {
    const res = await fetch('http://localhost:3000/api/adapt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
    applyAdaptations(data.adaptedElements || []);
  } catch (err) {
    output.textContent = 'Error: ' + err.message + '\n\n' + JSON.stringify(payload, null, 2);
  }
});
