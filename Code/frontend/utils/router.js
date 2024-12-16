import LoginPage from "../pages/LoginPage.js";
import CustomerProfile from "../pages/CustomerProfile.js";
import CustomerHome from "../pages/CustomerHome.js";
import RegisterPage from "../pages/RegisterPage.js";
import ServicesListPage from "../pages/ServicesListPage.js";
import RequestServicePage from "../pages/RequestServicePage.js";
import CustomerRequestedServices from "../pages/CustomerRequestedServices.js";
import Home from "../pages/Home.js";
import RoleSelectionPage from "../pages/RoleSelectionPage.js";
import CustomerRegisterPage from "../pages/CustomerRegisterPage.js";
import ProfessionalRegisterPage from "../pages/ProfessionalRegisterPage.js";
import ProfessionalHome from "../pages/ProfessionalHome.js";
import AdminHome from "../pages/AdminHome.js";
import ProfessionalProfile from "../pages/ProfessionalProfile.js";
import ProfessionalServiceRequests from "../pages/ProfessionalServiceRequests.js";
import AdminServices from "../pages/AdminServices.js";
import AdminUsers from "../pages/AdminUsers.js";
import CustomerHistoryPage from "../pages/CustomerHistoryPage.js";
import ProfessionalHistoryPage from "../pages/ProfessionalHistoryPage.js";
import AdminSummary from "../pages/AdminSummary.js";
import CustomerSearchServices from "../pages/CustomerSearchServices.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/role-selection", component: RoleSelectionPage },
  { path: "/customer/register", component: CustomerRegisterPage },
  { path: "/professional/register", component: ProfessionalRegisterPage },

  { path: "/customer/home", component: CustomerHome },
  { path: "/customer/profile", component: CustomerProfile },
  { path: "/request-service", component: RequestServicePage },
  { path: '/requested-services', component: CustomerRequestedServices },
  { path: '/customer/service-history', component: CustomerHistoryPage },
  { path: '/services/search', component: CustomerSearchServices },

  { path: '/professional/home', component: ProfessionalHome },
  { path: '/professional/profile', component: ProfessionalProfile },
  { path: '/professional/service-requests', component: ProfessionalServiceRequests },
  { path: '/professional/service-history', component: ProfessionalHistoryPage },


  { path: '/admin/home', component: AdminHome },
  { path: '/admin/services', component: AdminServices },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/summary', component: AdminSummary },



  { path: "/feed", component: ServicesListPage },

  

];

const router = new VueRouter({ routes });

export default router;
