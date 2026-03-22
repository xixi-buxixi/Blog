// 密码加密工具
import CryptoJS from 'crypto-js';

/**
 * 使用 MD5 加密密码
 * @param password 原始密码
 * @returns 加密后的密码（32位小写十六进制字符串）
 */
export const encryptPassword = (password: string): string => {
  return CryptoJS.MD5(password).toString().toLowerCase();
};