"use client"

import Link from "next/link"
import Image from "next/image"
import { useFormik } from "formik"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TextInput from "@/components/core/TextInput"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/hooks/auth.hook"
import { LoginValidation } from "@/validate/auth.validate"
import { useAuthStore } from "@/store/authStore"


const SignInForm = () => {
    const router = useRouter();
    const { mutateAsync, isPending: isLoginLoading } = useLogin();
    const { setAuth } = useAuthStore();
    const { handleChange, values, touched, errors, handleSubmit, resetForm } =
      useFormik({
        initialValues: {
          email: "",
          password: "",
        },
        validationSchema: LoginValidation,
        onSubmit: async (data) => {
          try {
            const payload = {
              email: data.email,
              password: data.password,
            };
            const result = await mutateAsync(payload);
            if(result.success) {
              if (result.user && result.token) {
                setAuth({
                  user: result.user,
                  token: result.token,
                });
              }
              toast.success(`${result.message}`);
              resetForm();
              router.push('/');
            } else {
              toast.error(result.message);
            }
          } catch (error: any) {
            error.errors.forEach((key: { attr: string; detail: string }) => {
              toast.error(`${key?.attr} - ${key?.detail}`);
            });
          }
        },
      });
  
    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <Label htmlFor="email" className="text-sm mx-3 text-white/60">Enter Your Email</Label>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={values.email}
                    error={Boolean(errors.email) && touched.email ? errors.email : undefined}
                    placeholder="Your email"
                />
                <Label htmlFor="password" className="text-sm mx-3 text-white/60">Enter Your Password</Label>
                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    value={values.password}
                    error={Boolean(errors.password) && touched.password ? errors.password : undefined}
                    placeholder="Password"
                />
                <div className="mt-5">
                    <Button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full h-11 cursor-pointer rounded-full bg-white hover:bg-t-orange-light text-black font-semibold"
                    >
                        {isLoginLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

const Page = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-t-gray px-4">
            <div className="w-full max-w-sm rounded-[32px] bg-t-black p-8 text-white shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-4 border-white">
                <div className="flex flex-col space-y-6">
                    <Link href="/" className="cursor-pointer w-fit mx-auto flex items-center gap-3">
                        <div>
                            <Image className="w-7 h-7" src="/logo/short-logo1.png" alt="logo" width={300} height={300} />
                        </div>
                        <p className="text-white text-xl -mx-3 ">tascape</p>
                    </Link>
                    <p className="text-2xl font-semibold text-center">Yooo, welcome back!</p>
                    <SignInForm />
                    <div className="tex-center  w-full ">
                        <p className="text-center text-white/60">or</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-center text-white/60">
                            First time here? <Link href="/sign-up" className="mx-1 font-semibold cursor-pointer text-t-orange-light">Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page