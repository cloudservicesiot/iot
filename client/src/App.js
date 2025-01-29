// import { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import Topbar from "./scenes/global/Topbar";
// import Sidebar from "./scenes/global/Sidebar";
// import Team from "./scenes/team";
// import Invoices from "./scenes/invoices";
// import Contacts from "./scenes/contacts";
// import Form from "./scenes/form";
// import FAQ from "./scenes/faq";
// import { CssBaseline, ThemeProvider } from "@mui/material";
// import { ColorModeContext, useMode } from "./theme";
// import EntityForm from "./scenes/form/EntityForm";
// import EntitySwitch from "./components/switchLayout/EntitySwitch";
// import FloorPlan from "./components/device/FloorPlan";
// import Automation from "./components/automation/AutomationLayout";
// import CodeEditor from "./components/codeeditor/CodeEditor";
// import WebSocketComponent from "./components/dashbord/MainLayout";
// import LoginPage from "./components/auth/LoginPage";
// import SignupPage from "./components/auth/SignupPage";

// function App() {
//   const [theme, colorMode] = useMode();
//   const [isSidebar, setIsSidebar] = useState(true);

//   return (
//     <ColorModeContext.Provider value={colorMode}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
       
//         <div className="app">
//           <Sidebar isSidebar={isSidebar} />
//           <main className="content">
//             <Topbar setIsSidebar={setIsSidebar} />
//             <Routes>
              
//               {/* <Route path="/" element={<EntitySwitch/>}/> */}
//               <Route path="/" element={<WebSocketComponent/>}/>
//               <Route path="/team" element={<Team />} />
//               <Route path="/contacts" element={<Contacts />} />
//               <Route path="/invoices" element={<Invoices />} />
//               <Route path="/floorplan" element={<FloorPlan/>}/>
//               <Route path="/form" element={<Form />} />
//               <Route path="/entityform" element={<EntityForm />} />
//               <Route path="/mainswitch" element={<EntitySwitch/>}/>
//               <Route path="/codeeditor" element={<CodeEditor />} />
            
//               {/* <Route path="/line" element={<Line />} /> */}
//               <Route path="/line" element={<WebSocketComponent />} />
//               <Route path="/faq" element={<FAQ />} />
//               <Route path="/user/register" element={<SignupPage/>} />
//               <Route path="/user/login" element={<LoginPage/>} />
//             </Routes>
//           </main>
//         </div>
//       </ThemeProvider>
//     </ColorModeContext.Provider>
//   );
// }
// export default App;







import { useState } from "react";
import { Routes, Route,useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import EntityForm from "./scenes/form/EntityForm";
import EntitySwitch from "./components/switchLayout/EntitySwitch";
import FloorPlan from "./components/device/FloorPlan";
import Automation from "./components/automation/AutomationLayout";
import CodeEditor from "./components/codeeditor/CodeEditor";
import WebSocketComponent from "./components/dashbord/MainLayout";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { AuthProvider } from '../src/hooks/useAuth';
import PrivateRoute from '../src/components/auth/PrivateRoute';
import EnergyDashboard from "./components/energy/EnergyMeterDetail";
import EnergyMeters from "./components/energy/EnergyMeter";
import AirConditionerForm from "./components/airConditioner/AcForm";
import AllAirConditioner from "./components/airConditioner/AirConditioner";
import AcControlls from "./components/airConditioner/AcControlls";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  // Define routes without layout
  const noLayoutRoutes = ["/user/login", "/user/register"];

  const isNoLayoutRoute = noLayoutRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}> 
          <CssBaseline />
          {isNoLayoutRoute ? (
            <Routes>
              <Route path="/user/login" element={<LoginPage />} />
              <Route path="/user/register" element={<SignupPage />} />
            </Routes>
          ) : (
            <div className="app">
              <Sidebar isSidebar={isSidebar} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/user/login" element={<LoginPage />} />
                  <Route path="/user/register" element={<SignupPage />} />

                  {/* Private Routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <WebSocketComponent />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <PrivateRoute>
                        <Team />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/form"
                    element={
                      <PrivateRoute>
                        <Form/>
                      </PrivateRoute>
                    }
                  />
                   <Route
                    path="/entityform"
                    element={
                      <PrivateRoute>
                        <EntityForm/>
                      </PrivateRoute>
                    }
                  />
                  <Route
                  path="/energy/meters"
                  element={
                    <PrivateRoute>
                      <EnergyMeters/>
                    </PrivateRoute>
                  }></Route> <Route path="/energy/meters/detail/:id" element={<EnergyDashboard />} />
                  {/* Add more protected routes here */}
                  <Route
                  path="/air-conditioner/add"
                  element={
                    <PrivateRoute>
                      <AirConditionerForm/>
                    </PrivateRoute>
                  }
                  >
                    
                  </Route>
                  <Route
                path="/ac/dashboard"
                element={
                  <PrivateRoute>
                    <AllAirConditioner/>
                  </PrivateRoute>
                }
                ></Route>
                <Route
                path="/ac/dashbord/device/controll/:id"
                element={
                  <PrivateRoute>
                    <AcControlls/>
                  </PrivateRoute>
                }
                
                ></Route>
                </Routes>
              </main>
            </div>
          )}
         </ThemeProvider> 
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}


export default App;







