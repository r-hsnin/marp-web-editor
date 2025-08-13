"use client";

import React from "react";
import MarpLogo from "@/components/header/components/marp-logo";
import type { HeaderBrandingProps } from "../types";

/**
 * Header branding component
 *
 * Displays the logo, title, and description.
 * Handles responsive design for mobile and desktop layouts.
 */
const HeaderBranding: React.FC<HeaderBrandingProps> = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm animate-float hover:shadow-lg transition-all duration-300 cursor-pointer">
        <MarpLogo className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Marp Web Editor
        </h1>
        <div className="text-xs text-muted-foreground">
          <span className="hidden sm:block">
            Create beautiful presentations with Markdown
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBranding;
