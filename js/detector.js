export class Detector{
async init(base='./vendor/'){const m=await import(base+'vision_bundle.mjs'),f=await m.FilesetResolver.forVisionTasks(base+'wasm');
const mk=d=>m.ObjectDetector.createFromOptions(f,{baseOptions:{modelAssetPath:base+'efficientdet_lite0.tflite',delegate:d},runningMode:'VIDEO',scoreThreshold:0.2,maxResults:20});
try{this.d=await mk('GPU');this.backend='GPU'}catch{this.d=await mk('CPU');this.backend='CPU (GPU unavailable)'}}
detect(video,ts){const r=this.d.detectForVideo(video,ts);return(r.detections||[]).map(x=>({cls:x.categories?.[0]?.categoryName,conf:x.categories?.[0]?.score,box:{x:x.boundingBox.originX,y:x.boundingBox.originY,w:x.boundingBox.width,h:x.boundingBox.height}}))}}
