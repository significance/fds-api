#$/bin/bash

echo "Starting nginx `date`"
/usr/sbin/nginx -g "daemon off;" &
while : 
do 
   echo "Sleeping for 6 hours"
   sleep 6h
   echo "Reloading nginx"
   nginx -s reload
done  
