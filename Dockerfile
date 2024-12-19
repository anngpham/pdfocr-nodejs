FROM jbarlow83/ocrmypdf

# Install dependencies
RUN apt update && apt install -y \
	tesseract-ocr-eng \
	poppler-utils \
	libcairo2-dev \
	libpango1.0-dev \
	libjpeg-dev \
	libgif-dev \
	librsvg2-dev \
	build-essential \
	curl && \
	# Install Node LTS
	curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
	apt purge nodejs -y && \
	apt install -y nodejs && \
	# Clean up
	apt clean && \
	apt autoremove -y

# Install PM2 globally
RUN npm install -g pm2

# Set working directory
WORKDIR /home

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript files
RUN npm run build

# Create storage directory
RUN mkdir -p storage

# Override entrypoint
ENTRYPOINT ["/usr/bin/env"]

# Start with PM2
CMD ["pm2-runtime", "dist/index.js"]
