import QRCode from 'qrcode';
async function run() {
  const url = await QRCode.toDataURL('test', { margin: 1 });
  console.log(url.slice(0, 30));
}
run();
