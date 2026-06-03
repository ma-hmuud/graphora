import Hashids from "hashids";

const salt = process.env.HASHIDS_SALT || "graphora-super-secret-salt";
const minLength = 32; // "as long as possible" - 32 is a good length

const hashids = new Hashids(salt, minLength);

export const encodeId = (id: number): string => {
  return hashids.encode(id);
};

export const decodeId = (hash: string): number => {
  const decoded = hashids.decode(hash);
  if (decoded.length === 0) {
    throw new Error("Invalid ID");
  }
  return decoded[0] as number;
};
