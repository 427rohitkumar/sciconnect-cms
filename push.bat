@echo off
echo "Starting git push process..."
git init
git add .
git commit -m "Initial commit: SciConnect CMS backend"
git branch -M main
git remote remove origin
git remote add origin git@github.com:427rohitkumar/sciconnect-cms.git
git push -u origin main
echo "Git push process finished."
