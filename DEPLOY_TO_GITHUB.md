# Beginner deployment guide — GitHub Pages

## 1. Create the repository

- Sign in to GitHub.
- Click the **+** menu in the top-right and choose **New repository**.
- Repository name: `iraq-schengen-visa-dashboard`.
- Description: `Interactive analysis of Schengen visa statistics from Iraq, 2015–2025.`
- Choose **Public**.
- You can leave README, .gitignore and license unchecked because this package already contains a README.
- Click **Create repository**.

## 2. Upload the dashboard

- On the empty repository page, choose **uploading an existing file**, or later use **Add file → Upload files**.
- Unzip the dashboard package on your computer first.
- Drag **all files and folders inside the unzipped folder** into GitHub.
- Confirm that `index.html`, `css`, `js`, `data`, `assets`, and `README.md` appear at the top level.
- At the bottom, enter a commit message such as `Initial dashboard version`.
- Click **Commit changes**.

## 3. Turn on GitHub Pages

- In the repository, open **Settings**.
- In the left sidebar, click **Pages**.
- Under **Build and deployment**, set **Source** to **Deploy from a branch**.
- Choose branch **main** and folder **/(root)**.
- Click **Save**.

## 4. Open the published site

GitHub will show the site URL on the Pages settings screen after deployment. It will normally look like:

`https://YOUR-USERNAME.github.io/iraq-schengen-visa-dashboard/`

The first deployment may take a short time. If the site gives a 404, check that `index.html` is at the top level of the publishing source and is spelled exactly `index.html`.

## Updating it later

To replace a data file or edit the site in the browser:

- Open the repository.
- Navigate to the file.
- Use the edit button for text files, or **Add file → Upload files** to upload replacements.
- Commit the change to `main`.
- GitHub Pages will redeploy the updated site automatically.
