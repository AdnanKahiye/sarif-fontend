"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { SetupService } from "@/lib/setup";

interface NavigationContextType {
  menus: any[];
  loading: boolean;
  currentPage: any | null;
  refreshMenus: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMenus = async () => {
    try {
      setLoading(true);

      const response = await SetupService.getMenus();

      if (response.data.success) {
        setMenus(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMenus();
  }, []);

  const currentPage = useMemo(() => {
    for (const module of menus) {
      for (const menu of module.menus) {
        if (menu.href === pathname) return menu;

        if (menu.children) {
          for (const child of menu.children) {
            if (child.href === pathname) {
              return {
                ...child,
                parent: menu,
              };
            }
          }
        }
      }
    }

    return null;
  }, [pathname, menus]);

  return (
    <NavigationContext.Provider
      value={{
        menus,
        loading,
        currentPage,
        refreshMenus,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigation must be used inside NavigationProvider"
    );
  }

  return context;
}