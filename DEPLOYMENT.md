# BINGO Deployment Guide

This guide provides comprehensive instructions for deploying the BINGO application to various platforms including GitHub Pages, Netlify, Vercel, Docker, AWS, and Heroku.

## Table of Contents

1. [GitHub Pages](#github-pages)
2. [Netlify](#netlify)
3. [Vercel](#vercel)
4. [Docker](#docker)
5. [AWS](#aws)
6. [Heroku](#heroku)

---

## GitHub Pages

GitHub Pages is a free hosting service provided by GitHub, perfect for static sites and single-page applications.

### Prerequisites
- GitHub repository with proper access
- Build output in a deployable format (HTML, CSS, JS)

### Steps

1. **Configure Repository Settings**
   - Navigate to your repository on GitHub
   - Go to Settings → Pages
   - Under "Build and deployment", select:
     - Source: Deploy from a branch
     - Branch: `main` (or your preferred branch)
     - Folder: `/ (root)` or `/docs` (if you built to docs folder)

2. **Build Your Project**
   ```bash
   npm run build
   ```

3. **Deploy Using GitHub Actions (Recommended)**
   
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - name: Install dependencies
           run: npm install
         
         - name: Build
           run: npm run build
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

4. **Access Your Site**
   - Your site will be available at: `https://wcorsini79.github.io/BINGO/`

### Troubleshooting
- Ensure build output is in the correct directory (typically `dist/` or `build/`)
- Check GitHub Actions logs for build errors
- Verify branch protection rules don't block deployments

---

## Netlify

Netlify offers seamless Git-based deployments with automatic builds and SSL certificates.

### Prerequisites
- GitHub account connected to Netlify
- Project repository with build configuration

### Steps

1. **Connect Repository**
   - Go to [Netlify](https://www.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and authorize Netlify
   - Choose your BINGO repository

2. **Configure Build Settings**
   
   Netlify will auto-detect settings, or manually configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (or your build output folder)
   - **Node version**: 18 (set in `.nvmrc` file if needed)

3. **Environment Variables**
   
   If your app requires environment variables:
   - Site settings → Build & deploy → Environment
   - Add your variables (API keys, etc.)

4. **Create netlify.toml (Optional)**
   
   In your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [[headers]]
     for = "/*"
     [headers.values]
       X-Content-Type-Options = "nosniff"
       X-Frame-Options = "DENY"
   ```

5. **Deploy**
   - Push to your connected branch
   - Netlify automatically builds and deploys
   - Your site will be at: `https://[your-site-name].netlify.app`

6. **Custom Domain (Optional)**
   - Site settings → Domain management
   - Add your custom domain
   - Follow DNS configuration steps

### Advanced Features
- **Branch previews**: Deploy preview URLs for pull requests
- **Functions**: Serverless functions support for backend needs
- **Analytics**: Built-in traffic analytics

---

## Vercel

Vercel is optimized for Next.js but works great with any static site or Node.js app.

### Prerequisites
- GitHub account connected to Vercel
- Project repository

### Steps

1. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Authorize Vercel with GitHub

2. **Configure Project Settings**
   
   Vercel usually auto-detects settings:
   - **Framework preset**: Choose appropriate framework or "Other"
   - **Build command**: `npm run build`
   - **Output directory**: `dist` or `.next` (for Next.js)
   - **Install command**: `npm install`

3. **Environment Variables**
   
   Project settings → Environment Variables:
   ```
   DATABASE_URL=your_database_url
   API_KEY=your_api_key
   ```

4. **Create vercel.json (Optional)**
   
   In your project root:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "env": {
       "NODE_ENV": "production"
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=3600"
           }
         ]
       }
     ]
   }
   ```

5. **Deploy**
   - Push to your connected branch
   - Vercel automatically deploys
   - Your site will be at: `https://bingo-[random].vercel.app`

6. **Custom Domain**
   - Settings → Domains
   - Add your custom domain
   - Update DNS records accordingly

### Advantages
- **Edge Network**: Global CDN for faster delivery
- **Serverless Functions**: Built-in backend API support
- **Preview URLs**: Automatic preview deployments for PRs
- **Analytics**: Web Vitals and performance monitoring

---

## Docker

Docker allows you to containerize your application for consistent deployment across environments.

### Prerequisites
- Docker installed locally
- Docker Hub account (optional, for public images)

### Steps

1. **Create Dockerfile**
   
   In your project root:
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   # Runtime stage
   FROM node:18-alpine

   WORKDIR /app

   # Install serve to run static files
   RUN npm install -g serve

   COPY --from=builder /app/dist ./dist

   EXPOSE 3000

   CMD ["serve", "-s", "dist", "-l", "3000"]
   ```

2. **Create .dockerignore**
   
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   .env.local
   dist
   build
   ```

3. **Build Docker Image**
   
   ```bash
   docker build -t bingo:latest .
   ```

4. **Run Container Locally**
   
   ```bash
   docker run -p 3000:3000 bingo:latest
   ```
   
   Access at: `http://localhost:3000`

5. **Push to Docker Hub (Optional)**
   
   ```bash
   # Login to Docker Hub
   docker login
   
   # Tag your image
   docker tag bingo:latest wcorsini79/bingo:latest
   
   # Push image
   docker push wcorsini79/bingo:latest
   ```

6. **Docker Compose (Optional)**
   
   For multi-container setups, create `docker-compose.yml`:
   ```yaml
   version: '3.8'

   services:
     bingo:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       restart: unless-stopped
   ```
   
   Run with: `docker-compose up -d`

### Deployment to Cloud Providers
- Use Docker images with any cloud provider (AWS ECS, Google Cloud Run, etc.)
- Push image to container registry and deploy from there

---

## AWS

Deploy your BINGO application to AWS using S3 + CloudFront for static sites or EC2/ECS for more complex setups.

### Option 1: S3 + CloudFront (Recommended for Static Sites)

#### Prerequisites
- AWS Account
- AWS CLI installed and configured
- IAM user with S3 and CloudFront permissions

#### Steps

1. **Create S3 Bucket**
   
   ```bash
   # Set bucket name (must be globally unique)
   BUCKET_NAME=bingo-wcorsini79
   
   # Create bucket
   aws s3 mb s3://$BUCKET_NAME --region us-east-1
   
   # Enable static website hosting
   aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html
   ```

2. **Configure Bucket Policy**
   
   Create `bucket-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::bingo-wcorsini79/*"
       }
     ]
   }
   ```
   
   Apply policy:
   ```bash
   aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
   ```

3. **Build and Upload to S3**
   
   ```bash
   # Build your project
   npm run build
   
   # Sync to S3
   aws s3 sync dist/ s3://$BUCKET_NAME --delete
   ```

4. **Create CloudFront Distribution**
   
   - Go to AWS CloudFront console
   - Click "Create distribution"
   - Origin domain: `bingo-wcorsini79.s3.amazonaws.com`
   - Viewer protocol policy: "Redirect HTTP to HTTPS"
   - Caching policy: "CachingOptimized"
   - Default root object: `index.html`
   - Create distribution

5. **Setup Continuous Deployment**
   
   Create `.github/workflows/deploy-aws.yml`:
   ```yaml
   name: Deploy to AWS S3 + CloudFront

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - name: Install dependencies
           run: npm install
         
         - name: Build
           run: npm run build
         
         - name: Deploy to S3
           uses: jakejarvis/s3-sync-action@master
           with:
             args: --acl public-read --follow-symlinks --delete
           env:
             AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
             AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             AWS_REGION: 'us-east-1'
             SOURCE_DIR: 'dist'
         
         - name: Invalidate CloudFront
           uses: chetan/invalidate-cloudfront-action@master
           env:
             DISTRIBUTION: ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID }}
             PATHS: '/*'
             AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             AWS_REGION: 'us-east-1'
   ```

### Option 2: AWS Amplify (Easiest for Git-Based Deployments)

1. **Connect Repository**
   - Go to AWS Amplify console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select branch and connect

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Deploy**
   - Amplify automatically builds and deploys
   - Your site will be at: `https://[branch].bingo-[random].amplifyapp.com`

### Option 3: EC2 (For Full Application Control)

1. **Launch EC2 Instance**
   - AMI: Ubuntu 20.04 LTS
   - Instance type: t2.micro (free tier eligible)
   - Configure security groups to allow HTTP/HTTPS

2. **Install Dependencies**
   
   ```bash
   sudo apt update
   sudo apt install nodejs npm -y
   ```

3. **Deploy Application**
   
   ```bash
   git clone https://github.com/wcorsini79/BINGO.git
   cd BINGO
   npm install
   npm run build
   npm install -g pm2
   pm2 start "npm start" --name bingo
   pm2 startup
   pm2 save
   ```

4. **Setup Nginx as Reverse Proxy**
   
   ```bash
   sudo apt install nginx -y
   ```
   
   Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80 default_server;
       server_name _;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Restart: `sudo systemctl restart nginx`

---

## Heroku

Heroku provides an easy Git-based deployment platform with automatic scaling.

### Prerequisites
- Heroku account
- Heroku CLI installed
- GitHub repository

### Steps

1. **Install Heroku CLI**
   
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows/Linux
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   
   ```bash
   heroku create bingo-wcorsini79
   ```

4. **Create Procfile**
   
   In your project root:
   ```
   web: npm start
   ```

5. **Create package.json Scripts**
   
   Ensure your `package.json` has:
   ```json
   {
     "scripts": {
       "build": "your-build-command",
       "start": "your-start-command",
       "dev": "your-dev-command"
     }
   }
   ```

6. **Set Environment Variables**
   
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set API_KEY=your_api_key
   ```

7. **Deploy Using Git Push**
   
   ```bash
   git push heroku main
   ```

8. **Connect GitHub for Automatic Deployments (Recommended)**
   
   - Go to your app on Heroku Dashboard
   - Deploy → Deployment method → GitHub
   - Connect your GitHub account
   - Search for "BINGO" repository
   - Enable automatic deploys
   - Optional: Enable "Wait for CI to pass before deploy"

9. **View Logs**
   
   ```bash
   heroku logs --tail
   ```

10. **Access Your App**
    
    ```bash
    heroku open
    ```
    
    Or visit: `https://bingo-wcorsini79.herokuapp.com`

### Buildpacks Configuration

If needed, add custom buildpacks:

```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

Create `static.json`:
```json
{
  "root": "dist/",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

### Scaling and Monitoring

```bash
# Scale dynos
heroku ps:scale web=2

# Monitor performance
heroku logs
heroku status

# Check dyno type
heroku ps
```

---

## Comparison Table

| Platform | Best For | Cost | Ease | Custom Domain |
|----------|----------|------|------|---------------|
| GitHub Pages | Static sites | Free | Very Easy | Yes |
| Netlify | JAMstack, SPA | Free/Paid | Very Easy | Yes |
| Vercel | Next.js, SSR | Free/Paid | Easy | Yes |
| Docker | Any app | Varies | Moderate | Yes |
| AWS S3+CF | High traffic | $1-20/mo | Moderate | Yes |
| AWS Amplify | Git-based | Free/Paid | Easy | Yes |
| Heroku | Node.js apps | Free/Paid | Easy | Yes |

---

## Best Practices for All Deployments

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate keys regularly

2. **Build Optimization**
   - Minimize bundle size
   - Enable code splitting
   - Use production builds

3. **Performance**
   - Enable gzip compression
   - Use CDN for assets
   - Optimize images
   - Implement caching strategies

4. **Security**
   - Use HTTPS/SSL certificates
   - Set security headers
   - Keep dependencies updated
   - Regular security audits

5. **Monitoring & Logging**
   - Setup error tracking (Sentry, LogRocket)
   - Monitor application performance
   - Setup alerts for critical issues
   - Regular log review

6. **Continuous Deployment**
   - Automate builds and tests
   - Use CI/CD pipelines
   - Require passing tests before merge
   - Deploy from protected branches only

---

## Troubleshooting Common Issues

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are listed in `package.json`
- Review build logs for specific errors
- Clear npm cache: `npm cache clean --force`

### Deployment Failures
- Check platform-specific logs
- Verify environment variables are set
- Ensure build output directory matches configuration
- Check file permissions and ownership

### Runtime Issues
- Monitor application logs
- Check memory and CPU usage
- Verify database connections
- Test API endpoints

### Performance Issues
- Analyze bundle size
- Optimize images and assets
- Enable caching
- Use CDN for static files

---

## Additional Resources

- [Deployment Checklist](https://github.com/wcorsini79/BINGO/wiki/Deployment-Checklist)
- [Performance Guide](https://github.com/wcorsini79/BINGO/wiki/Performance)
- [Security Guidelines](https://github.com/wcorsini79/BINGO/wiki/Security)
- [Monitoring Setup](https://github.com/wcorsini79/BINGO/wiki/Monitoring)

---

For questions or issues, please open an [issue](https://github.com/wcorsini79/BINGO/issues) on GitHub or contact the maintainers.

Last updated: 2025-12-26
