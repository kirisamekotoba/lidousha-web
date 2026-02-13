# Lidousha Music Project

A modernized version of [lidousha.top](https://lidousha.top), built with Next.js and Tailwind CSS.

## Deployment to GitHub Pages

## Deployment to GitHub Pages

I have installed the GitHub CLI (`gh`) for you. To deploy:

1. Run `gh auth login` in your terminal.
2. Follow the prompts:
   - What account do you want to log into? **GitHub.com**
   - What is your preferred protocol for Git operations? **HTTPS**
   - Authenticate Git with your GitHub credentials? **Yes**
   - How would you like to authenticate GitHub CLI? **Login with a web browser**
3. Once logged in, run the following to create and push the repo:

```bash
gh repo create lidousha-web --public --source=. --remote=origin --push
```

4. Go to your repository settings on GitHub -> Pages.
5. Set the source to `GitHub Actions` (Next.js automatically creates the workflow).

## Local Development

```bash
npm install
npm run dev
```

## Features
- Full song database (599 songs)
- Instant search and filtering
- Responsive design
