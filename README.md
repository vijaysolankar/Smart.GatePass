# Smart GatePass System - Deployment Guide

This guide provides step-by-step instructions to deploy the full-stack Smart GatePass application using GitHub and Vercel.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed on your computer.
2.  **GitHub Account**: You will need a free GitHub account.
3.  **Vercel Account**: You will need a free Vercel account. Sign up by linking your GitHub account.
4.  **Git**: Ensure you have Git installed on your computer.

---

## Step 1: Set Up a Free Cloud Database (MongoDB Atlas)

Your application needs a database that is accessible from the internet. Your local `localhost` database will not work once the app is deployed.

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2.  **Create a Free Cluster**:
    *   Follow the on-screen instructions to create a new project and a new cluster.
    *   Choose the **M0 Sandbox** tier, which is free forever.
    *   Select a cloud provider and region (the defaults are fine).
    *   Name your cluster (e.g., `smart-gatepass-db`) and click **Create**.
3.  **Create a Database User**:
    *   In the left-hand menu of your cluster, go to **Database Access**.
    *   Click **Add New Database User**.
    *   Enter a username (e.g., `gatepass_user`) and a secure password. Remember this password!
    *   Under "Database User Privileges", select **Read and write to any database**.
    *   Click **Add User**.
4.  **Allow Network Access**:
    *   In the left-hand menu, go to **Network Access**.
    *   Click **Add IP Address**.
    *   Select **ALLOW ACCESS FROM ANYWHERE** (0.0.0.0/0). This is simpler for now, but for a real production app, you would restrict this.
    *   Click **Confirm**.
5.  **Get Your Connection String**:
    *   Go back to **Database** in the left-hand menu.
    *   Click the **Connect** button on your cluster.
    *   Select **Drivers**.
    *   Under "View your connection string", copy the string provided. It will look like this:
        `mongodb+srv://<username>:<password>@cluster-name.mongodb.net/?retryWrites=true&w=majority`
    *   **IMPORTANT**: Replace `<password>` with the actual password you created in step 3. Do **not** include the `<` or `>` brackets.

    **Keep this full connection string safe. You will need it later.**

---

## Step 2: Push Your Project to GitHub

Vercel deploys projects directly from a GitHub repository.

1.  **Create a New Repository**:
    *   Go to [GitHub](https://github.com) and click the `+` icon in the top-right, then select **New repository**.
    *   Give it a name (e.g., `smart-gatepass-system`).
    *   Make it **Public** or **Private**.
    *   Click **Create repository**.
2.  **Initialize Git and Push Your Code**:
    *   Open a terminal or command prompt **inside your project folder** (`C:\Users\sande\Desktop\SmartGatePassApp`).
    *   Run the following commands one by one, replacing `<your-github-repo-url>` with the URL of the repository you just created:

    ```bash
    git init
    git add .
    git commit -m "Initial commit: Ready for deployment"
    git branch -M main
    git remote add origin <your-github-repo-url>
    git push -u origin main
    ```

---

## Step 3: Deploy to Vercel

1.  **Create a New Vercel Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** and select **Project**.
2.  **Import Your GitHub Repository**:
    *   Vercel will show a list of your GitHub repositories. Find the `smart-gatepass-system` repository and click **Import**.
3.  **Configure the Project**:
    *   Vercel will automatically detect that this is a monorepo with a `vercel.json` file. It should not require much configuration.
    *   Expand the **Environment Variables** section. This is the most important part.
    *   Add the following environment variables:

        | Name        | Value                                                              |
        |-------------|--------------------------------------------------------------------|
        | `MONGO_URI` | Paste the full MongoDB Atlas connection string from Step 1.        |
        | `JWT_SECRET`| Enter a long, random, secret string for signing tokens.            |
        | `FRONTEND_URL`| This will be your Vercel app's URL. You can add it after the first deployment. |

4.  **Deploy**:
    *   Click the **Deploy** button.
    *   Vercel will now start building and deploying your frontend and backend. You can watch the progress in the build logs.

---

## Step 4: Final Configuration

1.  **Get Your Frontend URL**:
    *   Once the deployment is complete, Vercel will give you a URL (e.g., `https://smart-gatepass-system-xyz.vercel.app`). This is your live application URL.
2.  **Update the `FRONTEND_URL` Variable**:
    *   Go to your project's settings in Vercel (**Settings** -> **Environment Variables**).
    *   Edit the `FRONTEND_URL` variable and paste the Vercel URL you just got.
    *   Save the changes. Vercel will automatically trigger a new deployment with the updated variable.

**Your application is now live!** You can visit the Vercel URL to see and use your Smart GatePass System.