import{mkdirSync,writeFileSync}from'fs';
const V='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/';
const F=[[V+'vision_bundle.mjs','vendor/vision_bundle.mjs'],[V+'wasm/vision_wasm_internal.js','vendor/wasm/vision_wasm_internal.js'],[V+'wasm/vision_wasm_internal.wasm','vendor/wasm/vision_wasm_internal.wasm'],[V+'wasm/vision_wasm_nosimd_internal.js','vendor/wasm/vision_wasm_nosimd_internal.js'],[V+'wasm/vision_wasm_nosimd_internal.wasm','vendor/wasm/vision_wasm_nosimd_internal.wasm'],['https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite','vendor/efficientdet_lite0.tflite']];
mkdirSync('vendor/wasm',{recursive:true});
for(const[u,p]of F){const r=await fetch(u);if(!r.ok)throw new Error(u+' '+r.status);writeFileSync(p,Buffer.from(await r.arrayBuffer()));console.log('ok',p)}
