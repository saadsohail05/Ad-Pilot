import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "About",
    path: "/about",
    newTab: false,
  },
  {
    id: 33,
    title: "Ad Creatives",
    path: "/AdCreatives",
    newTab: false,
  },
  {
    id: 3,
    title: "Get Started",
    path: "/contact",
    newTab: false,
  },
  {
    id: 4,
    title: "Pages",
    newTab: false,
    submenu: [
      {
        id: 46,
        title: "Sign In Page",
        path: "/signin",
        newTab: false,
      },
      {
        id: 47,
        title: "Sign Up Page",
        path: "/signup",
        newTab: false,
      },
      {
        id: 48,
        title: "Error Page",
        path: "/error",
        newTab: false,
      },
      {
        id: 49,
        title: "Verification Page",
        path: "/verification",
        newTab: false,
      },
      {
        id: 50,
        title: "Pass Reset",
        path: "/forgotpassword",
        newTab: false,
      },
    ],
  },
];
export default menuData;
