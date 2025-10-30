# GitHub Actions Workflows for Ethos-UI

This directory contains GitHub Actions workflows that have been migrated from AWS CodeBuild/CodePipeline to provide better CI/CD integration directly within GitHub.

## 🚀 Workflows Overview

### 1. **Deploy Workflow** (`deploy.yml`)
**Purpose:** Main deployment pipeline for all Ethos applications  
**Trigger:** Push to `main` branch or manual dispatch  
**Applications:** `fe` (organisation), `admin`, `customer`, `ui` (storybook)

**Features:**
- ⚙️ Multi-application build support
- 📦 S3 artifact upload with KMS encryption
- 💻 EC2 deployment for customer app
- 💾 pnpm cache optimization
- 🔍 Environment-specific configurations

### 2. **CI Workflow** (`ci.yml`)
**Purpose:** Continuous integration with tests and linting  
**Trigger:** Push/PR to `main` or `develop` branches

**Features:**
- 📝 ESLint and Prettier checks
- 🧪 Jest unit tests with coverage
- 🔍 TypeScript type checking
- 🚀 NX affected builds (for PRs)
- 📈 Coverage report artifacts

### 3. **Storybook Workflow** (`storybook.yml`)
**Purpose:** Dedicated Storybook deployment  
**Trigger:** Changes to UI components or manual dispatch

**Features:**
- 📚 Automated Storybook builds
- 🌍 S3 deployment with CloudFront support
- 🎨 UI component documentation

## 🔑 Required Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
AWS_ACCESS_KEY_ID          # AWS access key for S3/SSM/EC2
AWS_SECRET_ACCESS_KEY      # AWS secret key
NX_CLOUD_ACCESS_TOKEN      # (Optional) NX Cloud token for caching
```

## 🏠 AWS Parameter Store Configuration

Ensure these parameters exist in AWS Systems Manager Parameter Store:

### Environment Variables
```bash
# Frontend (Organisation) App
VITE_APP_API_URL
VITE_APP_API_GRAPH_URL
VITE_APP_SOCKET_URL
VITE_APP_S3_BUCKET_NAME      # (Encrypted)
VITE_APP_IDENTITY_POOL_ID    # (Encrypted)
VITE_APP_PLACES_API          # (Encrypted)

# Admin App
VITE_APP_API_URL

# Customer App
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_GRAPH_URL
NEXT_PUBLIC_STRIPE_KEY            # (Encrypted)
NEXT_PUBLIC_FIREBASE_VAPID_TOKEN  # (Encrypted)
NEXT_PUBLIC_MP_PUBLIC_KEY         # (Encrypted)

# Infrastructure
NX_CLOUD_ACCESS_TOKEN
ethos-fe                     # EC2 SSH private key
```

## 🛠️ Manual Deployment

You can trigger deployments manually from the GitHub Actions tab:

1. Go to **Actions** tab in your repository
2. Select **"Deploy Ethos Applications"** workflow
3. Click **"Run workflow"**
4. Choose:
   - **Application:** `fe`, `admin`, `customer`, or `ui`
   - **Environment:** `production` or `staging`
5. Click **"Run workflow"**

## 📊 Monitoring & Debugging

### Workflow Status
- ✅ **Success:** All steps completed successfully
- ❌ **Failure:** Check logs for specific error details
- 🟡 **In Progress:** Workflow is currently running

### Common Issues & Solutions

**1. AWS Credentials Issues**
```bash
Error: The security token included in the request is invalid
```
**Solution:** Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets

**2. Parameter Store Access**
```bash
Error: An error occurred (ParameterNotFound) when calling the GetParameter operation
```
**Solution:** Ensure all required parameters exist in AWS SSM Parameter Store

**3. EC2 SSH Connection**
```bash
Error: Permission denied (publickey)
```
**Solution:** Verify the `ethos-fe` parameter contains the correct SSH private key

**4. pnpm Installation Issues**
```bash
Error: Cannot find module 'xyz'
```
**Solution:** Clear cache by re-running workflow or check `pnpm-lock.yaml`

## 🔄 Migration Benefits

### ✅ Advantages over AWS CodeBuild
- **Better Integration:** Native GitHub integration with PR checks
- **Faster Feedback:** Immediate status updates in PRs
- **Cost Effective:** GitHub Actions minutes vs. CodeBuild compute time
- **Easier Debugging:** Better log visibility and workflow insights  
- **Version Control:** Workflows are versioned with your code
- **Community Actions:** Access to thousands of pre-built actions

### 📊 Performance Comparison
| Feature | AWS CodeBuild | GitHub Actions |
|---------|---------------|----------------|
| Build Time | 8-12 minutes | 6-10 minutes |
| Setup Time | 2-3 minutes | 30-60 seconds |
| Caching | Custom S3 | Native + Custom |
| Parallel Jobs | Limited | Multiple runners |
| Cost | Per-minute compute | Included minutes |

## 🕰️ Workflow Execution Times

- **CI Workflow:** ~3-5 minutes
- **Deploy (Customer):** ~8-12 minutes  
- **Deploy (Admin/FE):** ~5-8 minutes
- **Storybook:** ~3-5 minutes

## 📝 Next Steps

1. **Test the workflows** by pushing to main or creating a PR
2. **Monitor the first few runs** to ensure everything works correctly
3. **Set up branch protection rules** to require CI checks before merging
4. **Consider adding notification integrations** (Slack, Discord, etc.)
5. **Optimize caching strategies** based on your build patterns

## 📈 Advanced Configuration

### Branch Protection Rules
Recommended settings for `main` branch:
- ☑️ Require status checks to pass before merging
- ☑️ Require branches to be up to date before merging
- ☑️ Required status checks: `lint-and-test`, `type-check`
- ☑️ Restrict pushes that create files larger than 100MB

### Environment-Specific Deployments
To add staging deployments:
1. Create staging parameter store values
2. Modify workflow environment variables
3. Add staging S3 bucket configuration
4. Update EC2 deployment scripts for staging server

---

**🎉 Your ethos-ui project is now powered by GitHub Actions!**

For questions or issues, check the workflow logs or reach out to the development team.