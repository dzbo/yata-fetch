"use strict";function c(t,i){let e;switch(t){case"red":e="\x1B[31m";break;case"green":e="\x1B[32m";break;case"yellow":e="\x1B[33m";break;default:e="\x1B[37m"}return console.log(`${e}%s\x1B[0m`,i)}const y=require("https"),m=require("path"),l=require("fs"),f={config:null,defaultConfigPath:"./yata.json",configPath:"",token:"",project:"",locales:[],format:"yml",root:!1,outputPath:"translations",stripEmpty:!1,apiHost:"",getConfigPath(t){return t?this.configPath=t:this.configPath=this.defaultConfigPath,this.configPath},validateConfig(t,i,e,n,h,s,a){if(t)this.token=t;else throw new Error("No `token` in ENV");if(i)this.project=i;else throw new Error("No `project` in config file");if(!Array.isArray(e)||e.length===0)throw new Error("No `locales` in config file");return this.locales=e,n&&typeof n=="string"&&(this.format=n),h&&typeof h=="boolean"&&(this.root=h),s&&typeof s=="string"&&(this.outputPath=s),a&&typeof a=="boolean"&&(this.stripEmpty=a),!0},normalizeLocale(t){if(!t)return;const i=t.replace("-","_").split("_"),e=[];return e.push(i[0].toLowerCase()),i[1]&&e.push(i[1].toUpperCase()),e.join("_")},downloadTranslation(t){const i=this.normalizeLocale(t);if(!i)throw new Error("No locale passed to download function");l.existsSync(this.outputPath)||l.mkdirSync(this.outputPath);const e=`${i}.${this.format}`,n=m.join(process.cwd(),`${this.outputPath}/${e}`),h=`${this.apiHost}/api/v1/project/${this.project}/${t}/${this.format}?apiToken=${this.token}&root=${this.root}&strip_empty=${this.stripEmpty}`;let s;l.existsSync(n)&&(s=l.readFileSync(n));const a=l.createWriteStream(n);return new Promise((g,u)=>{y.get(h,r=>{const{statusCode:p}=r;if(p!==200)return u(`Request Failed.
Status Code: ${p}`);r.pipe(a),a.on("finish",()=>{const d=l.readFileSync(n);s&&s.equals(d)?c("yellow",`Generating "${t}" translation. Skipped.`):c("green",`Generating "${t}" translation. Done.`),g(!0)})}).on("error",r=>{r instanceof Error?c("red",r.message):typeof r=="string"&&c("red",r)})})}},o=require("nconf");async function w(){o.argv(),o.env(),o.file({file:f.getConfigPath(o.get("config"))}),f.apiHost=o.get("YATA_API_HOST")||"https://api.yatapp.net";try{if(f.validateConfig(o.get(o.get("token")),o.get("project"),o.get("locales"),o.get("format"),o.get("root"),o.get("outputPath"),o.get("strip_empty")))if(o.get("locale"))await f.downloadTranslation(o.get("locale"));else for(const t of f.locales)await f.downloadTranslation(t)}catch(t){t instanceof Error?c("red",t.message):typeof t=="string"&&c("red",t)}}module.exports=w;
