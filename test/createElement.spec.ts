import { createElement } from "@/core/React";
import { describe, expect } from "vitest";

describe("createElement", (it) => {
  it("should return a vdom for ele", () => {
    const el = createElement("div", { id: "app" }, "hello world")
    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hello world",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `)
    // expect(el).toEqual({
    //   type: "div",
    //   props: {
    //     id: "app",
    //     children: [{
    //       type: "TEXT_ELEMENT",
    //       props: {
    //         nodeValue: "hello world",
    //         children: []
    //       }
    //     }]
    //   }
    // })
  })

  // 通过机器保存生成快照
  it("should return a vdom for ele", () => {
    const el = createElement("div", { id: "id" }, "hello world")
    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hello world",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "id",
        },
        "type": "div",
      }
    `)
  })
})