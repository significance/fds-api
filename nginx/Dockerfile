FROM nginx:alpine


WORKDIR "/root"

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf

ADD ./certbot/options-ssl-nginx.conf /etc/letsencrypt/options-ssl-nginx.conf
ADD ./certbot/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem
ADD ./start-nginx.sh  ./start-nginx.sh

EXPOSE 80 443 8500
CMD exec ./start-nginx.sh


