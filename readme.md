# Installation Guides


## การใช้ `ng build`
ใช้คำสั่งนี้เพื่อติดตั้ง App บน low-memory เสอร์เวอร์
```
node --max_old_space_size=1096 ./node_modules/@angular/cli/bin/ng.js build
```
