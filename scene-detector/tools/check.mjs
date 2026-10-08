import{readdirSync}from'fs';import{execSync}from'child_process';for(const f of readdirSync('js'))execSync('node --check js/'+f,{stdio:'inherit'});console.log('syntax ok')
