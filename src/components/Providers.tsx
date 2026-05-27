import { ReactNode } from "react";
import CustomMapProvider from "./CustomMapProvider";
import { TooltipProvider } from "./ui/tooltip";
import { SidebarProvider } from "./ui/sidebar";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <CustomMapProvider>
      <TooltipProvider>
        <SidebarProvider
          className="h-svh overflow-hidden"
          style={
            {
              "--sidebar-width": "350px",
            } as React.CSSProperties
          }
        >
          {children}
        </SidebarProvider>
      </TooltipProvider>
    </CustomMapProvider>
  );
};

export default Providers;
