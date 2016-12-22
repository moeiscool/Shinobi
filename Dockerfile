FROM node:argon

# Create app directory
RUN mkdir -p /home/shinobi
WORKDIR /home/shinobi

# Install app dependencies
COPY package.json /home/shinobi/
RUN npm install

# Bundle app source
COPY . /home/shinobi

EXPOSE 80
CMD [ "npm", "start" ]