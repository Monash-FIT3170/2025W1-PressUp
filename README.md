# PressUp – Restaurant Management System

## Overview
**PressUp** is a full-stack restaurant management system built with **MeteorJS** and **React**, designed to streamline end-to-end operations for hospitality venues.  
It includes integrated tools for POS, inventory, analytics, communication, staff management, and more.

---

## Key Features
- **Point of Sale (POS):** Order management and payment processing  
- **Inventory Management:** Real-time stock tracking and supplier management  
- **Analytics Dashboard:** Financial reports, visual analytics, and business insights  
- **Customer Communication:** Enquiry tracking and feedback handling  
- **Staff Training:** Assign and monitor completion of training modules  
- **Employee Scheduling:** Shift planning, timesheet management, and payroll integration  
- **Table Management:** Restaurant layout and reservation system  
- **Menu Management:** Dynamic menu creation and pricing  
- **Promotions:** Manage discounts and special offers  

---

## Software Requirements

### Operating System
- Windows 10 or later  
- macOS 10.15 (Catalina) or later  

### Runtime & Languages
- **Node.js** ≥ 20  
- **MeteorJS** (install globally)  
  - Windows:  
    ```bash
    npm install -g meteor --foreground-script
    ```
  - macOS:  
    ```bash
    curl https://install.meteor.com/ | sh
    ```
- **MongoDB** (bundled with Meteor)  

### Development Tools
- **VS Code** or any JavaScript/TypeScript compatible IDE

---

## Hardware Recommendations
| Component | Minimum | Recommended |
|------------|-----------|--------------|
| CPU | Dual-core 2.0+ GHz | Intel i5 / Ryzen 3+ |
| RAM | 8 GB | 16 GB (for IDE + MongoDB + Browser) |
| Storage | 10 GB free | SSD for faster builds |
| Network | Stable internet | Required for npm/Meteor packages |

---

## Installation & Deployment

### Prerequisites
Ensure the following are installed globally:
- Node.js v20+
- MeteorJS
- Git

### Production Deployment
PressUp is deployed on **Meteor Galaxy** and accessible at:

**🌐 [https://pressup2.au.meteorapp.com/](https://pressup2.au.meteorapp.com/)**

**Automatic Deployment:** Galaxy is configured with continuous deployment. Any changes pushed to the `main` branch will automatically trigger a deployment to the production environment.


### Local Development Setup
```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/PressUp.git
cd PressUp

# 2. Install dependencies
npm install

# 3. Run the development server
meteor

# 4. Access the app
# Open your browser and navigate to:
http://localhost:3000
```

---

## Versioning Strategy

PressUp follows **Semantic Versioning 2.0.0** (SemVer) for all releases. Version numbers are structured as `MAJOR.MINOR.PATCH`:

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** version increments indicate incompatible API changes or significant architectural shifts
  - Example: `1.0.0` → `2.0.0` (database schema changes, breaking API modifications)
  
- **MINOR** version increments indicate new functionality added in a backwards-compatible manner
  - Example: `1.0.0` → `1.1.0` (new POS features, additional analytics reports)
  
- **PATCH** version increments indicate backwards-compatible bug fixes
  - Example: `1.0.0` → `1.0.1` (security patches, minor bug fixes)

### Pre-release Versions
For pre-production releases, append a hyphen and identifier:
- **Alpha:** `1.0.0-alpha.1` (early internal testing)
- **Beta:** `1.0.0-beta.1` (feature-complete, external testing)
- **Release Candidate:** `1.0.0-rc.1` (final testing before production)

### Version Tagging
All releases must be tagged in Git:
```bash
git tag -a v1.2.0 -m "Release version 1.2.0: Added inventory forecasting"
git push origin v1.2.0
```
---

## Pull Request Strategy

### Branch Naming Convention
Use descriptive branch names following this pattern:
```
<type>/<issue-number>-<brief-description>

Examples:
- feature/123-add-table-reservation
- bugfix/456-fix-inventory-calculation
- hotfix/789-security-patch
- refactor/321-optimize-pos-queries
```

**Branch Types:**
- `feature/` – New functionality
- `bugfix/` – Bug fixes for non-critical issues
- `hotfix/` – Critical production fixes
- `refactor/` – Code improvements without functional changes
- `docs/` – Documentation updates
- `test/` – Test additions or modifications

### Pull Request Process

#### 1. Before Creating a PR
- Ensure your branch is up to date with `main`:
  ```bash
  git checkout main
  git pull origin main
  git checkout your-branch
  git rebase main
  ```
- Run all tests locally:
  ```bash
  npm test
  meteor test --driver-package meteortesting:mocha
  ```
- Ensure code follows the project style guide
- Update documentation if applicable

#### 2. Creating the Pull Request
Use the following PR template:

```markdown
## Description
[Provide a clear description of what this PR does]

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing Performed
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (Chrome, Firefox, Safari)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Additional Notes
[Any additional context or notes for reviewers]
```

### 3. PR Review Requirements

**Review Checklist:**
- Code quality and readability
- Test coverage adequate
- No security vulnerabilities introduced
- Performance implications considered
- Documentation updated
- Follows architectural patterns
- Backwards compatibility maintained (unless breaking change)

#### 4. Approval and Merging

**Approval Process:**
1. All required reviewers approve
2. All CI/CD checks pass
3. No merge conflicts exist
4. Branch is up to date with `main`

**Merge Strategy:**
- Use **Squash and Merge** for feature branches (keeps history clean)
- Use **Rebase and Merge** for hotfixes (preserves commit history)
- Use **Merge Commit** for release branches

**Post-Merge:**
- Delete the feature branch
- Verify deployment in staging environment
- Update related issue/ticket status
- Notify relevant team members

### PR Etiquette
- Keep PRs focused and reasonably sized (< 500 lines preferred)
- Respond to review comments promptly
- Request re-review after addressing feedback
- Be respectful and constructive in code reviews
- Link to relevant documentation or Stack Overflow answers
- Use draft PRs for work-in-progress that needs early feedback

### Emergency Hotfix Procedure
For critical production issues:
1. Create hotfix branch from `main`
2. Implement minimal fix
3. Fast-track review (1 System Architect approval required)
4. Merge immediately after approval
5. Create follow-up issue for comprehensive solution if needed

---


## License
```
MIT License

Copyright (c) 2025 PressUp Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```RetryClaude does not have the ability to run the code it generates yet.Claude can make mistakes. Please double-check responses. Sonnet 4.5
