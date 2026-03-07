import { Outlet } from "react-router";
import Header from "../components/Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}
