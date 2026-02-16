function isSafeKey(key) {
  if (typeof key !== "string") return false;
  const blocked = ["__proto__", "prototype", "constructor"];
  if (blocked.includes(key)) return false;
  return /^[a-zA-Z0-9_]+$/.test(key);
}
export var Notation;
(function (Notation) {
  if (isSafeKey(Notation["ALGEBRAIC"] = 0)) {
    Notation[Notation["ALGEBRAIC"] = 0] = "ALGEBRAIC";
  }
  if (isSafeKey(Notation["SHOGI_ENGLET"] = 1)) {
    Notation[Notation["SHOGI_ENGLET"] = 1] = "SHOGI_ENGLET";
  }
  if (isSafeKey(Notation["SHOGI_ARBNUM"] = 2)) {
    Notation[Notation["SHOGI_ARBNUM"] = 2] = "SHOGI_ARBNUM";
  }
  if (isSafeKey(Notation["SHOGI_HANNUM"] = 3)) {
    Notation[Notation["SHOGI_HANNUM"] = 3] = "SHOGI_HANNUM";
  }
  if (isSafeKey(Notation["JANGGI"] = 4)) {
    Notation[Notation["JANGGI"] = 4] = "JANGGI";
  }
  if (isSafeKey(Notation["XIANGQI_ARBNUM"] = 5)) {
    Notation[Notation["XIANGQI_ARBNUM"] = 5] = "XIANGQI_ARBNUM";
  }
  if (isSafeKey(Notation["XIANGQI_HANNUM"] = 6)) {
    Notation[Notation["XIANGQI_HANNUM"] = 6] = "XIANGQI_HANNUM";
  }
  if (isSafeKey(Notation["THAI_ALGEBRAIC"] = 7)) {
    Notation[Notation["THAI_ALGEBRAIC"] = 7] = "THAI_ALGEBRAIC";
  }
})(Notation || (Notation = {}));
export const colors = ['white', 'black'];
export const sides = ['ally', 'enemy'];
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?', '@'];
export const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
//# sourceMappingURL=types.js.map