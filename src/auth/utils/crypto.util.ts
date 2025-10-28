// src/utils/crypto.util.ts
import * as bcrypt from 'bcrypt';

const cryptoUtils = {
  hashPlainText: async (plainText: string) => bcrypt.hash(plainText, 10),
  compareWithHash: async (plainText: string, hashedText: string) =>
    bcrypt.compare(plainText, hashedText),
};

export default cryptoUtils;