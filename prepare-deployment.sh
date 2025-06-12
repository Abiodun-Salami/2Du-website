#!/bin/bash

# 2Du! Website Deployment Script
# This script helps prepare files for GitHub upload

echo "🚀 Preparing 2Du! website for GitHub deployment..."

# Create deployment directory
mkdir -p ~/2du-deployment
cd ~/2du-deployment

# Copy all website files
echo "📁 Copying website files..."
cp -r /home/ubuntu/2du-website/* .

# Verify file structure
echo "✅ File structure verification:"
echo "Total files: $(find . -type f | wc -l)"
echo "HTML files: $(find . -name "*.html" | wc -l)"
echo "CSS files: $(find . -name "*.css" | wc -l)"
echo "JS files: $(find . -name "*.js" | wc -l)"
echo "Config files: $(find . -name "*.yml" -o -name "*.md" | wc -l)"

echo ""
echo "📋 Directory structure:"
tree . || ls -la

echo ""
echo "🎯 Ready for GitHub upload!"
echo "📁 Files are in: ~/2du-deployment/"
echo "📖 Follow the deployment guide to complete setup"

echo ""
echo "✅ Next steps:"
echo "1. Create GitHub repository: 2du-website"
echo "2. Upload files from ~/2du-deployment/"
echo "3. Deploy to Netlify"
echo "4. Enable Netlify Identity"
echo "5. Configure custom domain"

echo ""
echo "🚀 Your professional website with CMS is ready to launch!"

