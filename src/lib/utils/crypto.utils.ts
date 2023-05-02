import * as crypto from "crypto";

/** @internal */
export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/** @internal */
export function encryptAES<Input = any>(secret: string, data: Input): string {
  const key = md5(secret);
  let cipher = crypto.createCipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
  let encrypted = cipher.update(JSON.stringify({ value: data }), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/** @internal */
export function decryptAES<Output = any>(secret: string, data: string): Output {
  const key = md5(secret);
  let decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
  let dec = decipher.update(data,'hex','utf8');
  dec += decipher.final('utf8');
  return JSON.parse(dec).value;
}