FROM node:16.14-slim
WORKDIR /usr/app
RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates procps libxss1 \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt install -y qpdf \
     && apt-get install -y google-chrome-stable \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh

COPY ./src/fonts/. ./
RUN mkdir -p /usr/share/fonts/truetype/
RUN install -m644 DilleniaUPC-Bold.ttf /usr/share/fonts/truetype/
RUN install -m644 DilleniaUPC.ttf /usr/share/fonts/truetype/
RUN install -m644 kredit-back.ttf /usr/share/fonts/truetype/
RUN install -m644 kredit-front.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Black.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Bold.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-ExtraBold.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-ExtraLight.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Light.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Medium.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Regular.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-SemiBold.ttf /usr/share/fonts/truetype/
RUN install -m644 NotoSansThai-Thin.ttf /usr/share/fonts/truetype/
COPY package.json .
RUN npm install --quiet
RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium
COPY . .