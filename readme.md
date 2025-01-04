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


## Pending Test

3. Test 2. After the user buy ’Subscription’, does it activate immediately (		)

## Known bugs

1. The soketi services doesn't start on startup ( Solved )

## Virtualhost setup for front-end

```
<VirtualHost *:8090>
       ServerName training-day-fe.codecrane.me
       DocumentRoot /var/www/Training-Day-FE/www
       <Directory /var/www/Training-Day-FE>
              AllowOverride All
       </Directory>
RewriteEngine on
RewriteCond %{SERVER_NAME} =training-day-fe.codecrane.me
RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

# Icon attributions
<a href="https://www.flaticon.com/free-stickers/punching-bag" title="punching bag stickers">Punching bag stickers created by vectorsmarket15 - Flaticon</a>


<!-- Kick (not used) -->
<a href="https://www.flaticon.com/free-icons/muay-thai" title="muay thai icons">Muay thai icons created by cube29 - Flaticon</a>

<!-- Icons used -->
<a href="https://www.flaticon.com/free-icons/fight" title="fight icons">Fight icons created by Leremy - Flaticon</a>

<!-- Branch -->
android-iap is the currently published branch
