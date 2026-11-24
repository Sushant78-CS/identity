import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAppTheme } from "@/theme/useAppTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LoginRole = "student" | "staff";
type Field = "collegeCode" | "studentId" | "email" | "password";
type LoginErrors = Partial<Record<Field, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  const { theme } = useAppTheme();
  const colors = theme.colors;
  const loginStudent = useAuthStore((state) => state.loginStudent);
  const loginStaff = useAuthStore((state) => state.loginStaff);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const role: LoginRole = params.role === "staff" ? "staff" : "student";
  const isStudent = role === "student";

  const [values, setValues] = useState<Record<Field, string>>({
    collegeCode: "",
    studentId: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});

  // Updates a field and clears its error while typing
  const setField = (field: Field) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: LoginErrors = {};

    if (isStudent) {
      if (!values.collegeCode.trim()) {
        next.collegeCode = "College code is required";
      }
      if (!values.studentId.trim()) {
        next.studentId = "Student ID is required";
      }
    } else if (!values.email.trim()) {
      next.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!values.password) {
      next.password = "Password is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError(null);

    try {
      if (isStudent) {
        await loginStudent({
          collegeCode: values.collegeCode.trim(),
          studentId: values.studentId.trim(),
          password: values.password,
        });
      } else {
        await loginStaff({
          email: values.email.trim(),
          password: values.password,
        });
      }

      // No manual navigation needed.
      // Stack.Protected will open the correct dashboard.
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password recovery will be available after backend integration.",
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "left", "right", "bottom"]}
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pt-4 pb-8"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header: back button left, title truly centered */}
          <View className="h-11 items-center justify-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="absolute left-0 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <ArrowLeft size={21} color={colors.textPrimary} />
            </Pressable>

            <AppText className="text-[23px] font-extrabold tracking-tight">
              {isStudent ? "Student Login" : "Staff Login"}
            </AppText>
          </View>

          {/* Introduction */}
          <AppText
            className="mt-8 text-center text-sm leading-[22px]"
            color="secondary"
          >
            {isStudent
              ? "Sign in to access your digital campus identity."
              : "Sign in to access your staff account."}
          </AppText>

          {/* Login Form */}
          <View className="mt-8 gap-5">
            {isStudent ? (
              <>
                <AppInput
                  label="College Code"
                  placeholder="Enter your college code"
                  value={values.collegeCode}
                  onChangeText={setField("collegeCode")}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.collegeCode}
                />

                <AppInput
                  label="Student ID"
                  placeholder="Enter your student ID"
                  value={values.studentId}
                  onChangeText={setField("studentId")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.studentId}
                />
              </>
            ) : (
              <AppInput
                label="Email Address"
                placeholder="Enter your email address"
                value={values.email}
                onChangeText={setField("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                error={errors.email}
              />
            )}

            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChangeText={setField("password")}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={errors.password}
            />

            {loginError ? (
              <View
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.danger + "15",
                }}
              >
                <AppText
                  className="text-[13px]"
                  style={{ color: colors.danger }}
                >
                  {loginError}
                </AppText>
              </View>
            ) : null}

            {/* Forgot Password */}
            <View className="items-end">
              <Pressable
                onPress={handleForgotPassword}
                hitSlop={8}
                accessibilityRole="button"
              >
                <AppText className="text-[13px] font-semibold">
                  Forgot password?
                </AppText>
              </Pressable>
            </View>

            {/* Sign In: compact, centered, larger text */}
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              className="mt-1 h-14 w-full flex-row items-center justify-center self-stretch rounded-xl"
              style={{
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <AppText className="text-xl font-bold" color="inverse">
                {isSubmitting ? "Signing in..." : "Sign In"}
              </AppText>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center pb-4">
            <AppText color="muted" className="text-[11px]">
              Identity • Campus Platform
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
