/**
 * Generate QR code data URL for room joining
 */
export function generateQRCodeDataURL(roomCode: string, baseUrl: string = ""): string {
  // Using a simple QR code API (you can replace with a library like qrcode.react)
  const url = `${baseUrl || window.location.origin}/join/${roomCode}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  return qrApiUrl;
}

/**
 * Generate room join URL
 */
export function generateRoomJoinURL(roomCode: string, baseUrl: string = ""): string {
  return `${baseUrl || window.location.origin}/join/${roomCode}`;
}

