import { ASCII, Struct } from "@ipheion/moulding-tin";
import { Directory, Schema } from "./mod";
import Fs from "node:fs/promises";

const TEST_DIR = "./test-data";

function Test<T extends Schema>(
  name: string,
  init: T,
  handler: (dir: Directory<T>) => void
) {
  test(name, async () => {
    try {
      await Fs.rmdir(TEST_DIR, { recursive: true });
    } catch {
      // We do not care if the directory does not exist
    }

    const db = new Directory(init, TEST_DIR);

    handler(db);
  });
}

Test(
  "Creates a basic state",
  {
    item_1: new Struct({
      an_item: new ASCII(),
    }),
  },
  (dir) => {
    dir.Write({
      item_1: {
        test_id: {
          an_item: "Hello world",
        },
      },
    });

    expect(dir.Model.item_1.test_id).toEqual({ an_item: "Hello world" });
  }
);

Test(
  "Can iterate over state",
  {
    item_1: new Struct({
      an_item: new ASCII(),
    }),
  },
  (dir) => {
    dir.Write({
      item_1: {
        test_id_1: {
          an_item: "This is the first item",
        },
        test_id_2: {
          an_item: "This is the second item",
        },
        test_id_3: {
          an_item: "This is the third item",
        },
        test_id_4: {
          an_item: "This is the fourth item",
        },
      },
    });

    let i = 0;
    for (const [key, value] of dir.Model.item_1) {
      i++;
      switch (i) {
        case 1:
          expect(key).toEqual("test_id_1");
          expect(value).toEqual({ an_item: "This is the first item" });
          break;
        case 2:
          expect(key).toEqual("test_id_2");
          expect(value).toEqual({ an_item: "This is the second item" });
          break;
        case 3:
          expect(key).toEqual("test_id_3");
          expect(value).toEqual({ an_item: "This is the third item" });
          break;
        case 4:
          expect(key).toEqual("test_id_4");
          expect(value).toEqual({ an_item: "This is the fourth item" });
          break;
      }
    }
  }
);
