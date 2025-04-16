const canvas = document.getElementById('fdmCanvas');
const ctx = canvas.getContext('2d');

const freqSliders = [
  document.getElementById('freq1'),
  document.getElementById('freq2'),
  document.getElementById('freq3')
];

const freqValues = [
  document.getElementById('val1'),
  document.getElementById('val2'),
  document.getElementById('val3')
];

const toggles = [
  document.getElementById('toggle1'),
  document.getElementById('toggle2'),
  document.getElementById('toggle3')
];

const toggleCombined = document.getElementById('toggleCombined');
const toggleSpectrum = document.getElementById('toggleSpectrum');

let time = 0;
const width = canvas.width;
const height = canvas.height;

function draw() {
  ctx.clearRect(0, 0, width, height);

  const step = 2;
  const colors = ['#00f0ff', '#00ff6a', '#ff426a'];

  let combinedY = new Array(width / step).fill(height / 2);
  let combinedSignal = [];

  freqSliders.forEach((slider, idx) => {
    const freq = parseFloat(slider.value);
    freqValues[idx].textContent = `${freq}Hz`;

    if (!toggles[idx].checked) return;

    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      const y = height / 2 + Math.sin((x + time) * freq * 0.01) * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      combinedY[x / step] += Math.sin((x + time) * freq * 0.01) * 15;
    }
    ctx.strokeStyle = colors[idx];
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw combined wave
  if (toggleCombined.checked) {
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      const y = combinedY[x / step];
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      // build signal for spectrum
      let val = 0;
      freqSliders.forEach((slider, idx) => {
        if (toggles[idx].checked) {
          const freq = parseFloat(slider.value);
          val += Math.sin((x + time) * freq * 0.01);
        }
      });
      combinedSignal.push(val);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (toggleSpectrum.checked && toggleCombined.checked) {
    drawSpectrum(combinedSignal);
  } else {
    const specCanvas = document.getElementById('spectrumCanvas');
    const specCtx = specCanvas.getContext('2d');
    specCtx.clearRect(0, 0, specCanvas.width, specCanvas.height);
  }

  time += 2;
  requestAnimationFrame(draw);
}

function dft(signal) {
  const N = signal.length;
  const real = new Array(N).fill(0);
  const imag = new Array(N).fill(0);
  const magnitudes = [];

  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real[k] += signal[n] * Math.cos(angle);
      imag[k] -= signal[n] * Math.sin(angle);
    }
    magnitudes.push(Math.sqrt(real[k] ** 2 + imag[k] ** 2));
  }

  return magnitudes;
}

function drawSpectrum(signal) {
  const canvas = document.getElementById('spectrumCanvas');
  const ctx = canvas.getContext('2d');
  const spectrum = dft(signal);
  const maxMag = Math.max(...spectrum);
  const barWidth = canvas.width / spectrum.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < spectrum.length / 2; i++) {
    const height = (spectrum[i] / maxMag) * canvas.height;
    ctx.fillStyle = `hsl(${i * 6}, 100%, 60%)`;
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
  }
}

draw();
