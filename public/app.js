const promptInput = document.getElementById('promptInput');
const tempInput = document.getElementById('temp');
const topPInput = document.getElementById('topP');
const maxTokensInput = document.getElementById('maxTokens');
const tempVal = document.getElementById('tempVal');
const topPVal = document.getElementById('topPVal');
const tempMini = document.getElementById('tempMini');
const tokensMini = document.getElementById('tokensMini');
const topPMini = document.getElementById('topPMini');
const statusBadge = document.getElementById('statusBadge');
const statusBadgeRight = document.getElementById('statusBadgeRight');
const textOutput = document.getElementById('textOutput');
const jsonOutput = document.getElementById('jsonOutput');
const historyList = document.getElementById('historyList');

const setStatus = (label, type = 'neutral') => {
  const badge = statusBadgeRight;
  badge.className = `chip ${type}`;
  badge.textContent = label;
  statusBadge.className = `chip ${type}`;
  statusBadge.textContent = label;
};

const updateReadouts = () => {
  tempVal.textContent = tempInput.value;
  topPVal.textContent = topPInput.value;
  tempMini.textContent = tempInput.value;
  tokensMini.textContent = maxTokensInput.value;
  topPMini.textContent = topPInput.value;
};

const renderHistory = () => {
  const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
  historyList.innerHTML = '';
  history.forEach((item) => {
    const li = document.createElement('li');
    const text = item.length > 45 ? item.slice(0, 45) + '...' : item;
    li.textContent = text;
    li.onclick = () => {
      promptInput.value = item;
      promptInput.focus();
    };
    historyList.appendChild(li);
  });
};

tempInput.addEventListener('input', updateReadouts);
topPInput.addEventListener('input', updateReadouts);
maxTokensInput.addEventListener('input', updateReadouts);

document.getElementById('clearBtn').addEventListener('click', () => {
  promptInput.value = '';
  textOutput.textContent = 'Your AI response will appear here.';
  jsonOutput.textContent = '{}';
  setStatus('Ready');
});

document.getElementById('runBtn').addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    setStatus('Enter a prompt', 'error');
    textOutput.textContent = 'Please enter a prompt before running the model.';
    return;
  }

  setStatus('Generating...', 'neutral');
  textOutput.textContent = 'Thinking...';
  jsonOutput.textContent = 'Loading response...';

  const payload = {
    prompt,
    temperature: parseFloat(tempInput.value),
    maxTokens: parseInt(maxTokensInput.value, 10),
    topP: parseFloat(topPInput.value)
  };

  const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
  const nextHistory = [prompt, ...history.filter((item) => item !== prompt)].slice(0, 6);
  localStorage.setItem('promptHistory', JSON.stringify(nextHistory));
  renderHistory();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'The request failed.');
    }

    textOutput.textContent = data.response || 'No response returned.';
    jsonOutput.textContent = JSON.stringify(data, null, 2);
    setStatus('Completed', 'success');
  } catch (error) {
    textOutput.textContent = 'Unable to generate a response right now.';
    jsonOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
    setStatus('Failed', 'error');
  }
});

window.addEventListener('load', () => {
  updateReadouts();
  renderHistory();
});
