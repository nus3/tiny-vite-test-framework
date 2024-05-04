import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createServer } from "vite";

// TODO: packages/vite-node/src/client.tsを参考に、モジュールの依存を再帰的に読み込み、runInThisContextで実行できるようにする

// REF: https://ja.vitejs.dev/guide/api-javascript#createserver
// REF: https://github.com/vitest-dev/vitest/tree/main/packages/vite-node#readme

const viteSSRExports = Object.create(null);
// 独自のModuleオブジェクトとして表示するための設定
Object.defineProperty(viteSSRExports, Symbol.toStringTag, {
  value: "Module",
  enumerable: false,
  configurable: false,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const viteSSRImport = (path: string, options: any) => {
  // const key = options.importedNames[0];
  return viteSSRExports;
};

const server = await createServer();

const __dirname = fileURLToPath(new URL("..", import.meta.url));
const result = await server.transformRequest(`${__dirname}test/test1.ts`, {
  ssr: true,
});

const wrappedCode = `(async function (__vite_ssr_exports__, __vite_ssr_import__) {
  ${result?.code};
 })`;

const fn = vm.runInThisContext(wrappedCode);
await fn(viteSSRExports, viteSSRImport);

// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// let depResult1: any;
// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// let depResult2: any;

// if (result?.deps?.length) {
//   depResult1 = await server.transformRequest(`${__dirname}${result?.deps[0]}`, {
//     ssr: true,
//   });

//   if (depResult1?.deps?.length) {
//     depResult2 = await server.transformRequest(
//       `${__dirname}${depResult1?.deps[0]}`,
//       { ssr: true },
//     );
//   }
// }
// console.log(depResult1, depResult2);

// TODO: __vite_ssr_import__と__vite_ssr_exports__を実装する

// やり方
// codeを定義する。引数は__vite_ssr_exports__と__vite_ssr_import__を受け取るような関数にする
// async (__vite_ssr_exports__, __vite_ssr_import__) => {{code}}
// vm.runInThisContextを実行する
// 帰り値の引数には、__vite_ssr_exports__と__vite_ssr_import__を順番に渡す
// const fn = vm.runInThisContext(wrappedCode)
// await fn(__vite_ssr_exports__, __vite_ssr_import__)

// ===============以下未整理メモ===============

// const importModule = async (id: string) => {
//   const result = await server.transformRequest(id, {
//     ssr: true,
//   });

//   const wrappedCode = `(async function (__vite_ssr_exports__, __vite_ssr_import__) {
//     ${result?.code}
//    })`;

//   const wrappedFn = vm.runInNewContext(wrappedCode);

//   return wrappedFn({}, importModule);
// };

// const __dirname = fileURLToPath(new URL("..", import.meta.url));
// await importModule(`${__dirname}/test/test1.ts`);

// resultのdepsがなくなるまでモジュールを再起的に読み込む
// const request = () => {};

// 指定したパスのモジュールをトランスパイルして実行する
// await server.ssrLoadModule(`${__dirname}/test/test1.ts`);

// TODO: __vite_ssr_import__を以下を参考に実装する
// https://github.com/vitest-dev/vitest/blob/df6a432856b1165d1e7c4129ee9f35cc4fa6a365/packages/vite-node/src/client.ts#L270

// TODO: vm.runInThisContextを実行する
// TODO: vm.runInThisContextで取得した関数を実行する
// console.log(result?.code);

// Vitestで実行されてるコード
// contextに格納したものは引数として渡すようにして、関数の内部で、トランスパイルされたコードを実行してる
// REF: https://github.com/vitest-dev/vitest/blob/6b29f3ddc86060cf3265959d4ae32e90b186cb92/packages/vite-node/src/client.ts#L415-L427

// ("use strict");
// async (
//   __vite_ssr_import__,
//   __vite_ssr_dynamic_import__,
//   __vite_ssr_exports__,
//   __vite_ssr_exportAll__,
//   __vite_ssr_import_meta__,
//   require,
//   exports,
//   module,
//   __filename,
//   __dirname,
// ) => {
//   {
//     const context = (() => {
//       if (typeof globalThis !== "undefined") {
//         return globalThis;
//       } else if (typeof self !== "undefined") {
//         return self;
//       } else if (typeof window !== "undefined") {
//         return window;
//       } else {
//         return Function("return this")();
//       }
//     })();
//   }
// };

// vmモジュールを使って、バンドラーを実行するシンプルな例を紹介してる
// REF: https://antfu.me/posts/dev-ssr-on-nuxt#approach-3-vite-node
