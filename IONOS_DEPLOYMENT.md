# VPS Deployment Guide (Ionos & Other Providers)

This guide walks you through deploying the Cosplay Shoot Manager on any VPS (Virtual Private Server) using Docker. While focused on Ionos, these instructions work for most VPS providers including DigitalOcean, Linode, Vultr, AWS EC2, etc.

## 🚀 Quick VPS Deployment

For the fastest deployment on any VPS:

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Install Git if not present
dnf install -y git  # Rocky Linux/CentOS
# apt update && apt install -y git  # Ubuntu/Debian

# Create and navigate to app directory  
mkdir -p /opt/cosplay-shoot-manager && cd /opt/cosplay-shoot-manager

# Clone from GitHub
git clone https://github.com/Thaumonaut/cosplay-shoot-manager.git .

# Create environment file
nano .env
# Add your Supabase credentials (see Step 2 below)

# Deploy
docker compose up -d
```

## 📋 VPS Provider Compatibility

This guide works with:
- **Ionos VPS** (Primary focus)
- **DigitalOcean Droplets**
- **Linode VPS**
- **Vultr Cloud Compute**
- **AWS EC2** (with modifications)
- **Google Cloud Compute Engine**
- **Azure Virtual Machines**
- **Hetzner Cloud**
- **OVH VPS**

# Create environment file
nano .env
# Add your Supabase credentials (see Step 2 below)

# Deploy
docker compose up -d
```

## Prerequisites

### VPS Requirements
- **OS**: Rocky Linux 9, CentOS 8+, Ubuntu 20.04+, or Debian 11+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 20GB+ available space
- **CPU**: 1 vCPU minimum (2+ recommended)
- **Network**: Public IP address

### Access Requirements
- Root or sudo access to your VPS
- SSH access configured
- Domain name pointing to your VPS (optional but recommended for SSL)

### VPS Provider-Specific Notes

#### Ionos VPS
- Pre-configured with Rocky Linux 9
- Firewall managed via Ionos control panel + firewalld
- Public IP included

#### DigitalOcean Droplets
- Choose Ubuntu 22.04 LTS or Rocky Linux 9
- Configure cloud firewall in DO control panel
- Use floating IP for production

#### AWS EC2
- Use Amazon Linux 2 or Ubuntu AMI
- Configure Security Groups for ports 80, 443, 22
- Consider using Elastic IP

#### Linode/Vultr/Hetzner
- Most distributions supported
- Configure cloud firewall if available
- Reverse DNS setup recommended

## Step 1: VPS Preparation

### Connect to Your VPS

```bash
# Connect via SSH (replace with your VPS IP)
ssh root@your-vps-ip

# Or if you have a non-root user
ssh your-username@your-vps-ip
```

### Install Docker (Multi-Distribution)

#### For Rocky Linux/CentOS/RHEL:
```bash
# Update package index
dnf update -y

# Install required packages
dnf install -y dnf-plugins-core git

# Add Docker repository
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker service
systemctl start docker
systemctl enable docker
```

#### For Ubuntu/Debian:
```bash
# Update package index
apt update

# Install prerequisites
apt install -y ca-certificates curl gnupg git

# Add Docker's GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker service
systemctl start docker
systemctl enable docker
```

### Verify Installation & Setup User

```bash
# Add your user to docker group (if not root)
usermod -aG docker $USER

# Verify installation
docker --version
docker compose version

# Test Docker
docker run hello-world
```

### Create Application Directory

```bash
mkdir -p /opt/cosplay-shoot-manager
cd /opt/cosplay-shoot-manager
```

## Step 2: Configuration Setup

### Option A: Deploy from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/Thaumonaut/cosplay-shoot-manager.git .

# Or if you want a specific version
git clone --branch v1.1.1 https://github.com/Thaumonaut/cosplay-shoot-manager.git .

# The docker-compose.yml is already included in the repository
```

### Option B: Manual Configuration

If you prefer to create the configuration manually:

### Create docker-compose.yml

```bash
nano docker-compose.yml
```

Add the following content:

```yaml
version: '3.8'
services:
  app:
    image: rakoryn/cosplay-shoot-manager:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:SecurePassword123@db:5432/cosplay
      # Required Supabase configuration
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      # Optional Google integrations
      - GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID}
      - GOOGLE_OAUTH_CLIENT_SECRET=${GOOGLE_OAUTH_CLIENT_SECRET}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
    depends_on:
      - db
    networks:
      - cosplay-network

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: SecurePassword123
      POSTGRES_DB: cosplay
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - cosplay-network
    # Only expose to localhost for security
    ports:
      - "127.0.0.1:5432:5432"

  # Optional: Add nginx for SSL termination and reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - cosplay-network

volumes:
  pgdata:
    driver: local

networks:
  cosplay-network:
    driver: bridge
```

### Create Environment File

```bash
nano .env
```

Add your configuration (replace with your actual values):

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google OAuth (Optional - for social login)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret

# Google Maps (Optional - for location features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### GitHub Deployment Benefits

When deploying from GitHub, you get:

- **Version Control**: Easy rollbacks to previous versions
- **Automatic Updates**: Pull latest changes with a simple `git pull`
- **Documentation**: All deployment guides included in the repository
- **Configuration Templates**: Pre-configured docker-compose.yml and nginx.conf
- **Easy Collaboration**: Multiple developers can deploy the same configuration

### Set Up Automatic Updates (Optional)

Create an update script for easy GitHub-based updates:

```bash
nano update.sh
```

```bash
#!/bin/bash
cd /opt/cosplay-shoot-manager

echo "Updating Cosplay Shoot Manager..."

# Pull latest changes from GitHub
git pull origin main

# Pull new Docker images
docker compose pull

# Restart services with new images
docker compose up -d

# Clean up old images
docker image prune -f

echo "Update completed successfully!"
```

```bash
chmod +x update.sh

# Run updates manually
./update.sh

# Or add to crontab for automatic updates (use with caution in production)
# 0 3 * * 0 /opt/cosplay-shoot-manager/update.sh >> /var/log/cosplay-update.log 2>&1
```

### Secure the Environment File

```bash
chmod 600 .env
chown root:root .env
```

## Step 3: Nginx Configuration (Optional but Recommended)

If you want SSL termination and better performance, create an nginx config:

```bash
nano nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:5000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Proxy to Node.js app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static file caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Step 4: SSL Certificate Setup (Let's Encrypt)

### Install Certbot (Distribution-Specific)

#### Rocky Linux/CentOS/RHEL:
```bash
# Install EPEL repository first
dnf install -y epel-release

# Install certbot
dnf install -y certbot
```

#### Ubuntu/Debian:
```bash
# Install certbot
apt update
apt install -y certbot
```

### Get SSL Certificate

```bash
# Stop any running web server first
docker-compose down

# Get certificate
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to your project directory
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem
```

### Auto-renewal Setup

```bash
# Add to crontab
crontab -e

# Add this line for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet && cd /opt/cosplay-shoot-manager && docker compose restart nginx
```

## Step 5: Firewall Configuration

### Configure Firewall (Distribution-Specific)

#### Rocky Linux/CentOS/RHEL (firewalld):
```bash
# Start and enable firewalld
systemctl start firewalld
systemctl enable firewalld

# Allow SSH
firewall-cmd --permanent --add-service=ssh

# Allow HTTP and HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Or allow specific ports
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp

# Reload firewall rules
firewall-cmd --reload

# Check status
firewall-cmd --list-all
```

#### Ubuntu/Debian (ufw):
```bash
# Enable firewall
ufw enable

# Allow SSH
ufw allow ssh
ufw allow 22

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Check status
ufw status
```

### VPS Provider-Specific Firewall Settings

#### Ionos Cloud Panel:
1. Go to your server's network settings
2. Ensure ports 80 and 443 are open
3. Configure any additional security groups if needed

#### DigitalOcean:
```bash
# Create cloud firewall (optional)
doctl compute firewall create \
  --name cosplay-firewall \
  --inbound-rules "protocol:tcp,ports:22,source_addresses:0.0.0.0/0,source_addresses:::/0 protocol:tcp,ports:80,source_addresses:0.0.0.0/0,source_addresses:::/0 protocol:tcp,ports:443,source_addresses:0.0.0.0/0,source_addresses:::/0"
```

#### AWS EC2:
1. Go to EC2 Dashboard → Security Groups
2. Edit inbound rules for your instance
3. Add rules: SSH (22), HTTP (80), HTTPS (443)

#### Linode/Vultr/Hetzner:
- Configure cloud firewall in provider's control panel
- Allow ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Step 6: Deploy the Application

### Start the Services

```bash
cd /opt/cosplay-shoot-manager

# Pull latest images
docker compose pull

# Start in detached mode
docker compose up -d

# Check logs
docker compose logs -f app
```

### Verify Deployment

```bash
# Check running containers
docker compose ps

# Test the application
curl http://localhost:5000/api/health

# Or if using nginx with SSL
curl https://your-domain.com/api/health
```

## Step 7: Database Setup

The database will be automatically created, but you may need to run migrations:

```bash
# Access the app container
docker compose exec app sh

# Run database migrations (if needed)
npm run db:push

# Exit container
exit
```

## Step 8: Monitoring and Maintenance

### Log Management

```bash
# View logs
docker compose logs -f app
docker compose logs -f db
docker compose logs -f nginx

# Rotate logs (add to crontab)
0 0 * * * cd /opt/cosplay-shoot-manager && docker compose logs --no-color --tail=1000 app > /var/log/cosplay-app.log 2>&1
```

### Backup Strategy

```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T db pg_dump -U postgres cosplay > $BACKUP_DIR/cosplay_db_$DATE.sql

# Backup uploaded files (if any)
docker compose exec -T app tar -czf - /app/uploads > $BACKUP_DIR/cosplay_files_$DATE.tar.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "cosplay_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/cosplay-shoot-manager/backup.sh
```

### Updates

```bash
# Update to latest version
cd /opt/cosplay-shoot-manager

# Method 1: GitHub-based update (if deployed from GitHub)
git pull origin main
docker compose pull
docker compose up -d

# Method 2: Docker image update only
docker compose pull
docker compose up -d

# Clean up old images
docker image prune -f

# Check for specific version tags
git tag -l
git checkout v1.1.1  # Switch to specific version if needed
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker compose logs app

# Check environment variables
docker compose exec app printenv
```

**Database connection issues:**
```bash
# Check if database is running
docker compose ps db

# Connect to database
docker compose exec db psql -U postgres -d cosplay
```

**SSL certificate issues:**
```bash
# Check certificate validity
openssl x509 -in ssl/fullchain.pem -text -noout

# Test SSL configuration
curl -I https://your-domain.com
```

### Performance Optimization

1. **Resource Limits**: Add resource limits to docker-compose.yml
2. **Database Tuning**: Configure PostgreSQL for your server specs
3. **Nginx Caching**: Enable more aggressive caching for static assets
4. **Monitoring**: Consider adding Prometheus/Grafana for monitoring

## Security Best Practices

1. **Regular Updates**: Keep Docker images and system packages updated
2. **Firewall**: Only expose necessary ports
3. **SSL**: Use strong SSL configuration
4. **Secrets**: Never commit secrets to version control
5. **Backups**: Test backup restoration regularly
6. **Monitoring**: Set up log monitoring and alerts

## VPS-Specific Troubleshooting

### Common VPS Issues

**Low Memory Issues:**
```bash
# Check memory usage
free -h
docker stats

# Add swap if needed
dd if=/dev/zero of=/swapfile bs=1024 count=2097152
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
```

**Network Connectivity:**
```bash
# Test external connectivity
ping 8.8.8.8
curl -I https://google.com

# Check if ports are actually open
netstat -tulpn | grep -E ':(80|443|5000)'
```

**Provider-Specific Issues:**

#### Ionos VPS:
- Check Ionos control panel for network restrictions
- Verify DDoS protection isn't blocking traffic
- Ensure IPv6 is properly configured if needed

#### DigitalOcean:
```bash
# Check droplet metrics
doctl compute droplet list
doctl monitoring metrics droplet cpu --start 2h --end 1h
```

#### AWS EC2:
- Verify Security Group rules
- Check if Elastic IP is properly attached
- Review CloudWatch logs for issues

#### Vultr/Linode:
- Check firewall rules in control panel
- Verify reverse DNS is set up correctly
- Monitor bandwidth usage

### Performance Optimization for VPS

**Resource Limits:**
```yaml
# Add to docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
```

**Database Optimization:**
```bash
# Tune PostgreSQL for VPS
docker compose exec db bash -c 'echo "shared_buffers = 256MB" >> /var/lib/postgresql/data/postgresql.conf'
docker compose exec db bash -c 'echo "effective_cache_size = 1GB" >> /var/lib/postgresql/data/postgresql.conf'
docker compose restart db
```

### Security Hardening for VPS

**SSH Security:**
```bash
# Change default SSH port
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
systemctl restart sshd

# Disable root login (after setting up sudo user)
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
```

**Automatic Updates:**
```bash
# Enable automatic security updates (Ubuntu/Debian)
apt install -y unattended-upgrades
dpkg-reconfigure unattended-upgrades

# Or for Rocky Linux/CentOS
dnf install -y dnf-automatic
systemctl enable --now dnf-automatic.timer
```

## Support

If you encounter VPS-specific issues:
1. Check the application logs: `docker compose logs -f app`
2. Verify VPS resources: `htop`, `df -h`, `free -h`
3. Test network connectivity: `curl -I https://google.com`
4. Check provider-specific control panels and documentation
5. Review the main [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) guide

Your application should now be running at:
- **HTTP**: `http://your-vps-ip:5000` (if not using nginx)
- **HTTPS**: `https://your-domain.com` (if using nginx with SSL)
- **Provider-specific URLs**: Check your VPS provider's documentation for any special networking features