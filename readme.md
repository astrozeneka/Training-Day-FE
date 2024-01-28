# Installation Guides


## การใช้ `ng build`
ใช้คำสั่งนี้เพื่อติดตั้ง App บน low-memory เสอร์เวอร์
```shell
node --max_old_space_size=3000 ./node_modules/@angular/cli/bin/ng.js build --configuration=production

cat <<EOF > "www/.htaccess"
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} -s [OR]
RewriteCond %{REQUEST_FILENAME} -l [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [NC,L]

RewriteRule ^(.*) /index.html [NC,L]
EOF

```
