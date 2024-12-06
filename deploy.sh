rm -r dist/

npm run build

scp -r dist/* root@188.245.102.242:/var/www/autostatus_web