export type ThemeMode = "light" | "dark" | "system";

export interface AppTheme {
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryLight: string;
    success: string;
    warning: string;
    danger: string;
    inverse: string;
  };
}

// export const lightTheme: AppTheme = {
//   colors: {
//     background: "#F5F5F5",
//     surface: "#FFFFFF",
//     surfaceSecondary: "#EEEEEE",
//     textPrimary: "#171717",
//     textSecondary: "#525252",
//     textMuted: "#A3A3A3",
//     border: "#E5E5E5",
//     primary: "#262626",
//     primaryLight: "#EAEAEA",
//     success: "#39845A",
//     warning: "#B7791F",
//     danger: "#C2413B",
//     inverse: "#FFFFFF",
//   },
// };

export const lightTheme: AppTheme = {
  colors: {
    background: "#F4F3F0",
    surface: "#FAF9F6",
    surfaceSecondary: "#EFEEE9",
    textPrimary: "#20201F",
    textSecondary: "#666560",
    textMuted: "#999891",
    border: "#E6E4DE",
    primary: "#262626",
    primaryLight: "#EAE9E4",
    success: "#39845A",
    warning: "#B7791F",
    danger: "#C2413B",
    inverse: "#FFFFFF",
  },
};

export const darkTheme: AppTheme = {
  colors: {
    background: "#010101",
    surface: "#171719",
    surfaceSecondary: "#222224",
    textPrimary: "#F5F5F5",
    textSecondary: "#B0B0B5",
    textMuted: "#85858B",
    border: "#303033",
    primary: "#F5F5F5",
    primaryLight: "#29292B",
    success: "#72B58A",
    warning: "#DDB66B",
    danger: "#E77C7C",
    inverse: "#111111",
  },
};
