import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCategory } from "./validateCategory.js";

test("category validation trims fields and ignores client-supplied routing keys", () => {
  assert.deepEqual(validateCategory({ name: " Herbal Oils ", image: "", offer: " Summer sale ", visible: false, key: "changed" }), {
    name: "Herbal Oils", image: "", offer: "Summer sale", visible: false,
  });
});
test("category validation rejects invalid names, unsafe URLs and invalid offers or visibility", () => {
  const valid = { name: "Oils", image: "https://example.com/oil.png", offer: "", visible: true };
  assert.doesNotThrow(() => validateCategory(valid));
  for (const change of [{ name: "" }, { name: "../Oils" }, { image: "javascript:alert(1)" }, { offer: "x".repeat(121) }, { visible: "false" }]) {
    assert.throws(() => validateCategory({ ...valid, ...change }));
  }
});
