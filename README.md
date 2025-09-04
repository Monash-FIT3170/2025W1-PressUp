# FIT3170 Project 1 - PressUp

## Project 1 Teams
### Team 1
| Name | Role | Email |
| - | - | - |
| Hugo Ferguson | Product Manager | hfer0009@student.monash.edu |
| Jamie Gatt | System Architect | jgat0003@student.monash.edu |
| Ziheng | Product Manager | zlia0050@student.monash.edu |
| Wong Min Yee | RTE | mwon0072@student.monash.edu |

### Team 2
| Name | Role | Email |
| - | - | - |
| Jacob Wall | System Architect | jwal0073@student.monash.edu | 
| Connor Saunders | RTE	| csau0007@student.monash.edu |
| Jake Zweytzer | Product Manager | jzwe0001@student.monash.edu |
| Andrea Jing Ning Ong | RTE | aong0023@student.monash.edu |

### Team 3
| Name | Role | Email |
| - | - | - |
| Dean Mascitti | System Architect | dmas0019@student.monash.edu |
| Kingsley Bishop | RTE | kbis0003@student.monash.edu |
| Minh Khoi Nguyen  | Product Manager | mngu0115@student.monash.edu |
| Emma Keyhoe | Product Manager | ekey0003@student.monash.edu |

## Project Overview

**PressUp** is a comprehensive restaurant management system built with MeteorJS and React. The system provides end-to-end functionality for restaurant operations including point-of-sale (POS), inventory management, analytics, customer communication, and staff training.

### Key Features
- **Point of Sale (POS)**: Complete order management and payment processing
- **Inventory Management**: Real-time stock tracking and supplier management
- **Analytics Dashboard**: Financial reporting and business insights
- **Customer Communication**: Enquiry management and feedback systems
- **Staff Training**: Training module assignments and progress tracking
- **Table Management**: Restaurant table layout and reservation system
- **Menu Management**: Dynamic menu creation and pricing
- **Promotions**: Discount and promotional campaign management

## Software Requirments

**Operating System:**  
- Windows 10 or later  
- macOS 10.15 (Catalina) or later  

**Runtime / Languages:** 
- Node.js (must be at least version 20)
- MeteorJS (install using ```bash # npm install -g meteor --foreground-script ``` for Windows or ```bash curl https://install.meteor.com/ | sh``` for MAC OS -- this must be run as administrator on Windows and installed globally)
- MongoDB (included with Meteor by default)

**Development Tools:**  
- VS Code (or another IDE/editor that supports JavaScript/TypeScript)


## Hardware Requirements: (No strict hardware requirments)
- Recommended: 
    - CPU: Dual-core 2.0+ GHz processor (Intel i5 / AMD Ryzen 3 or better)
    - RAM: Minimum 8 GB (16 GB recommended if running multiple services like MongoDB, IDE, and browser)
    - Storage: At least 10 GB free SSD space (faster builds and package installs with SSD)
    - Network: Stable internet connection (for fetching Meteor/NPM packages)

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (version 20 or later)
- MeteorJS (globally installed)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd 2025W1-PressUp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   meteor
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Default admin credentials: [To be documented]

### Database Collections
- **Customers**: Customer information and loyalty data
- **Orders**: Order history and transaction records
- **Inventory**: Stock levels and supplier information
- **Menu**: Menu items and categories
- **Users**: Staff accounts and permissions
- **Training**: Training modules and assignments

## Feature Documentation

### Point of Sale (POS)
<!-- - **Location**: `imports/ui/Components/POS/` -->
- **Key Components**: Order management, payment processing, receipt generation
- **Dependencies**: Orders collection, Menu collection

### Inventory Management
<!-- - **Location**: `imports/ui/Components/IngredientTable/`, `imports/ui/Components/SupplierTable/` -->
- **Key Features**: Stock tracking, supplier management, low stock alerts
- **Dependencies**: Inventory collection, Suppliers collection

### Analytics Dashboard
<!-- - **Location**: `imports/ui/Components/Analytics/` -->
- **Key Components**: Sales charts, financial reports, peak hour analysis
- **Dependencies**: Orders collection, Recharts library

### Customer Communication
<!-- - **Location**: `imports/ui/Components/CustomerCommunication/` -->
- **Key Features**: Enquiry management, feedback collection
- **Dependencies**: Enquiries collection, Feedback collection

---

## Dependencies:

| Package             | Version | Purpose                                            |
| ------------------- | ----------------------------- | -------------------------------------------------- |
| `recharts` | ^3.1.2                       | Allows financial and analytics graphing |
| | | |

